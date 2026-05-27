// src/contexts/ErrorContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const ErrorContext = createContext();
export const errorContextRef = { current: null }; // global ref

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  useEffect(() => {
    errorContextRef.current = { setError, clearError };
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
