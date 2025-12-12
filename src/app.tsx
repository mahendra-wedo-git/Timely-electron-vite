import Sidebar from "./components/Sidebar/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import { WorkLogPage } from "./pages/WorkLog";
import { ProjectsPage } from "./pages/Projects";
import { AnalyticsPage } from "./pages/Analytics";
import { SettingsPage } from "./pages/Settings";
import { AuthWrapper } from "./components/Auth/AuthWrapper";
import { DashboardPage } from "./pages/Dashboard";
import { ChatPage } from "./pages/Chat";
import { WorkspaceLayout } from "./workspaceLayout";

const App = () => {
  const isLogin = Boolean(localStorage.getItem("userEmail"));
  const workspace = localStorage.getItem("workspace") || "wedo";

  return isLogin ? (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`/${workspace}/dashboard`} replace />}
      />

      {/* LAYOUT ROUTE */}
      <Route path="/:workspace" element={<WorkspaceLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="worklog" element={<WorkLogPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  ) : (
    <Routes>
      <Route path="*" element={<AuthWrapper />} />
    </Routes>
  );
};

export default App;
