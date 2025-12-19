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
  ChartArea,
  ChartBar,
  User,
} from "lucide-react";
import { SidebarChat } from "./ChatUserList";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { v4 as uuidv4 } from "uuid";
import {
  selectCurrentSelectedGroup,
  selectGroupById,
} from "src/redux/chatSlice";
import { IChatGroup, IChatGroupLog, IChatMessage } from "src/types";
import { useParams } from "react-router-dom";
import { useChatSocket } from "src/context/chatContext";
import {
  addTemporaryMessage,
  fetchChatGroupLog,
  fetchChatMessage,
  fetchLastMessage,
  selectChatGroupLogDetails,
  selectChatMessageDetails,
  selectLastMessage,
} from "src/redux/massagesSlice";
import { groupChatData } from "src/utils";
import MessageArea from "./MessageArea";
import { ForwardMessageModal } from "./ForwordMessage/ForwordMessage";
import { GroupMembersModal } from "./GroupMemberModal/GroupMemberModal";

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

export const ChatWindow = () => {
  const [selectedChat, setSelectedChat] = useState<IChatGroup | undefined>(
    undefined
  );
  const [message, setMessage] = useState("");
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [selectedMassage, setSelectedMassage] = useState();
  const [uploadedAssetIds, setUploadedAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { workspace: workspaceSlug } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSocketService = useChatSocket();
  // const currentGroup = currentSelectedGroup[workspaceSlug as string];
  const selectedChatGroup = useAppSelector((state) =>
    selectedChat?.id !== undefined
      ? selectGroupById(state, selectedChat.id)
      : undefined
  );
  // const allMessages = getchatMessageDetails(currentChatId || "") || [];

  // const currentChatId = currentChat?.groupId;

  const currentSelectedGroup = useAppSelector((state) =>
    workspaceSlug ? selectCurrentSelectedGroup(state, workspaceSlug) : undefined
  );
  console.log("selectedMassageselectedMassage", selectedChatGroup);
  const currentChatId = currentSelectedGroup?.groupId;
  const receiverUserId = currentSelectedGroup?.userId;
  const groupName = currentSelectedGroup?.group_name;

  const lastMessage = useAppSelector((state) => selectLastMessage(state));

  const dispatch = useAppDispatch();
  const messages_ = useAppSelector(
    (state) =>
      workspaceSlug &&
      currentChatId &&
      selectChatMessageDetails(state, workspaceSlug, currentChatId)
  ) as IChatMessage[];
  const logs = useAppSelector((state) =>
    workspaceSlug && currentChatId
      ? selectChatGroupLogDetails(state, workspaceSlug, currentChatId)
      : undefined
  ) as IChatGroupLog[];

  const groupedMessages = groupChatData(messages_, logs);
  useEffect(() => {
    if (workspaceSlug && currentChatId) {
      dispatch(
        fetchChatMessage({
          workspaceSlug,
          chatId: currentChatId,
          params: { cursor: null },
        })
      );
      dispatch(fetchChatGroupLog({ workspaceSlug, chatId: currentChatId }));
    }
    if (workspaceSlug) dispatch(fetchLastMessage({ workspaceSlug }));
  }, [workspaceSlug, currentChatId, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (groupedMessages) {
      scrollToBottom();
    }
  }, [groupedMessages]);

  const deleteMassages = (message: any) => {
    chatSocketService?.send({
      type: "message",
      intent: "delete",
      message_id: message.id,
      group_id: message.group,
      sender: message.sender,
    });
  };

  const handleForward = (message: any) => {
    setSelectedMassage(message);
    setOpenForwardModal(true);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat || !chatSocketService) return;

    chatSocketService.send({
      type: "message",
      content: message || "",
      group_id: currentChatId,
      reply_to: receiverUserId,
      clientMessageId: uuidv4(),
      attachments: Array.from(uploadedAssetIds),
      browser_data: browserData,
    });

    setMessage("");
    setUploadedAssetIds(new Set());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //   const filteredChats = chats.filter((chat) =>
  //     chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  const browserData = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: { width: window.screen.width, height: window.screen.height },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat List */}
      <SidebarChat
        selectedChat={selectedChat}
        lastMessage={lastMessage}
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
                  {selectedChat.group_name.charAt(0)}
                </div>
                {/* {selectedChat.isOnline && ( */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                {/* )} */}
              </div>
              <div className="ml-3">
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedChat.group_name}
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
              {selectedChatGroup && !selectedChatGroup?.is_private && (
                <button
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => setOpenMemberModal(true)}
                >
                  <User className="h-5 w-5" />
                </button>
              )}
              <button className="text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {groupedMessages && Object.keys(groupedMessages).length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="text-center justify-center align-items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <ChartBar className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-md text-gray-900 mb-2">
                  You're starting a new conversation
                </h3>
                <p className="text-gray-500">Type your first message below.</p>
              </div>
            </div>
          ) : (
            <MessageArea
              groupedMessages={groupedMessages}
              currentUserId={receiverUserId || ""}
              messagesEndRef={messagesEndRef}
              deleteMassages={deleteMassages}
              handleForward={handleForward}
            />
          )}

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
      {openForwardModal && (
        <ForwardMessageModal
          isOpen={openForwardModal}
          setIsOpen={setOpenForwardModal}
          // selectedMembers={selectedMembers}
          selectedMassage={selectedMassage}
        />
      )}
      {openMemberModal && currentChatId && (
        <GroupMembersModal
          isOpen={openMemberModal}
          setIsOpen={setOpenMemberModal}
          chatId={currentChatId}
          setSelectedChat={setSelectedChat}
        />
      )}
    </div>
  );
};
