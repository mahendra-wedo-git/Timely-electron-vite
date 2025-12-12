import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Home,
  ClipboardList,
  FolderKanban,
  Settings,
  Users,
  ChartBar,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { AuthService } from "src/services";
import { useAppContext } from "src/context";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}
const authService = new AuthService();

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace } = useParams();
  console.log("workspace", workspace);
  const { currentUser } = useAppContext();
  // const workspace = localStorage.getItem("workspace") || "wedo";
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home />,
      path: `/${workspace}/dashboard`,
    },
    {
      id: "worklog",
      label: "Work Log",
      icon: <ClipboardList />,
      path: `/${workspace}/worklog`,
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FolderKanban />,
      path: `/${workspace}/projects`,
    },
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare />,
      path: `/${workspace}/chat`,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <ChartBar />,
      path: `/${workspace}/analytics`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings />,
      path: `/${workspace}/settings`,
    },
  ];

  const handleNavClick = (path: string): void => {
    navigate(path);
  };
  const handleLogout = async () => {
    await authService.signOut("").then(() => {
      navigate("/login");
      localStorage.clear();
      window.location.reload();
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">T</div>
          <h2>{workspace}</h2>
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
          <div className="user-avatar">
            {currentUser?.first_name?.split("")[0] || "M"}
          </div>
          <div className="user-info">
            <div className="user-name">
              {currentUser?.first_name || "user" + " " + currentUser?.last_name}
            </div>
            <div className="user-status">Online</div>
          </div>
          <div onClick={handleLogout}>
            <LogOut />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
