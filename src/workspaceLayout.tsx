import { Outlet } from "react-router-dom";
import Sidebar from "./components/root/Sidebar/Sidebar";
import { ChatSocketContainer } from "./components";
export const WorkspaceLayout = () => {
  return (
    <div className="app-container">
      <ChatSocketContainer />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
