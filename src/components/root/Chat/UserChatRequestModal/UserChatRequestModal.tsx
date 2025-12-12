import React, { FC, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { WorkspaceService } from "src/services/workspace.service";
import { useParams } from "react-router-dom";
import { useUser } from "src/context";
import { IUserLite } from "src/types";
import { ChatSocketService } from "src/services";
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

const chatSocketService = new ChatSocketService();

interface AddChatModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

const workspaceService = new WorkspaceService();
export const AddChatModal: FC<AddChatModalProps> = ({ isOpen, setIsOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { workspace } = useParams();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members: any = await workspaceService.fetchWorkspaceMembers(
          workspace as string
        );
        setUsers(members);
        console.log("members", members);
      } catch (error) {
        console.log("errorrrr", error);
      }
    };

    fetchMembers();
  }, [workspace]);

  //   const users: User[] = [
  //     {
  //       id: "1",
  //       name: "Wedo Admin",
  //       email: "admin@wedowebapps.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "2",
  //       name: "Andrea B",
  //       email: "andrea@wedowebapps.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "3",
  //       name: "Ayush Sadhu",
  //       email: "ayushsadhu6153@gmail.com",
  //       avatar: "A",
  //       avatarColor: "bg-indigo-600",
  //     },
  //     {
  //       id: "4",
  //       name: "Bhagy Detroja",
  //       email: "bhagy.wedowebapps@gmail.com",
  //       avatar: "B",
  //       avatarColor: "bg-indigo-700",
  //     },
  //     {
  //       id: "5",
  //       name: "Bhavesh Rajpurohit",
  //       email: "bhaveshr.wedowebapps@gmail.com",
  //       avatar: "B",
  //       avatarColor: "bg-indigo-700",
  //     },
  //     {
  //       id: "6",
  //       name: "Chirag Patel",
  //       email: "chirag@wedowebapps.com",
  //       avatar: "C",
  //       avatarColor: "bg-blue-600",
  //     },
  //     {
  //       id: "7",
  //       name: "Darshan Shah",
  //       email: "darshan@wedowebapps.com",
  //       avatar: "D",
  //       avatarColor: "bg-purple-600",
  //     },
  //     {
  //       id: "8",
  //       name: "Esha Modi",
  //       email: "esha@wedowebapps.com",
  //       avatar: "E",
  //       avatarColor: "bg-pink-600",
  //     },
  //     {
  //       id: "9",
  //       name: "Foram Patel",
  //       email: "foram@wedowebapps.com",
  //       avatar: "F",
  //       avatarColor: "bg-green-600",
  //     },
  //     {
  //       id: "10",
  //       name: "Gaurav Kumar",
  //       email: "gaurav@wedowebapps.com",
  //       avatar: "G",
  //       avatarColor: "bg-yellow-600",
  //     },
  //   ];

  const filteredUsers =
    users?.filter(
      (user: any) =>
        user.member.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.member.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  console.log("filteredUsers", filteredUsers);
  //   const filteredUsers = users?.filter(
  //     (user: any) =>
  //       user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  //   ) || [];

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
    setTimeout(() => {
      console.log("Chat request sent to user:", user.id);
      setSendingTo(null);
      // You can add success notification here
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Send Chat Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Send a chat request to the member below to start a conversation.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
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
                        className={`w-10 h-10 rounded-full bg-indigo-600  flex items-center justify-center text-white  font-semibold text-sm flex-shrink-0`}
                      >
                        {user.avatar
                          ? user.avatar
                          : user.display_name.charAt(0)}
                      </div>

                      <div className="ml-3 min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.display_name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user)}
                      disabled={sendingTo === user.id}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {sendingTo === user.id ? "Sending..." : "Send"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No members found</p>
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
