import { Outlet } from "react-router-dom";
import Sidebar from "./components/root/Sidebar/Sidebar";
import { ChatSocketContainer } from "./components";
import { ChatSocketProvider } from "./context/chatContext";
export const WorkspaceLayout = () => {
  return (
    <ChatSocketProvider>
      <div className="app-container">
        <ChatSocketContainer />
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ChatSocketProvider>
  );
};
