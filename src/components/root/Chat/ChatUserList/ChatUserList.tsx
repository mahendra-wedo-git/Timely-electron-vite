import { FC, useState } from "react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
}
interface IChatUser {
  setSelectedChat: (chat: Chat) => void;
  selectedChat: Chat | null;
  searchQuery: string;
}
export const ChatUserList: FC<IChatUser> = ({
  selectedChat,
  setSelectedChat,
  searchQuery,
}) => {
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      name: "Admin Timely",
      avatar: "AT",
      lastMessage: "sfdgfg",
      timestamp: "26/11",
      isOnline: true,
    },
    {
      id: "2",
      name: "Vyom Patel",
      avatar: "VP",
      lastMessage: "You: hi",
      timestamp: "26/11",
      isOnline: true,
    },
    {
      id: "3",
      name: "Niraj Parmar",
      avatar: "NP",
      lastMessage: "You: 123",
      timestamp: "26/11",
      isOnline: false,
    },
  ]);
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredChats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => setSelectedChat(chat)}
          className={`w-full p-4 flex items-center hover:bg-gray-50 transition ${
            selectedChat?.id === chat.id ? "bg-gray-100" : ""
          }`}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {chat.avatar}
            </div>
            {chat.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3 flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {chat.name}
              </h3>
              <span className="text-xs text-gray-500">{chat.timestamp}</span>
            </div>
            <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
