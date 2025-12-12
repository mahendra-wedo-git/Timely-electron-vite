import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "src/context";
import { ChatSocketService } from "src/services";
export function ChatSocketContainer() {
  const { workspace:workspaceSlug } = useParams();
  
  const { data:currentUser, fetchCurrentUser } = useUser();
  const socketRef = useRef<ChatSocketService | null>(null);
  useEffect(() => {
    if (currentUser) return;
    const fetchCurrentWorkspaceUser = async () => {
      await fetchCurrentUser();
    }
    fetchCurrentWorkspaceUser();
  }, []);

console.log("workspaceSlug",workspaceSlug)
  const socketLock = useRef<string | null>(null);
  

  useEffect(() => {
    if (!workspaceSlug) return;
    //changes
    if (socketLock.current === workspaceSlug) return;
    socketLock.current = workspaceSlug;
    socketRef.current = new ChatSocketService();

    const socket = socketRef.current

     socket.connectToRoom(
      workspaceSlug as string,
      (msg) => console.log("WebSocket message:", msg),
      () => console.log("WebSocket opened"),
      (err) => console.log("WebSocket error:", err),
      () => console.log("WebSocket closed")
    );

    return () => {
      socket?.disconnect(); 
    };
  }, [workspaceSlug]);

  return null;
}
