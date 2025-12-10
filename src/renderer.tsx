import { createRoot } from "react-dom/client";
import App from "./app";
import "./app.css";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { RootContextProvider } from "./context/rootContextProvider";
const isProd = process.env.NODE_ENV === "production";
const Router = isProd ? HashRouter : BrowserRouter;
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <Router>
    <RootContextProvider>
      <App />
           <div
        style={{
          position: "fixed",
          bottom: "0px",
          right: "16px",
          zIndex: 9999,
          opacity: 0.4,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.69vw",
          color: "#050505ff",
          fontWeight: 400,
        }}
      >
        <span >Powered by</span>
        
        <img
          src="/src/assets/wedo_logo_black.webp"
          alt="Powered by WeDo"
          width="65vw"
          height="100vh"
          style={{ objectFit: "contain", display: "block" }}
        />
      </div>
    </RootContextProvider>
  </Router>
);