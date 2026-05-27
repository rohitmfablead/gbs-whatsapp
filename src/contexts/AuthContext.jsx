import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("whatsapp_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);

    // Mock authentication - replace with actual API call
    const foundUser = storedUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(
        "whatsapp_user",
        JSON.stringify(userWithoutPassword)
      );
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const register = async (fullName, email, password) => {
    setIsLoading(true);

    // Check if user already exists
    if (storedUsers.find((u) => u.email === email)) {
      setIsLoading(false);
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // In real app, this should be hashed
    };

    storedUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("whatsapp_user", JSON.stringify(userWithoutPassword));

    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("whatsapp_user");
  };

  const updateProfile = async (fullName, email) => {
    if (!user) return false;

    setIsLoading(true);

    // Mock update - replace with actual API call
    const updatedUser = { ...user, fullName, email };
    setUser(updatedUser);

    setIsLoading(false);
    return true;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return false;

    setIsLoading(true);

    // Mock password change - replace with actual API call
    const userIndex = storedUsers.findIndex((u) => u.id === user.id);

    if (
      userIndex !== -1 &&
      storedUsers[userIndex].password === currentPassword
    ) {
      storedUsers[userIndex].password = newPassword;
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
