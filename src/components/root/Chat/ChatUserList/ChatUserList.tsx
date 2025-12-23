import { FC, use, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser, useWorkspaceMembers } from "src/context";
import {
  getGroup,
  muteGroup,
  pinGroup,
  selectCurrentSelectedGroup,
  setCurrentSelectedGroup,
  unmuteGroup,
  unpinGroup,
} from "src/redux/chatSlice";
import { IChatGroup, IChatMessage } from "src/types";
import { formatMessageDate } from "src/utils";
import { GroupChatAvatar } from "../group-chat-avatar";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import {
  fetchWorkspaceMembers,
  selectWorkspaceMemberDetails,
  selectWorkspaceMemberMap,
} from "src/redux/workspaceMemberSlice";
import { stripAndTruncateHTML } from "src/utils/string.helper";
import {
  Archive,
  MoreVertical,
  Pin,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { IoNotificationsOff } from "react-icons/io5";

interface IChatUser {
  setSelectedChat: (chat: IChatGroup) => void;
  selectedChat: IChatGroup | undefined;
  searchQuery: string;
  groups: IChatGroup[];
  lastMessage: Record<string, IChatMessage>;
}
interface QuickActionsMenuProps {
  chat: IChatGroup;
  onClose: () => void;
  position: { top: number; right: number };
}

function QuickActionsMenu({ chat, onClose, position }: QuickActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { workspace: workspaceSlug } = useParams();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);


  const handlePin = async () => {
    console.log("handlePin called", chat);
    if (!workspaceSlug) return;
    if (chat?.is_pinned && chat.pin_id) {
      // Unpin
      await dispatch(
        unpinGroup({
          workspaceSlug,
          pinId: chat.pin_id,
          groupId: chat.id,
        })
      );
      onClose();
    } else {
      // Pin
      await dispatch(
        pinGroup({
          workspaceSlug,
          data: { group: chat.id },
        })
      );
      onClose();
    }
  };


   const handleMute = async () => {
    if (!workspaceSlug) return;
    if (chat?.is_mute && chat.mute_id) {
      // Unmute
      await dispatch(unmuteGroup({
        workspaceSlug,
        muteId: chat.mute_id,
        groupId: chat.id
      }));
      onClose();
    } else {
      // Mute
      await dispatch(muteGroup({
        workspaceSlug,
        data: { group: chat.id }
      }));
      onClose();
    }
  };

  const handleArchive = () => {
    console.log("Archive chat:", chat.id);
    onClose();
  };

  const handleDelete = () => {
    console.log("Delete chat:", chat.id);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-40"
      style={{ top: `${position.top}px`, right: `${position.right}px` }}
    >
      <button
        onClick={handlePin}
        className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <Pin className="5-3 w-3 mr-3" />
        {chat.is_pinned ? "Unpin" : "Pin"}
      </button>
      <button
        onClick={handleMute}
        className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
      >
        {chat.is_mute ? (
          <>
            <Volume2 className="5-3 w-3 mr-3" />
            Unmute
          </>
        ) : (
          <>
            <VolumeX className="5-3 w-3 mr-3" />
            Mute
          </>
        )}
      </button>
      <button
        onClick={handleArchive}
        className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <Archive className="5-3 w-3 mr-3" />
        Archive
      </button>
      <div className="border-t border-gray-200 my-1"></div>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center"
      >
        <Trash2 className="5-3 w-3 mr-3" />
        Delete
      </button>
    </div>
  );
}
export const ChatUserList: FC<IChatUser> = ({
  selectedChat,
  setSelectedChat,
  searchQuery,
  groups,
  lastMessage,
}) => {
  if (!groups) return null;
  const { data: currentUser, fetchCurrentUser } = useUser();
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const { workspace: workspaceSlug } = useParams();
  const dispatch = useAppDispatch();
  // const workspaceMemberMapFromStore = useAppSelector(selectWorkspaceMemberMap);
  // const currentWorkspaceMembers =
  //   workspaceMemberMapFromStore[workspaceSlug || ""];

  // const memberMap = useAppSelector(selectMemberMap);

  useEffect(() => {
    if (currentUser) return;
    const fetchCurrentWorkspaceUser = async () => {
      await fetchCurrentUser();
    };
    fetchCurrentWorkspaceUser();
  }, []);

  const filteredChats = groups.filter((chat) =>
    chat.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!workspaceSlug) return;
    // fetchWorkspaceMember(workspaceSlug);
    dispatch(fetchWorkspaceMembers(workspaceSlug));
  }, [workspaceSlug]);

  const handleChatOverview = (chat: IChatGroup) => {
    if (!workspaceSlug || !currentUser?.id) return;
    if (workspaceSlug) {
      dispatch(
        setCurrentSelectedGroup({
          workspaceSlug: workspaceSlug as string,
          groupId: chat.id,
          userId: currentUser?.id ?? "",
          group_name: chat.group_name,
        })
      );
    }
  };
  const lastSelected = window.localStorage.getItem(
    `timely_last_selected_chat_${workspaceSlug}`
  );

  const groupDetails: IChatGroup | null = workspaceSlug
    ? useAppSelector((state) => getGroup(state, lastSelected || ""))
    : null;
  useEffect(() => {
    if (!workspaceSlug || !currentUser?.id) return;

    if (!lastSelected) return;

    setSelectedChat(groupDetails as IChatGroup);
    dispatch(
      setCurrentSelectedGroup({
        workspaceSlug: workspaceSlug as string,
        groupId: selectedChat?.id ?? lastSelected,
        userId: currentUser?.id ?? "",
        group_name: selectedChat?.group_name ?? "",
      })
    );
  }, [
    selectedChat,
    workspaceSlug,
    currentUser,
    dispatch,
    groupDetails,
    lastSelected,
  ]);

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 5,
      right: window.innerWidth - rect.right,
    });

    setMenuOpen(menuOpen === chatId ? null : chatId);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-indigo-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-green-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredChats.map((chat: IChatGroup) => {
        const lastMsg = lastMessage[chat.id] || null;
        const isMe = lastMsg?.sender === currentUser?.id;
        // const userDetails = memberMap[chat.members[0]];
        return (
          <>
            <button
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                handleChatOverview(chat);
              }}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}
              className={`w-full p-4 flex items-center hover:bg-gray-50 transition-all ${
                selectedChat?.id === chat.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                  {chat.is_mute ? (
                    <IoNotificationsOff />
                  ) : (
                    <>
                      {chat?.members?.length > 1 ? (
                        <GroupChatAvatar
                          size={30}
                          fill="#ffffff"
                          background="bg-indigo-600"
                        />
                      ) : (
                        chat.group_name.charAt(0)
                      )}
                    </>
                  )}
                </div>
                {/* {chat.isOnline && ( */}
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
                {/* )} */}
              </div>
              <div className="ml-3 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">
                    {chat.group_name}
                  </h3>

                  {/* {lastMsg && (
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(lastMsg.created_at)}
                    </span>
                  )} */}

                  {hoveredChat === chat.id || menuOpen === chat.id ? (
                    <button
                      onClick={(e) => handleMenuClick(e, chat.id)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <MoreVertical className="h-2 w-2 text-gray-600" />
                    </button>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {lastMsg?.created_at &&
                          formatMessageDate(lastMsg?.created_at)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {/* {lastMsg?.content || "No messages yet"} */}
                  {lastMsg
                    ? `${isMe ? "You: " : ""}${stripAndTruncateHTML(lastMsg.content || "", 20)}`
                    : "No messages yet"}
                  {/* {chat.lastMessage || "No messages yet"} */}
                </p>
              </div>
            </button>
            {menuOpen === chat.id && (
              <QuickActionsMenu
                chat={chat}
                onClose={() => setMenuOpen(null)}
                position={menuPosition}
              />
            )}
          </>
        );
      })}
    </div>
  );
};
