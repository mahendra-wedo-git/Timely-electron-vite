import { createRoot } from "react-dom/client";
import App from "./app";
import "./app.css";
import { BrowserRouter, HashRouter } from "react-router-dom";
const isProd = process.env.NODE_ENV === "production";
const Router = isProd ? HashRouter : BrowserRouter;
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <Router>
    <App />
  </Router>
);