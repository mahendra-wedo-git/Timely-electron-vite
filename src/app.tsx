
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import WorkLog from './components/WorkLog';
import Projects from './components/Projects';
import Dashboard from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
import { Analytic } from './components/Analytic';
import { Settings } from './components/Settings';
import { WorkLogPage } from './pages/WorkLog';
import { ProjectsPage } from './pages/Projects';
import { AnalyticsPage } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import TimelyLogin from './components/Login';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';

const App = () => {
  // const [activePage, setActivePage] = useState('dashboard');

  // const renderPage = () => {
  //   switch (activePage) {
  //     case 'dashboard':
  //       return <Dashboard />;
  //     case 'worklog':
  //       return <WorkLog />;
  //     case 'projects':
  //       return <Projects />;
  //     case 'analytics':
  //       return <div className="page-placeholder">Analytics Coming Soon</div>;
  //     case 'settings':
  //       return <div className="page-placeholder">Settings Coming Soon</div>;
  //     default:
  //       return <Dashboard />;
  //   }
  // };

  return (
    <>
      {/* old changes */}
      {/* <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div> */}


      {/* routing changes */}
      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<TimelyLogin />} />
            <Route path="/login" element={<TimelyLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/worklog" element={<WorkLogPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;