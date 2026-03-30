import React, { useEffect } from "react";
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
import { useAppDispatch } from "src/redux/hooks";
import { useSelector } from "react-redux";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { getFileIcon } from "src/assets/attachment";
import { getFileURL } from "src/utils";
import { fetchWorkspaceMembers } from "src/redux/workspaceMemberSlice";
import TimelyLogo from "../../../assets/timely-logos/blue-without-text.png";
import { Image } from "react-bootstrap";

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
  const dispatch = useAppDispatch();
  const memberDetails = useSelector(selectMemberMap)[currentUser?.id || ""];
    useEffect(() => {
      if (!workspace) return;
      dispatch(fetchWorkspaceMembers(workspace));
    }, [workspace]);
  // const workspace = localStorage.getItem("workspace") || "wedo";
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home />,
      path: `/${workspace}/dashboard`,
    },
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare />,
      path: `/${workspace}/chat`,
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
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: <ChartBar />,
    //   path: `/${workspace}/analytics`,
    // },
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: <Settings />,
    //   path: `/${workspace}/settings`,
    // },
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
          {/* <div className="logo-icon">T</div> */}
          <div className="logo-icon"><Image src={TimelyLogo} sizes="100vw" width={40} height={40} alt="Timely Logo" /></div>
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
          {memberDetails?.avatar_url ? (
            <img
              src={getFileURL(memberDetails?.avatar_url)}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="user-avatar">
              {memberDetails?.first_name?.split("")[0] || "M"}
            </div>
          )}
          <div className="user-info">
            <div className="user-name">
              {memberDetails?.first_name || "" + " " + memberDetails?.last_name || ""}
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
