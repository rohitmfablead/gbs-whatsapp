import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, User, LogOut, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, getProfile } from "../../features/auth/authSlice";

export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.auth);
  // const { balance } = useSelector((state) => state.credits);
  const token = localStorage.getItem("token");
  console.log(profile);
  useEffect(() => {
    if (token) dispatch(getProfile(token));
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfile = () => navigate("/profile");
  const handlePackage = () => navigate("/plan-history");

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center space-x-0">
        {/* Mobile menu icon (only on mobile) */}
        <div
          onClick={onMenuClick}
          className="lg:hidden cursor-pointer p-0 rounded-md hover:bg-muted transition"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </div>
      </div>

      {/* Center marquee message */}
      {/* <div className="hidden lg:block md:block overflow-hidden relative w-screen h-6 mx-5">
        <div className="absolute whitespace-nowrap animate-marquee font-medium text-muted-foreground">
          WhatsApp Business Message Charges (Marketing ₹0.78 | Utility ₹0.12 |
          OTP ₹0.12 | Service Free)
        </div>
      </div> */}

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {profile?.activePackage && (
          <Button
            variant="ghost"
            size="sm"
            className="
      bg-gradient-to-r from-[#0B2D8C] to-[#1E3DB8]
      text-white font-semibold
      px-5 py-2 rounded-lg
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
      transition-all duration-300
      flex items-center gap-2
    "
            onClick={() => navigate("/plan-history")}
          >
            <Package className="h-4 w-4" />
            <span className="truncate">
              {profile?.activePackage?.packageName}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-blue-900 rounded-full">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile?.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {profile?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "W"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleProfile}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handlePackage}
              className="cursor-pointer"
            >
              <Package className="mr-2 h-4 w-4" />
              Package Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
