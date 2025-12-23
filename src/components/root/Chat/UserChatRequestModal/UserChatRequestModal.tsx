import React, { FC, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { WorkspaceService } from "src/services/workspace.service";
import { useParams } from "react-router-dom";
import { IUserLite } from "src/types";
import { useChatSocket } from "src/context/chatContext";
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
interface workspaceMember {
  member: User;
}

interface AddChatModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  users: User[];
  isOpen: boolean;
  handleSendRequest: (user: IUserLite) => void;
  sendingTo: string | null;
}

const workspaceService = new WorkspaceService();
export const AddChatModal: FC<AddChatModalProps> = ({
  isOpen,
  users,
  setIsOpen,
  handleSendRequest,
  sendingTo,
}) => {
  // const chatSocketService = useChatSocket();
  const [searchQuery, setSearchQuery] = useState("");
  // const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { workspace } = useParams();
  console.log("usersusersusers",users)
  // const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   const fetchMembers = async () => {
  //     try {
  //       const members: any = await workspaceService.fetchWorkspaceMembers(
  //         workspace as string
  //       );
  //       setUsers(members);
  //       console.log("members", members);
  //     } catch (error) {
  //       console.log("errorrrr", error);
  //     }
  //   };

  //   fetchMembers();
  // }, [workspace]);

  const filteredUsers =
    users?.filter(
      (user: any) =>
        user.member.first_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.member.last_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  // console.log("filteredUsers", filteredUsers);
  //   const filteredUsers = users?.filter(
  //     (user: any) =>
  //       user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  //   ) || [];

  // const handleSendRequest = async (user: IUserLite) => {
  //   setSendingTo(user.id);
  //   const newMsg = {
  //     type: "group",
  //     intend: "create",
  //     is_private: true,
  //     members: [user.id],
  //   };
  //   chatSocketService?.send(newMsg);
  //   // Simulate API call
  //   setTimeout(() => {
  //     console.log("Chat request sent to user:", user.id);
  //     setSendingTo(null);
  //     handleClose();
  //     // You can add success notification here
  //   }, 1000);
  // };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pt-4 px-6">
          <div>
            <h3 className="text-sm capitalize text-gray-900">
              Send Chat Request
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Send a chat request to the member below to start a conversation.
            </p>
          </div>
          {/* <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Search Box */}
        <div className="py-3 px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((userList: any) => {
                const user = userList.member;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full bg-indigo-600  flex items-center justify-center text-white  font-semibold text-sm flex-shrink-0`}
                      >
                        {user.avatar
                          ? user.avatar
                          : user.display_name.charAt(0)}
                      </div>

                      <div className="ml-3 min-w-0 flex-1">
                        <h3 className="text-xs font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user)}
                      disabled={sendingTo === user.id}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {sendingTo === user.id ? "Sending..." : "Send"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-gray-500">No members found</p>
            </div>
          )}
        </div>

        {/* Footer (Optional) */}
        <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "member" : "members"} available
          </p>
        </div>
      </div>
    </div>
  );
};
