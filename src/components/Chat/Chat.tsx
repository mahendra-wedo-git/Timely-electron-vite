import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  File,
  Check,
  CheckCheck,
  Image,
} from "lucide-react";
import { SidebarChat } from "./ChatUserList";

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isRead?: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export const TimelyChat = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "current-user";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "2",
      senderName: "Vyom Patel",
      content: "hello",
      timestamp: new Date("2025-09-08T16:36:00"),
      type: "text",
      isRead: true,
    },
    {
      id: "2",
      senderId: "2",
      senderName: "Vyom Patel",
      content: "radhe radhe",
      timestamp: new Date("2025-09-08T16:36:30"),
      type: "text",
      isRead: true,
    },
    {
      id: "3",
      senderId: "2",
      senderName: "Vyom Patel",
      content: "😀",
      timestamp: new Date("2025-09-29T12:46:00"),
      type: "text",
      isRead: true,
    },
    {
      id: "4",
      senderId: "2",
      senderName: "Vyom Patel",
      content: "",
      timestamp: new Date("2025-11-19T14:38:00"),
      type: "file",
      fileName: "byc-student-panel-de...",
      fileSize: "707.53 KB",
      isRead: false,
    },
    {
      id: "5",
      senderId: currentUserId,
      senderName: "Mahendra Parmar",
      content: "hi",
      timestamp: new Date("2025-11-19T14:40:00"),
      type: "text",
      isRead: true,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: "Mahendra Parmar",
      content: message,
      timestamp: new Date(),
      type: "text",
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  //   const filteredChats = chats.filter((chat) =>
  //     chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat List */}
      <SidebarChat
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {selectedChat.avatar}
                </div>
                {selectedChat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3">
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedChat.name}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                Chat
              </button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Files
              </button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Photos
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => {
              const showTimestamp =
                index === 0 ||
                new Date(messages[index - 1].timestamp).toDateString() !==
                  new Date(msg.timestamp).toDateString();
              const isCurrentUser = msg.senderId === currentUserId;

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatTimestamp(msg.timestamp)
                          .split(" ")
                          .slice(0, 3)
                          .join(" ")}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start max-w-xl`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {selectedChat.avatar}
                        </div>
                      )}

                      <div className={`${isCurrentUser ? "mr-2" : "ml-2"}`}>
                        {!isCurrentUser && (
                          <p className="text-xs font-semibold text-gray-900 mb-1">
                            {msg.senderName}
                          </p>
                        )}

                        {msg.type === "text" && (
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isCurrentUser
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        )}

                        {msg.type === "file" && (
                          <div
                            className={`px-4 py-3 rounded-2xl border-2 ${
                              isCurrentUser
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-white border-indigo-600"
                            } flex items-center space-x-3`}
                          >
                            <File
                              className={`h-5 w-5 ${isCurrentUser ? "text-white" : "text-indigo-600"}`}
                            />
                            <div>
                              <p
                                className={`text-sm font-medium ${isCurrentUser ? "text-white" : "text-gray-900"}`}
                              >
                                {msg.fileName}
                              </p>
                              <p
                                className={`text-xs ${isCurrentUser ? "text-indigo-100" : "text-gray-500"}`}
                              >
                                {msg.fileSize}
                              </p>
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center mt-1 space-x-1 ${isCurrentUser ? "justify-end" : ""}`}
                        >
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                          {isCurrentUser &&
                            (msg.isRead ? (
                              <CheckCheck className="h-3 w-3 text-indigo-600" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-400" />
                            ))}
                        </div>
                      </div>

                      {/* {isCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          MP
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-gray-600">
                <Smile className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Image className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Plus className="h-5 w-5" />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No chat selected
            </h3>
            <p className="text-gray-500">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
