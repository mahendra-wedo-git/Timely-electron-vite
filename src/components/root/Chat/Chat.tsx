import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  MoreVertical,
  Send,
  Smile,
  ChartBar,
  User,
  X,
  Volume2,
  VolumeX,
  Pin,
  Image,
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
  selectGroupAttachments,
  selectLastMessage,
} from "src/redux/massagesSlice";
import { groupChatData } from "src/utils";
import MessageArea from "./MessageArea";
import { ForwardMessageModal } from "./ForwordMessage/ForwordMessage";
import { GroupMembersModal } from "./GroupMemberModal/GroupMemberModal";
import { FileData, FilePicker } from "./file-picker";
import { ImagePicker } from "./Image-picker";
import { uploadEditorAsset } from "src/redux/assetsSlice";
import { getFileIcon } from "src/assets/attachment";
import { PreviewMessage } from "./PreviewMessage";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { ChatFileList } from "./FilesListing";

export const ChatWindow = () => {
  const [selectedChat, setSelectedChat] = useState<IChatGroup | undefined>(
    undefined
  );
  const [message, setMessage] = useState("");
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [selectedMassage, setSelectedMassage] = useState();
  const [replyTo, setReplyTo] = useState<IChatGroup | null>(null);
  const memberDetails = useAppSelector(selectMemberMap);
  const [uploadedAssetIds, setUploadedAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [openQuickActions, setOpenQuickActions] = useState<boolean | null>(
    false
  );
  const [files, setFiles] = useState<FileData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { workspace: workspaceSlug } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSocketService = useChatSocket();
  const selectedChatGroup = useAppSelector((state) =>
    selectedChat?.id !== undefined
      ? selectGroupById(state, selectedChat.id)
      : undefined
  );

  const currentSelectedGroup = useAppSelector((state) =>
    workspaceSlug ? selectCurrentSelectedGroup(state, workspaceSlug) : undefined
  );
  const [activeTab, setActiveTab] = useState<"chat" | "files" | "photos">(
    "chat"
  );
  const currentChatId = currentSelectedGroup?.groupId;
  const receiverUserId = currentSelectedGroup?.userId;
  const groupName = currentSelectedGroup?.group_name;

  const lastMessage = useAppSelector((state) => selectLastMessage(state));

  const chatFiles = useAppSelector(selectGroupAttachments);
  const currentChatFiles =
    chatFiles[workspaceSlug || ""]?.[currentChatId || ""] || [];

  console.log(
    "chatFileschatFileschatFiles",
    chatFiles[workspaceSlug || ""]?.[currentChatId || ""]
  );

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
          params: { cursor: null as string | null },
        })
      );
      dispatch(
        fetchGroupAttachments({
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
    console.log("deleteMassages called", message);
    chatSocketService?.send({
      type: "message",
      intent: "delete",
      message_id: message.id,
      group_id: message.group,
      sender: message.sender,
    });
  };
  const inputRef = useRef(null);

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

      // 2. Delete from server
      // if (fileName.startsWith("http")) {
      //   await fileService.deleteOldWorkspaceAsset(
      //     currentWorkspace?.id || "",
      //     id
      //   );
      // } else {
      //   const assetUrl = getEditorAssetSrc({
      //     assetId: id, // if you have project context
      //     workspaceSlug: currentWorkspace?.slug || "",
      //     isdelete: true,
      //   });
      //   if (assetUrl) {
      //     await fileService.deleteNewAsset(assetUrl);
      //   }
      // }
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
  // console.log("groupedMessagesgroupedMessages", groupedMessages);
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
            })
          );
        } else {
          await dispatch(
            pinGroup({
              workspaceSlug,
              data: { group: chat.id },
            })
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
            })
          );
        } else {
          await dispatch(
            muteGroup({
              workspaceSlug,
              data: { group: chat.id },
            })
          );
        }
      },
    },
  ];

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
          <div className=" border-b border-gray-200 px-10 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-8 h-8 rounded-full capitalize bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {selectedChat.group_name.charAt(0)}
                </div>
                {/* {selectedChat.isOnline && ( */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                {/* )} */}
              </div>
              <div className="ml-3">
                <h2 className="text-md capitalize font-semibold text-gray-900">
                  {selectedChat.group_name}
                </h2>
              </div>
            </div>
            {/* chat heder actions */}
            <div className="flex items-center space-x-4">
              <button
                className={`text-gray-600 hover:text-gray-900  text-xs ${activeTab === "chat" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`text-gray-500 hover:text-gray-700 text-xs ${activeTab === "files" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("files")}
              >
                Files
              </button>
              <button
                className={`text-gray-500 hover:text-gray-700 text-xs ${activeTab === "photos" ? "underline font-medium" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                Photos
              </button>
              {selectedChatGroup && !selectedChatGroup?.is_private && (
                <button
                  className="text-gray-500 hover:text-gray-700 text-xs"
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
                <div className="w-full h-full flex justify-center items-center">
                  <div className="text-center justify-center align-items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                      <Image className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-md text-gray-900 mb-2">
                      No photos yet
                    </h3>
                    <p className="text-gray-500">
                      Photos shared in this chat will appear here.
                    </p>
              </div>
            </div>
          ) : (
            <MessageArea
              groupedMessages={groupedMessages}
              currentUserId={receiverUserId || ""}
              messagesEndRef={messagesEndRef}
              deleteMassages={deleteMassages}
              handleForward={handleForward}
              handleReplay={handleReplay}
               handleEditMessage={handleEditMessage} 
            />
              )}
            </>
          )}

          {/* Message Input */}
        {activeTab === "chat" && (
          <div className=" p-4 bg-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border shadow-xl border-gray-100 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                {/* Preview Message - Shows when replying */}
                {replyTo && selectedMassage && (
                  <div className="px-4 pt-3 pb-2 ">
                    <PreviewMessage
                      memberMap={memberDetails}
                      selectedMassage={selectedMassage}
                      handleReplay={handleReplay}
                      reply
                    />
                  </div>
                )}

                {/* File Attachments Preview */}
          {files.length > 0 && (
            <div className="px-4 pt-3 pb-2 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-100 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.name.split(".").pop() || "")}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate max-w-[150px] text-xs font-medium text-gray-700">
                            {file.name}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(file.id, file.name)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                </div>
              )}

          {/* Input Area */}
          <div className="flex items-center gap-2 px-4 py-1">
            {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  uploadedAssetIds.size
                    ? `${uploadedAssetIds.size} files are sending...`
                    : "Type a message..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Emoji Button */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <Smile className="h-5 w-5" />
              </button>
              {/* Image Picker */}
            <div className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
              <ImagePicker
                onUploaded={(images) => {
                  if (!currentChatId || !workspaceSlug) return;
                  images.forEach((img) => {
                    dispatch(
                      uploadEditorAsset({
                        blockId: currentChatId,
                        workspaceSlug,
                        data: {
                          entity_identifier: currentChatId,
                          entity_type: "CHAT_ATTACHMENT",
                        },
                        file: img.file,
                      })
                    );
                  });
                }}
              />
            </div>

              {/* File Picker */}
              <div className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                <FilePicker
                  currentChatId={currentChatId || ""}
                  workspaceSlug={workspaceSlug || ""}
                  onUploaded={(files) => {
                    if (!currentChatId || !workspaceSlug) return;
                    setUploadedAssetIds((prev) => {
                      const updated = new Set(prev);
                      for (const file of files) {
                        updated.add(file.id);
                      }
                      return updated;
                    });
                    setFiles((prev) => [...prev, ...files]);
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={
                  !message.trim() && uploadedAssetIds.size === 0
                }
                className="ml-1 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
            </div>
          </div>
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
