import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
export const WorkspaceLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
