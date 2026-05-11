import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import {
  removeGroup,
  reorderGroupsBasedOnSender,
  selectAllGroups,
  updateGroup,
  updateGroupMembers,
} from "src/redux/chatSlice";
import { useUser } from "src/context/userContext";
import { useChatSocket } from "src/context/chatContext";
import {
  deleteMessage,
  replaceTemporaryMessage,
  setTyping,
  updateChatGroupLog,
  updateMessageReaction,
  updateMessages,
} from "src/redux/massagesSlice";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { IChatGroup } from "src/types";
import { cleanedHTML, extractPlainText } from "src/utils/string.helper";
import { renderEmoji } from "src/utils/emoji.helper";

export function ChatSocketContainer() {
  const { workspace: workspaceSlug } = useParams();
  const socket = useChatSocket();
  const dispatch = useAppDispatch();
  const { data: currentUser } = useUser();

  const connectedWorkspaceRef = useRef<string | null>(null);
  const memberMap = useAppSelector(selectMemberMap);
  const groupsDetails: any = useAppSelector(selectAllGroups);
  const shouldShowOSNotification = (
    senderId: string,
    currentUserId: string,
  ) => {
    console.log("shouldShowOSNotification called", senderId, currentUserId);
    // Don't show notifications if user is "mte"
    // if (currentUser?.id === "mte" || currentUser?.username === "mte") return false;
    // if (senderId) return false;
    // if (senderId === currentUserId) return false;
    if (document.hasFocus()) return false;
    return true;
  };
  // function shouldShowReactionNotification(
  //   reactorId: string,
  //   messageSenderId: string,
  //   currentUserId: string
  // ) {
  //   console.log("shouldShowReactionNotification",reactorId !== currentUserId && messageSenderId === currentUserId)
  //   return reactorId !== currentUserId && messageSenderId === currentUserId;
  // }

  useEffect(() => {
    if (!workspaceSlug || !currentUser?.id) return;

    // prevent duplicate connect
    if (connectedWorkspaceRef.current === workspaceSlug) return;
    connectedWorkspaceRef.current = workspaceSlug;

    socket.connectToRoom(
      workspaceSlug,
      (parsed) => {
        if (parsed.workspace && parsed.workspace !== workspaceSlug) return;

        switch (parsed.type) {
          case "group": {
            if (
              parsed.intent === "remove_member" &&
              currentUser.id === parsed.member
            ) {
              const groupId = parsed.id;
              if (!groupId) return;
              socket.send({
                type: "group",
                intent: "discard_group",
                group_id: groupId,
              });
              dispatch(removeGroup(groupId));
              return;
            }

            if (parsed.intent === "new_log") {
              const groupId = parsed.id || parsed.group;
              dispatch(
                updateChatGroupLog({
                  workspaceSlug,
                  chatId: groupId,
                  log: parsed,
                }),
              );
              return;
            }

            if (parsed.result?.id) {
              dispatch(updateGroup(parsed.result));
              dispatch(updateGroupMembers(parsed.result));
              socket.send({
                type: "group",
                intent: "join_group",
                group_id: parsed.result.id,
              });
            }

            break;
          }

          case "message":
            const chatId = parsed.group || parsed.group_id;
            // added for OS notification
            if (
              parsed.intent !== "replaceTempData" &&
              parsed.intent !== "delete" &&
              shouldShowOSNotification(parsed.sender, currentUser.id)
            ) {
              const senderDetails = Array.from(groupsDetails).find(
                (group: any) => group.id === parsed.group,
              ) as IChatGroup;
              const Attachments = parsed?.attachments?.length > 0;
              const isGroupChat = senderDetails?.members.length > 1;
              const sanitizedMessageContent = cleanedHTML(parsed.content);
              const plainTextContent = extractPlainText(
                sanitizedMessageContent,
              );
              const Messages =
                plainTextContent.length > 100
                  ? plainTextContent.slice(0, 100) + "..."
                  : plainTextContent;
              console.log("showOSNotification parsed", parsed, senderDetails);
              console.log("showOSNotification Attachments", Attachments);
              console.log(
                "groupsDetails",
                Array.from(groupsDetails).find(
                  (group: any) => group.id === parsed.group,
                ),
              );
              window.api?.showNotification({
                title: parsed.group ? senderDetails.group_name : `New message`,
                body: isGroupChat
                  ? `${memberMap[parsed.sender]?.display_name} : ${
                      Attachments ? "Sent a file" : Messages
                    }`
                  : Attachments ? "Sent a file" : Messages || "New message",
              });
            }
            if (parsed.intent === "replaceTempData") {
              dispatch(
                replaceTemporaryMessage({
                  workspaceSlug,
                  chatId: parsed.group,
                  clientMessageId: parsed.clientMessageId,
                  message: parsed,
                }),
              );
            } else if (parsed.intent === "delete") {
              dispatch(
                deleteMessage({
                  workspaceSlug,
                  chatId: parsed.group,
                  messageId: parsed.message_id,
                }),
              );
            } else if (parsed.intent === "update") {
              dispatch(
                updateMessages({
                  workspaceSlug,
                  chatId,
                  msgs: [parsed],
                  message_id: parsed.message_id || parsed.id,
                  currentUserId: currentUser.id,
                }),
              );
            } else {
              const chatId = parsed.id || parsed.group;
              console.log(
                "groupedMessages update socket called",
                parsed,
                chatId,
              );
              dispatch(
                updateMessages({
                  workspaceSlug,
                  chatId,
                  msgs: [parsed],
                  currentUserId: currentUser.id,
                }),
              );
            }
            if (parsed.intent !== "update") {
              dispatch(reorderGroupsBasedOnSender(chatId));
            }
            break;
          case "reaction":
            if (
              parsed.intent === "create" &&
              shouldShowOSNotification(parsed.sender, currentUser.id)
            ) {
              const senderDetails = Array.from(groupsDetails).find(
                (group: any) => group.id === parsed.group,
              ) as IChatGroup;

              const isGroupChat = senderDetails?.members?.length > 1;
              const reactorName =
                memberMap[parsed.user]?.display_name || "Someone";
              const parsedEmoji = renderEmoji(parsed.emoji) as string;
              window.api?.showNotification({
                title: senderDetails?.group_name || "New reaction",
                body: isGroupChat
                  ? `${reactorName} reacted ${parsedEmoji} to your message`
                  : `${reactorName} reacted ${parsedEmoji}`,
              });
            }
            if (parsed.intent === "delete") {
              dispatch(
                updateMessageReaction({
                  workspaceSlug,
                  chatId: parsed.group,
                  messageId: parsed.message,
                  reaction: parsed,
                  intent: "delete",
                }),
              );
            } else if (parsed.intent === "create") {
              dispatch(
                updateMessageReaction({
                  workspaceSlug,
                  chatId: parsed.group,
                  messageId: parsed.message,
                  reaction: parsed,
                  intent: "create",
                }),
              );
            } else if (parsed.intent === "update") {
              dispatch(
                updateMessageReaction({
                  workspaceSlug,
                  chatId: parsed.group,
                  messageId: parsed.message_id,
                  reaction: parsed,
                }),
              );
            }
            break;
            case "typing":
            if (parsed.sender !== currentUser?.id) {
              dispatch(setTyping(parsed));
            }
            break;
        }
      },
      () => console.log("WS connected:", workspaceSlug),
      (err) => console.error("WS error:", err),
      () => console.log("WS closed"),
    );

    return () => {
      socket.disconnect();
      connectedWorkspaceRef.current = null;
    };
  }, [workspaceSlug, currentUser?.id]);

  return null;
}
