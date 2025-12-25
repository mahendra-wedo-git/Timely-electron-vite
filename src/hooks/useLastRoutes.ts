import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useLastRoute = () => {
  const location = useLocation();

  useEffect(() => {
    const keys = Object.keys(localStorage);
    console.log("useLastRoute 111 keys", keys);
    // if (!window.api) return;
    if (!location.pathname) return;
    localStorage.setItem("lastRoute", location.pathname);
    console.log("useLastRoute 222", location);

    if (!window.api) {
      console.warn("Electron API not available yet");
      return;
    }

    window.api.setStore("lastRoute", location.pathname);
  }, [location.pathname]);
};
