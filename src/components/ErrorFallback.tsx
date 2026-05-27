import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorFallback = ({ }) => {
  const navigate = useNavigate();
const resetErrorBoundary = () => {
    navigate(0); // Refresh the page
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-800">Something went wrong</h1>
      <div className="flex gap-4">
        <Button variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
