// src/pages/ErrorPage.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useError } from "../contexts/ErrorContext";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const { error, clearError } = useError();
  const navigate = useNavigate();

  if (!error) return null;

  const handleGoDashboard = () => {
    clearError();
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center  p-6">
      <div className="bg-white w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-[hsl(var(--primary))]" />
        </div>

        <h1 className="text-3xl font-bold text-[hsl(var(--primary))] mb-3">
          Something went wrong
        </h1>
        <p className="text-[hsl(var(--primary))] mb-6 leading-relaxed">
          {error || "An unexpected error occurred. Please try again."}
        </p>

        <Button
          onClick={handleGoDashboard}
          className="bg-[hsl(var(--primary))] text-white px-6 py-2 hover:bg-[hsl(var(--primary-hover))]"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
