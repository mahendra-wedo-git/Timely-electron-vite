import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  MoreVertical,
  ChartBar,
  User,
  Volume2,
  VolumeX,
  Pin,
} from "lucide-react";
import { SidebarChat } from "./ChatUserList";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { v4 as uuidv4 } from "uuid";
import {
  muteGroup,
  pinGroup,
  reorderGroupsBasedOnSender,
  selectCurrentSelectedGroup,
  selectGroupById,
  unmuteGroup,
  unpinGroup,
} from "src/redux/chatSlice";
import { IChatGroup, IChatGroupLog, IChatMessage } from "src/types";
import { useParams } from "react-router-dom";
import { useChatSocket } from "src/context/chatContext";
import {
  addTemporaryMessage,
  fetchChatGroupLog,
  fetchChatMessage,
  fetchGroupAttachments,
  fetchLastMessage,
  selectChatGroupLogDetails,
  selectChatMessageDetails,
  selectChatMessages,
  selectGroupAttachments,
  selectLastMessage,
  selectLoader,
} from "src/redux/massagesSlice";
import { groupChatData } from "src/utils";
import MessageArea from "./MessageArea";
import { ForwardMessageModal } from "./ForwordMessage/ForwordMessage";
import { GroupMembersModal } from "./GroupMemberModal/GroupMemberModal";
import { FileData } from "./file-picker";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { ChatFileList } from "./FilesListing";
import { TiptapChatEditor, TiptapChatEditorRef } from "./Editor";
import { UserAvatar } from "./UserAvatar";
import { GroupChatAvatar } from "./group-chat-avatar";
import { ChatImageList } from "./imageListing";
import { ChatMessageSkeleton } from "src/components/common";

