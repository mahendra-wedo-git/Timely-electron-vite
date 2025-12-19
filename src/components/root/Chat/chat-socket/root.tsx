
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "src/redux/hooks";
import {
  removeGroup,
  updateGroup,
  updateGroupMembers,
} from "src/redux/chatSlice";
import { useUser } from "src/context/userContext";
import { useChatSocket } from "src/context/chatContext";
import {
  deleteMessage,
  replaceTemporaryMessage,
  updateChatGroupLog,
  updateMessages,
} from "src/redux/massagesSlice";

export function ChatSocketContainer() {
  const { workspace: workspaceSlug } = useParams();
  const socket = useChatSocket();
  const dispatch = useAppDispatch();
  const { data: currentUser } = useUser();

  const connectedWorkspaceRef = useRef<string | null>(null);

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
          // case "group":
          //   if (
          //     parsed.intent === "remove_member" &&
          //     currentUser.id === parsed.member
          //   ) {
          //     console.log("remove group call", parsed);
          //     const groupId = parsed.id;
          //     if (!groupId) return;
          //     socket?.send({
          //       type: "group",
          //       intent: "discard_group",
          //       group_id: groupId,
          //     });
          //     dispatch(removeGroup(groupId));
          //     return;
          //   } else if (parsed.intent === "new_log") {
          //     const groupId = parsed.id;
          //     dispatch(
          //       updateChatGroupLog({
          //         workspaceSlug,
          //         chatId: groupId,
          //         log: parsed,
          //       })
          //     );
          //     return;
          //   } else {
          //     dispatch(updateGroup(parsed.result));
          //     dispatch(updateGroupMembers(parsed.result));
          //     socket?.send({
          //       type: "group",
          //       intent: "join_group",
          //       group_id: parsed.result.id,
          //     });
          //   }

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
                })
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

          // case "group":
          //   const groupId = parsed.id || parsed.group_id;
          //   if (!groupId) return;

          //   // YOU were removed
          //   if (
          //     parsed.intent === "remove_member" &&
          //     parsed.member === currentUser.id
          //   ) {
          //     socket.send({
          //       type: "group",
          //       intent: "discard_group",
          //       group_id: groupId,
          //     });

          //     dispatch(removeGroup(groupId));
          //     return;
          //   }

          //   // SOMEONE ELSE removed → update group members
          //   if (parsed.intent === "remove_member") {
          //     dispatch(
          //       updateGroupMembers({
          //         groupId,
          //         members: parsed.members,
          //         member_count: parsed.member_count,
          //       })
          //     );

          //     // optional: add system log
          //     dispatch(
          //       updateChatGroupLog({
          //         workspaceSlug,
          //         chatId: groupId,
          //         log: {
          //           ...parsed,
          //           created_at: new Date().toISOString(),
          //           isSystem: true,
          //         },
          //       })
          //     );

          //     return;
          //   }

          //   // Normal group updates
          //   if (parsed.result?.id) {
          //     dispatch(updateGroup(parsed.result));
          //   }

          //   return;

          case "message":
            const chatId = parsed.group || parsed.group_id;
            if (parsed.intent === "replaceTempData") {
              dispatch(
                replaceTemporaryMessage({
                  workspaceSlug,
                  chatId: parsed.group,
                  clientMessageId: parsed.clientMessageId,
                  message: parsed, // FULL MESSAGE
                })
              );
            } else if (parsed.intent === "delete") {
              dispatch(
                deleteMessage({
                  workspaceSlug,
                  chatId: parsed.group,
                  messageId: parsed.message_id,
                })
              );
            } else {
              dispatch(
                updateMessages({
                  workspaceSlug,
                  chatId: parsed.group,
                  msgs: [parsed],
                  currentUserId: currentUser.id,
                })
              );
            }
            // dispatch(replaceTemporaryMessage({
            //   workspaceSlug,
            //   message: parsed.content,
            //   chatId: parsed.group,
            //   messageId: parsed.clientMessageId
            // }));
            // dispatch({ type: "chat/addMessages", payload: parsed });
            break;
          case "reaction":
            dispatch({ type: "chat/updateReaction", payload: parsed });
            break;
        }
      },
      () => console.log("WS connected:", workspaceSlug),
      (err) => console.error("WS error:", err),
      () => console.log("WS closed")
    );

    return () => {
      socket.disconnect();
      connectedWorkspaceRef.current = null;
    };
  }, [workspaceSlug, currentUser?.id]);

  return null;
}
