
import { combineComponents } from "../utils/combineComponents";
import { AppContextProvider, AppContextProviderProps } from "./appContext";
import { UserContextProviderProps, UserProvider } from "./userContext";

export const RootContextProvider = combineComponents<
  AppContextProviderProps | UserContextProviderProps
>(AppContextProvider,UserProvider);