import { useState } from "react";

import { toast } from "@/hooks/use-toast";

interface ApiError {
  type: "network" | "server" | "timeout" | "unknown";

  message: string;

  status?: number;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error: any): ApiError => {
    let apiError: ApiError;

    if (!navigator.onLine) {
      apiError = {
        type: "network",

        message: "No internet connection available",
      };
    } else if (error.name === "AbortError" || error.code === "ECONNABORTED") {
      apiError = {
        type: "timeout",

        message: "Request timeout - please try again",
      };
    } else if (error.response) {
      // Server responded with error status

      apiError = {
        type: "server",

        message: error.response.data?.message || "Server error occurred",

        status: error.response.status,
      };
    } else if (error.request) {
      // Network error

      apiError = {
        type: "network",

        message: "Unable to reach server - check your connection",
      };
    } else {
      // Unknown error

      apiError = {
        type: "unknown",

        message: error.message || "An unexpected error occurred",
      };
    }

    setError(apiError);

    // Show toast notification

    toast({
      title: "Error",

      description: apiError.message,

      variant: "destructive",
    });

    return apiError;
  };

  const clearError = () => setError(null);

  const executeWithErrorHandling = async <T,>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);

      setError(null);

      const result = await apiCall();

      return result;
    } catch (err) {
      handleError(err);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,

    isLoading,

    handleError,

    clearError,

    executeWithErrorHandling,
  };
};