export const ChatWindow = () => {
  const [selectedChat, setSelectedChat] = useState<IChatGroup | undefined>(
    undefined,
  );
  const [message, setMessage] = useState("");
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [selectedMassage, setSelectedMassage] = useState<any>();
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const memberDetails = useAppSelector(selectMemberMap);
  const [uploadedAssetIds, setUploadedAssetIds] = useState<Set<string>>(
    new Set(),
  );
  const [openQuickActions, setOpenQuickActions] = useState<boolean | null>(
    false,
  );
  const [files, setFiles] = useState<FileData[]>([]);
  const { workspace: workspaceSlug } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<TiptapChatEditorRef>(null);
  const chatSocketService = useChatSocket();
  const selectedChatGroup = useAppSelector((state) =>
    selectedChat?.id !== undefined
      ? selectGroupById(state, selectedChat.id)
      : undefined,
  );

  const currentSelectedGroup = useAppSelector((state) =>
    workspaceSlug
      ? selectCurrentSelectedGroup(state, workspaceSlug)
      : undefined,
  );
  const [activeTab, setActiveTab] = useState<"chat" | "files" | "photos">(
    "chat",
  );
  const [isDragging, setIsDragging] = useState(false);
  const currentChatId = currentSelectedGroup?.groupId;
  const receiverUserId = currentSelectedGroup?.userId;
  const groupName = currentSelectedGroup?.group_name;

  const lastMessage = useAppSelector((state) => selectLastMessage(state));
  const loader = useAppSelector((state) => selectLoader(state));
  // const chatMessage = useAppSelector(selectChatMessages)[workspaceSlug || ""];

  const chatFiles = useAppSelector(selectGroupAttachments);
  const currentChatFiles =
    chatFiles[workspaceSlug || ""]?.[currentChatId || ""] || [];
  useEffect(() => {
    if (currentSelectedGroup) {
      setActiveTab("chat");
    }
  }, [currentSelectedGroup]);

  const dispatch = useAppDispatch();
  const messages_ = useAppSelector(
    (state) =>
      workspaceSlug &&
      currentChatId &&
      selectChatMessageDetails(state, workspaceSlug, currentChatId),
  ) as IChatMessage[];
  const logs = useAppSelector((state) =>
    workspaceSlug && currentChatId
      ? selectChatGroupLogDetails(state, workspaceSlug, currentChatId)
      : undefined,
  ) as IChatGroupLog[];

  const groupedMessages = groupChatData(messages_, logs);
  useEffect(() => {
    if (workspaceSlug && currentChatId) {
      dispatch(
        fetchChatMessage({
          workspaceSlug,
          chatId: currentChatId,
          params: { cursor: null as string | null },
        }),
      );
      dispatch(
        fetchGroupAttachments({
          workspaceSlug,
          chatId: currentChatId,
          params: { cursor: null },
        }),
      );
      dispatch(fetchChatGroupLog({ workspaceSlug, chatId: currentChatId }));
      scrollToBottom();
    }
    if (workspaceSlug) dispatch(fetchLastMessage({ workspaceSlug }));
  }, [workspaceSlug, currentChatId, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteMassages = (message: any) => {
    console.log("deleteMassages called", message);
    chatSocketService?.send({
      type: "message",
      intent: "delete",
      message_id: message.id,
      group_id: message.group,
      sender: message.sender,
    });
  };
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus the input box when replyTo has a value
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleRemove = async (id: string, fileName: string) => {
    try {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setUploadedAssetIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete asset:", error);
      // optional: show toast or revert state if deletion fails
    }
  };

  const handleForward = (message: any) => {
    setSelectedMassage(message);
    setOpenForwardModal(true);
  };
  const handleReplay = (message: any) => {
    console.log("handleReplay called", message);
    if (message) {
      setSelectedMassage(message);
    }
    setReplyTo(message ? message : (null as IChatGroup | null));
  };
  const handleSendMessage = () => {
    // if (!message || !selectedChat || !chatSocketService) return;
    if (!selectedChat || !chatSocketService) return;

    chatSocketService.send({
      type: "message",
      content: message || "<p></p>",
      group_id: currentChatId,
      reply_to: replyTo ? selectedMassage?.id : null,
      clientMessageId: uuidv4(),
      attachments: Array.from(uploadedAssetIds),
      browser_data: browserData,
    });
    //order chat list by sender
    setReplyTo(null);
    dispatch(reorderGroupsBasedOnSender(currentChatId || ""));
    setMessage("");
    setUploadedAssetIds(new Set());
    setFiles([]);
  };

  const handleSendMessageEditor = (
    content: string,
    files: File[],
    replyTo: any,
    editor: any,
  ) => {
    console.log("handleSendMessageEditor", content);
    if (!selectedChat || !chatSocketService) return;

    chatSocketService.send({
      type: "message",
      content: content || "<p></p>",
      group_id: currentChatId,
      reply_to: replyTo ? selectedMassage?.id : null,
      clientMessageId: uuidv4(),
      attachments: Array.from(files),
      browser_data: browserData,
    });
    //order chat list by sender
    setReplyTo(null);
    dispatch(reorderGroupsBasedOnSender(currentChatId || ""));
    setMessage("");
    setUploadedAssetIds(new Set());
    setFiles([]);
  };

  const handleEditMessage = (message: any, newContent: string) => {
    if (!chatSocketService || !newContent.trim()) return;

    chatSocketService.send({
      type: "message",
      content: newContent,
      message_id: message.id,
      intent: "update", // or "edit" depending on your backend API
      group_id: currentChatId,
      is_forwarded: message.is_forwarded,
      reply_to: replyTo?.id,
      attachments: uploadedAssetIds,
      browser_data: browserData,
    });
    // dispatch(reorderGroupsBasedOnSender(currentChatId || ""));
  };

  const getImageAttachments = () => {
    if (!currentChatFiles || currentChatFiles.length === 0) return [];
    const allImages = currentChatFiles.flatMap((msg: IChatMessage) =>
      (msg.attachment || [])
        .filter((att) => att.attributes?.type?.startsWith("image/"))
        .map((att) => ({ ...att, created_at: msg.created_at })),
    );
    return allImages;
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
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length && editorRef.current) {
      await editorRef.current.handleDroppedFiles(files);
    }
  };

  const getChatActions = (chat: IChatGroup) => [
    {
      id: "pin",
      label: chat.is_pinned ? "Unpin" : "Pin",
      icon: <Pin className="w-3 h-3" />,
      onClick: async () => {
        if (!workspaceSlug) return;

        if (chat.is_pinned && chat.pin_id) {
          await dispatch(
            unpinGroup({
              workspaceSlug,
              pinId: chat.pin_id,
              groupId: chat.id,
            }),
          );
        } else {
          await dispatch(
            pinGroup({
              workspaceSlug,
              data: { group: chat.id },
            }),
          );
        }
      },
    },
    {
      id: "mute",
      label: chat.is_mute ? "Unmute" : "Mute",
      icon: chat.is_mute ? (
        <Volume2 className="w-3 h-3" />
      ) : (
        <VolumeX className="w-3 h-3" />
      ),
      onClick: async () => {
        if (!workspaceSlug) return;

        if (chat.is_mute && chat.mute_id) {
          await dispatch(
            unmuteGroup({
              workspaceSlug,
              muteId: chat.mute_id,
              groupId: chat.id,
            }),
          );
        } else {
          await dispatch(
            muteGroup({
              workspaceSlug,
              data: { group: chat.id },
            }),
          );
        }
      },
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar - Chat List */}
      <SidebarChat
        selectedChat={selectedChat}
        lastMessage={lastMessage}
        setSelectedChat={setSelectedChat}
        currentUserId={receiverUserId}
      />

      {/* Main Chat Area */}
      {loader ? (
        <div className="p-4 max-w-[950px] mx-auto w-full">
          <ChatMessageSkeleton />
        </div>
      ) : selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className=" border-b border-gray-200 px-10 py-4 flex items-center bg-white ">
            <div className="flex items-center">
              <div className="relative">
                {selectedChat.is_private ? (
                  <UserAvatar
                    userDetail={memberDetails?.[selectedChat?.members[0]]}
                    msg={selectedMassage}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full capitalize bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    <GroupChatAvatar
                      size={30}
                      fill="#ffffff"
                      background="bg-indigo-600"
                    />
                  </div>
                )}
                {/* {selectedChat.isOnline && ( */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                {/* )} */}
              </div>
              <div className="ml-3">
                <h2 className="text-lg capitalize font-semibold text-gray-900">
                  {selectedChat.group_name}
                </h2>
              </div>
            </div>
            {/* chat heder actions */}
            <div className=" px-10 flex items-center justify-start space-x-4">
              <button
                className={`text-gray-600 hover:text-gray-900  text-sm ${activeTab === "chat" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`text-gray-500 hover:text-gray-700 text-sm ${activeTab === "files" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("files")}
              >
                Files
              </button>
              <button
                className={`text-gray-500 hover:text-gray-700 text-sm ${activeTab === "photos" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                Photos
              </button>
            </div>
            <div className="flex items-center ml-auto justify-end space-x-4">
              {selectedChatGroup && !selectedChatGroup?.is_private && (
                <button
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => setOpenMemberModal(true)}
                >
                  <User className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setOpenQuickActions(true)}
                className="text-gray-400 hover:text-gray-600"
              >
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
            <>
              {activeTab === "files" ? (
                <ChatFileList
                  files={currentChatFiles}
                  memberDetails={memberDetails}
                />
              ) : activeTab === "photos" ? (
                <ChatImageList
                  images={getImageAttachments()}
                  memberDetails={memberDetails}
                  workspaceSlug={workspaceSlug || ""}
                />
              ) : (
                <div
                  className="relative flex-1 flex flex-col min-h-0"
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 border-2 border-dashed border-indigo-500 min-h-full flex items-center justify-center bg-indigo-50/80 z-50 pointer-events-none">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="h-8 w-8 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-indigo-700">
                          Drop files or images here
                        </p>
                        <p className="text-sm text-indigo-500 mt-1">
                          Release to upload
                        </p>
                      </div>
                    </div>
                  )}
                  <MessageArea
                    groupedMessages={groupedMessages}
                    currentUserId={receiverUserId || ""}
                    messagesEndRef={messagesEndRef}
                    deleteMassages={deleteMassages}
                    handleForward={handleForward}
                    handleReplay={handleReplay}
                    handleEditMessage={handleEditMessage}
                  />

                  <TiptapChatEditor
                    ref={editorRef}
                    currentChatId={currentChatId}
                    workspaceSlug={workspaceSlug}
                    replyTo={replyTo}
                    selectedMessage={selectedChat}
                    memberDetails={memberDetails}
                     chatSocketService={chatSocketService}
                      currentUser={receiverUserId || ""}
                    onSendMessage={(content, attachments) => {
                      if (!chatSocketService) return;

                      chatSocketService.send({
                        type: "message",
                        content: content,
                        group_id: currentChatId,
                        reply_to: replyTo ? selectedMassage?.id : null,
                        clientMessageId: uuidv4(),
                        attachments: attachments,
                        browser_data: {
                          userAgent: navigator.userAgent,
                          platform: navigator.platform,
                          language: navigator.language,
                          screen: {
                            width: window.screen.width,
                            height: window.screen.height,
                          },
                        },
                      });

                      // Reorder chat list by sender
                      dispatch(reorderGroupsBasedOnSender(currentChatId || ""));
                      scrollToBottom();
                    }}
                    onCancelReply={() => setReplyTo(null)}
                    placeholder="Type a message..."
                    maxHeight={300}
                  />
                </div>
              )}
            </>
          )}
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
      {/* Quick Actions Menu */}
      {openQuickActions && selectedChat && (
        <QuickActionsMenu
          actions={getChatActions(selectedChat)}
          onClose={() => setOpenQuickActions(null)}
          position={{ top: 60, right: 20 }}
        />
      )}
    </div>
  );
};
