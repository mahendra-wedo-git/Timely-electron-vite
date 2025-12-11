import { Plus, Search, Users } from "lucide-react";
import { FC, useState } from "react";
import { ChatUserList } from "./ChatUserList";
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
  setSelectedChat: (chat: Chat) => void;
  selectedChat: Chat | null;
}
export const SidebarChat: FC<ISidebarChat> = ({
  selectedChat,
  setSelectedChat,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  //   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  return (
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

      {/* Recent Label */}
      <div className="px-4 py-2 bg-gray-50">
        <button className="text-xs text-gray-600 flex items-center">
          <span className="mr-1">▼</span> Recent
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <ChatUserList
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          searchQuery={searchQuery}
        />
      </div>

      {/* Bottom Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Chat
        </button>
        <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center">
          <Users className="h-4 w-4 mr-2" />
          Create Group
        </button>
      </div>
    </div>
  );
};
