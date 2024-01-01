"use client";
import { useEffect } from "react";
import { useToast } from "./ui/use-toast";

const NetworkStatus = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Handle the offline event
    const handleOffline = () => {
      toast({
        title: "No Internet Connection",
        description: "You are offline. Check your network connection.",
        variant: "destructive",
      });
    };

    // Handle the online event
    const handleOnline = () => {
      toast({
        title: "Back Online",
        description: "Internet connection restored.",
        variant: "default",
      });
    };

    // Add event listeners
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [toast]);

  return null;
};

export default NetworkStatus;
