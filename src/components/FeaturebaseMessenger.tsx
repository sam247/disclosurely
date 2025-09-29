import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Featurebase: any;
  }
}

const FeaturebaseMessenger = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Create and append the Featurebase SDK script
    const script = document.createElement('script');
    script.src = 'https://do.featurebase.app/js/sdk.js';
    script.id = 'featurebase-sdk';
    script.async = true;
    
    script.onload = () => {
      const win = window;
      
      // Initialize Featurebase if it doesn't exist
      if (typeof win.Featurebase !== "function") {
        win.Featurebase = function () {
          (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
        };
      }
      
      // Boot Featurebase messenger with configuration
      win.Featurebase("boot", {
        appId: "68daa23a53f0a6db2deee9b6",
        email: user?.email || undefined,
        userId: user?.id || undefined,
        theme: "light",
        language: "en",
      });
    };
    
    document.head.appendChild(script);
    
    // Cleanup function to remove script on unmount
    return () => {
      const existingScript = document.getElementById('featurebase-sdk');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [user]);

  return null; // This component doesn't render anything visible
};

export default FeaturebaseMessenger;