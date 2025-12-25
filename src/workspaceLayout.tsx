import { Outlet } from "react-router-dom";
import Sidebar from "./components/root/Sidebar/Sidebar";
import { ChatSocketContainer } from "./components";
import { ChatSocketProvider } from "./context/chatContext";
import { useLastRoute } from "./hooks/useLastRoutes";
export const WorkspaceLayout = () => {
  useLastRoute();
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
