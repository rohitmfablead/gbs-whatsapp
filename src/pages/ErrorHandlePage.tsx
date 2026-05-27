import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
  error?: {
    type?: "network" | "server" | "timeout" | "unknown",
    message?: string,
    status?: number,
  };
  onRetry?: () => void;
}

const ErrorHandlePage = ({ error, onRetry }: ErrorPageProps) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (error?.type) {
      case "network":
        return {
          icon: <Wifi className="h-16 w-16 text-destructive" />,
          title: "Connection Problem",
          message:
            "Unable to connect to server. Please check your internet connection.",
        };
      case "server":
        return {
          icon: <AlertTriangle className="h-16 w-16 text-destructive" />,
          title: "Server Error",
          message:
            error.message || `Server returned error ${error.status || 500}`,
        };
      case "timeout":
        return {
          icon: <RefreshCw className="h-16 w-16 text-destructive" />,
          title: "Request Timeout",
          message: "The request took too long to complete. Please try again.",
        };
      default:
        return {
          icon: <AlertTriangle className="h-16 w-16 text-destructive" />,
          title: "Something went wrong",
          message:
            error?.message ||
            "An unexpected error occurred while fetching data.",
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">{errorContent.icon}</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {errorContent.title}
          </h1>
          <p className="text-muted-foreground">{errorContent.message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>

        {error?.status && (
          <div className="text-sm text-muted-foreground">
            Error Code: {error.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorHandlePage;
