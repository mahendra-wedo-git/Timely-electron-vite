// import { useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useUser } from "src/context";
// import { ChatSocketService } from "src/services";
// export function ChatSocketContainer() {
//   const { workspace:workspaceSlug } = useParams();

//   const { data:currentUser, fetchCurrentUser } = useUser();
//   const socketRef = useRef<ChatSocketService | null>(null);
//   useEffect(() => {
//     if (currentUser) return;
//     const fetchCurrentWorkspaceUser = async () => {
//       await fetchCurrentUser();
//     }
//     fetchCurrentWorkspaceUser();
//   }, []);

// console.log("workspaceSlug",workspaceSlug)
//   const socketLock = useRef<string | null>(null);

//   useEffect(() => {
//     if (!workspaceSlug) return;
//     //changes
//     if (socketLock.current === workspaceSlug) return;
//     socketLock.current = workspaceSlug;
//     socketRef.current = new ChatSocketService();

//     const socket = socketRef.current

//      socket.connectToRoom(
//       workspaceSlug as string,
//       (msg) => console.log("WebSocket message:", msg),
//       () => console.log("WebSocket opened"),
//       (err) => console.log("WebSocket error:", err),
//       () => console.log("WebSocket closed")
//     );

//     return () => {
//       socket?.disconnect();
//     };
//   }, [workspaceSlug]);

//   return null;
// }

// import { useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useChatSocket } from "src/context/chatContext";

// export function ChatSocketContainer() {
//   const { workspace: workspaceSlug } = useParams();
//   const chatSocket = useChatSocket();
//   const socketLock = useRef<string | null>(null);

//   useEffect(() => {
//     if (!workspaceSlug) return;

//     if (socketLock.current === workspaceSlug) return;
//     socketLock.current = workspaceSlug;

//     chatSocket.connectToRoom(
//       workspaceSlug,
//       (msg) => console.log("WebSocket message:", msg),
//       () => console.log("WebSocket opened"),
//       (err) => console.log("WebSocket error:", err),
//       () => console.log("WebSocket closed")
//     );

//     return () => {
//       chatSocket.disconnect();
//     };
//   }, [workspaceSlug]);

//   return null;
// }
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "src/redux/hooks";
import { updateGroup } from "src/redux/chatSlice";
import { useUser } from "src/context/userContext";
import { useChatSocket } from "src/context/chatContext";
import {
  deleteMessage,
  replaceTemporaryMessage,
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
        console.log("parsedparsedparsed", parsed);
        if (parsed.workspace && parsed.workspace !== workspaceSlug) return;

        switch (parsed.type) {
          case "group":
            dispatch(updateGroup(parsed.result));
            break;
          case "message":
            console.log("parsed");
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
            }else if (parsed.intent === "delete") {
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
