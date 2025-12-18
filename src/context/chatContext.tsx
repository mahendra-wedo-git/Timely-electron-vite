import { createContext, FC, ReactNode, useContext, useRef } from "react";
import { ChatSocketService } from "src/services";

const ChatSocketContext = createContext<ChatSocketService | null>(null);

export const useChatSocket = () => {
  const socket = useContext(ChatSocketContext);
  if (!socket) {
    throw new Error("useChatSocket must be used inside ChatSocketProvider");
  }
  return socket;
};

export interface ChatContextProviderProps {
  children: ReactNode;
}

export const ChatSocketProvider:FC<ChatContextProviderProps> = ({ children }) => {
  const socketRef = useRef<ChatSocketService | null>(null);

  if (!socketRef.current) {
    socketRef.current = new ChatSocketService();
  }

  return (
    <ChatSocketContext.Provider value={socketRef.current}>
      {children}
    </ChatSocketContext.Provider>
  );
};
