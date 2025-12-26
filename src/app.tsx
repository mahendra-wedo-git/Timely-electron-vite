import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { WorkLogPage } from "./pages/WorkLog";
import { ProjectsPage } from "./pages/Projects";
import { AnalyticsPage } from "./pages/Analytics";
import { SettingsPage } from "./pages/Settings";
import { AuthWrapper } from "./components/root/Auth/AuthWrapper";
import { DashboardPage } from "./pages/Dashboard";
import { ChatPage } from "./pages/Chat";
import { WorkspaceLayout } from "./workspaceLayout";
import { isElectron } from "./utils";

const App = () => {
  const isLogin = Boolean(localStorage.getItem("userEmail"));
  const [initialRoute, setInitialRoute] = useState("");
  const [loading, setLoading] = useState(true); // State to handle loading
  const localRoute = localStorage.getItem("lastRoute");
  const workspace = localStorage.getItem("workspace") || "wedo";
  useEffect(() => {
    const fetchRoute = async () => {
      const lastRoute = await window.api.getStore("lastRoute");
      console.log("lastRoute from electron store", lastRoute);

      // If lastRoute exists in the electron store, update the state
      if (lastRoute) {
        setInitialRoute(lastRoute);
      } else {
        // Otherwise, fallback to localStorage lastRoute or workspace dashboard
        setInitialRoute(localRoute || `/${workspace}/dashboard`);
      }

      // Stop loading after fetching the route
      setLoading(false);
    };

    fetchRoute();
    // setInterval(() => {
    //   console.log("isElectron >>.", isElectron());
    //   if (isElectron()) {
    //     // window.api?.showNotification({
    //     //   title: "Final Test",
    //     //   body: "OS notification is working 🎉",
    //     // });
    //   }
    // }, 10000);
  }, [workspace]);

  // Render a loading screen if initialRoute is not set yet
  // if (loading) {
  //   return <div>Loading...</div>; // Or you can use a spinner or any loading UI
  // }

  return isLogin ? (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={initialRoute || `/${workspace}/dashboard`} replace />
        }
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
