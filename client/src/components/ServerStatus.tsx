import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { usePingServer } from "@/lib/api";

const ServerStatus = () => {
  const { data, isLoading, isError, refetch } = usePingServer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the component if there's an error
    if (isError) {
      setVisible(true);
    }
  }, [isError]);

  // Hide the component after successful connection
  useEffect(() => {
    if (data?.ok && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data?.ok, visible]);

  if (!visible && !isError) {
    return null;
  }

  return (
    <Alert 
      className={`fixed bottom-4 right-4 w-auto max-w-md shadow-lg animate-in fade-in slide-in-from-bottom-5 z-50 ${
        data?.ok ? "bg-green-50 text-green-800 border-green-200" : 
        isError ? "bg-red-50 text-red-800 border-red-200" : 
        "bg-amber-50 text-amber-800 border-amber-200"
      }`}
    >
      <div className="flex items-center space-x-2">
        {data?.ok ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : isError ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : (
          <RefreshCw className={`h-5 w-5 text-amber-600 ${isLoading ? "animate-spin" : ""}`} />
        )}
        
        <div className="flex-1">
          <AlertTitle>
            {data?.ok 
              ? "Connected" 
              : isError 
              ? "Connection Error" 
              : "Checking Connection..."}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {data?.ok 
              ? "Successfully connected to the server" 
              : isError 
              ? "Could not connect to the server. Make sure the backend is running." 
              : "Checking connection to the server..."}
          </AlertDescription>
        </div>
        
        {isError && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default ServerStatus;
