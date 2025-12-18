import { combineComponents } from "../utils/combineComponents";
import { AppContextProvider, AppContextProviderProps } from "./appContext";
import { ChatContextProviderProps, ChatSocketProvider } from "./chatContext";
import { UserContextProviderProps, UserProvider } from "./userContext";
import { WorkspaceMemberProvider, WorkspaceMemberProviderProps } from "./WorkspaceMemberContext";


export const RootContextProvider = combineComponents<
  | AppContextProviderProps
  | UserContextProviderProps
  | ChatContextProviderProps
  | WorkspaceMemberProviderProps
>(
  AppContextProvider,
  UserProvider,
  ChatSocketProvider,
  WorkspaceMemberProvider
);
