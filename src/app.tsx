import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { Route, Routes } from "react-router-dom";
import { WorkLogPage } from "./pages/WorkLog";
import { ProjectsPage } from "./pages/Projects";
import { AnalyticsPage } from "./pages/Analytics";
import { SettingsPage } from "./pages/Settings";
import { TimelyLogin } from "./components/Login";

const App = () => {
  // const isLogin = localStorage.getItem("userEmail") ? true : false;
  // return (
  //   <>
  //     {/* routing changes */}
  //     <div className="app-container">
  //       {isLogin && (
  //         <>
  //           <Sidebar />
  //           <Routes>
  //             <Route path="/" element={<TimelyLogin />} />
  //             <Route path="/login" element={<TimelyLogin />} />
  //           </Routes>
  //         </>
  //       )}

  //       <main className="main-content">
  //         <Routes>
  //           <Route path="/" element={<Dashboard />} />
  //           <Route path="/login" element={<TimelyLogin />} />
  //           <Route path="/dashboard" element={<Dashboard />} />
  //           <Route path="/worklog" element={<WorkLogPage />} />
  //           <Route path="/projects" element={<ProjectsPage />} />
  //           <Route path="/analytics" element={<AnalyticsPage />} />
  //           <Route path="/settings" element={<SettingsPage />} />
  //         </Routes>
  //       </main>
  //     </div>
  //   </>
  // );

  const isLogin = Boolean(localStorage.getItem("userEmail"));

  return (
    <div className="app-container">
      {isLogin ? (
        <>
          {/* Sidebar visible only when user is logged in */}
          <Sidebar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/worklog" element={<WorkLogPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className="main-content">
          <Routes>
            <Route path="*" element={<TimelyLogin />} />
          </Routes>
        </main>
      )}
    </div>
  );
};

export default App;
