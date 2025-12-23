import { FC, use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser, useWorkspaceMembers } from "src/context";
import {
  getGroup,
  selectCurrentSelectedGroup,
  setCurrentSelectedGroup,
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
// import { selectMemberMap } from "src/redux/memberRootSlice";

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
  setSelectedChat: (chat: IChatGroup) => void;
  selectedChat: IChatGroup | undefined;
  searchQuery: string;
  groups: IChatGroup[];
  lastMessage: Record<string, IChatMessage>;
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

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredChats.map((chat: IChatGroup) => {
        const lastMsg = lastMessage[chat.id] || null;
        const isMe = lastMsg?.sender === currentUser?.id;
        // const userDetails = memberMap[chat.members[0]];
        return (
          <button
            key={chat.id}
            onClick={() => {
              setSelectedChat(chat);
              handleChatOverview(chat);
            }}
            className={`w-full p-4 flex items-center hover:bg-gray-50 transition ${
              selectedChat?.id === chat.id ? "bg-gray-100" : ""
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {chat?.members?.length > 1 ? (
                  <GroupChatAvatar
                    size={42}
                    fill="#ffffff"
                    background="bg-indigo-600"
                  />
                ) : (
                  chat.group_name.charAt(0)
                )}
              </div>
              {/* {chat.isOnline && ( */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              {/* )} */}
            </div>
            <div className="ml-3 flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {chat.group_name}
                </h3>

                {lastMsg && (
                  <span className="text-xs text-gray-500">
                    {formatMessageDate(lastMsg.created_at)}
                  </span>
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
        );
      })}
    </div>
  );
};
