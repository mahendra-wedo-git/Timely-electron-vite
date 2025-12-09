import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  FolderKanban,
  Settings,
  Users,
  ChartBar,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home />, path: "/" },
    {
      id: "worklog",
      label: "Work Log",
      icon: <ClipboardList />,
      path: "/worklog",
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FolderKanban />,
      path: "/projects",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <ChartBar />,
      path: "/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings />,
      path: "/settings",
    },
  ];

  const handleNavClick = (path: string): void => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">T</div>
          <h2>Timely</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => handleNavClick(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">MP</div>
          <div className="user-info">
            <div className="user-name">Mahendra Parmar</div>
            <div className="user-status">Online</div>
            <div className="user-status" onClick={() => {
              localStorage.clear()
              navigate('/login')
              window.location.reload()
              }}>
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
