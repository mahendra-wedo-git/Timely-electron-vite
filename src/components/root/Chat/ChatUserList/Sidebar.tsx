import { Plus, Search, Users } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { ChatUserList } from "./ChatUserList";
import { AddChatModal } from "../UserChatRequestModal";
import { useParams } from "react-router-dom";
import {
  fetchGroups,
  selectAllGroups,
  selectGroupById,
  setSelectedGroup,
} from "src/redux/chatSlice";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { IChatGroup, IChatMessage, IUserLite } from "src/types";
import { useChatSocket } from "src/context/chatContext";
import { CreateGroupModal } from "../CreateGroup/CreateGroup";
import { WorkspaceService } from "src/services/workspace.service";
import {
  fetchWorkspaceMembers,
  selectWorkspaceMemberDetails,
  selectWorkspaceMemberMap,
} from "src/redux/workspaceMemberSlice";
interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
}
interface ISidebarChat {
  setSelectedChat: (chat: IChatGroup) => void;
  selectedChat: IChatGroup | undefined;
  lastMessage: Record<string, IChatMessage>;
}

interface User {
  avatar: string;
  avatar_url: null;
  display_name: string;
  email: string;
  first_name: string;
  id: string;
  is_bot: false;
  last_login_medium: string;
  last_name: string;
}
const workspaceService = new WorkspaceService();
export const SidebarChat: FC<ISidebarChat> = ({
  selectedChat,
  setSelectedChat,
  lastMessage
}) => {
  const { workspace: workspaceSlug } = useParams();
  const chatSocketService = useChatSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [userListModalOpen, setUserListModalOpen] = useState(false);
  const [groupListModalOpen, setGroupListModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const groups: any = useAppSelector(selectAllGroups);
  // const selectedChatGroup = useAppSelector((state) => selectGroupById(state, selectedChat?.id));

//  for workspcae members
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      if(users.length > 0) return
      try {
        const members: any = await workspaceService.fetchWorkspaceMembers(
          workspaceSlug as string
        );
        setUsers(members);
      } catch (error) {
        console.log("errorrrr", error);
      }
    };

    fetchMembers();
  }, [workspaceSlug]);

  // const lastMessage = useAppSelector((state) => selectLastMessage(state));
  // const users = useAppSelector((state) => selectWorkspaceMemberMap(state, workspaceSlug as string));
    useEffect(() => {
      if (!workspaceSlug) return;
      // fetchWorkspaceMember(workspaceSlug);
      dispatch(fetchWorkspaceMembers(workspaceSlug));
    }, [workspaceSlug]);
  const [chatUsers, setChatUsers] = useState(groups || []);
  const onSelect = (groupId: string) => {
    dispatch(setSelectedGroup(groupId));
  };

  const handleSendRequest = async (user: IUserLite) => {
    setSendingTo(user.id);
    const newMsg = {
      type: "group",
      intend: "create",
      is_private: true,
      members: [user.id],
    };
    chatSocketService?.send(newMsg);
    // Simulate API call
    // setTimeout(() => {
      setSendingTo(null);
      setUserListModalOpen(false);
      // dispatch(fetchGroups(workspaceSlug as string));
      // dispatch(setSelectedGroup(workspaceSlug as string));
      // You can add success notification here
    // }, 1000);
  };

  const handleCreateGroup = () => {
    setGroupListModalOpen(true);
  };

  useEffect(() => {
    if (!workspaceSlug) return;
    dispatch(fetchGroups(workspaceSlug));
    // dispatch(setSelectedGroup(workspaceSlug));
    // setChatUsers(groups);
  }, [workspaceSlug, dispatch]);
  // // const loader = useAppSelector((s) => s.chat.loader);

  // useEffect(() => {
  //   if (!workspaceSlug) return;
  //   dispatch(fetchGroups(workspaceSlug));
  // }, [workspaceSlug]);

  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!workspaceSlug) return;
  //   const getChatUserList = async () => {
  //     try {
  //       const AllChats:any = await dispatch(fetchGroups(workspaceSlug));
  //       console.log("AllChatsAllChats", AllChats);
  //       setChatUsers(AllChats);
  //     } catch (error) {
  //       console.error("Error fetching chat user list:", error);
  //     }
  //   };
  //   getChatUserList();
  // }, [workspaceSlug]);

  //   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const pinnedGroups = groups && groups.filter((group: any) => group.is_pinned);
  const recentGroups =
    groups && groups.filter((group: any) => !group.is_pinned);
  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
        </div>
        <div className="overflow-y-auto">
          {pinnedGroups.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50">
                <button className="text-xs text-gray-600 flex items-center">
                  <span className="mr-1">▼</span> Pin
                </button>
              </div>
              <div className="flex ">
                <ChatUserList
                  groups={pinnedGroups}
                  lastMessage={lastMessage}
                  selectedChat={selectedChat}
                  setSelectedChat={setSelectedChat}
                  searchQuery={searchQuery}
                />
              </div>
            </>
          )}

        {/* Recent Label */}
    {recentGroups.length > 0 && (
      <>
        <div className="px-4 py-2 bg-gray-50">
          <button className="text-xs text-gray-600 flex items-center">
            <span className="mr-1">▼</span> Recent
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1">
          <ChatUserList
            groups={recentGroups}
            lastMessage={lastMessage}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            searchQuery={searchQuery}
          />
        </div>
      </>
    )}
  </div>
        {/* Bottom Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2 mt-auto">
          <button
            onClick={() => setUserListModalOpen(true)}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chat
          </button>
          <button
            onClick={() => setGroupListModalOpen(true)}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Create Group
          </button>
        </div>
      </div>

      {userListModalOpen && (
        <AddChatModal
          isOpen={userListModalOpen}
          users={users}
          setIsOpen={setUserListModalOpen}
          handleSendRequest={handleSendRequest}
          sendingTo={sendingTo}
        />
      )}
      {groupListModalOpen && (
        <CreateGroupModal
          isOpen={groupListModalOpen}
          setIsOpen={setGroupListModalOpen}
          users={users}
        />
      )}
    </>
  );
};
