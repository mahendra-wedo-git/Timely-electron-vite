
import { combineComponents } from "../utils/combineComponents";
import { AppContextProvider, AppContextProviderProps } from "./appContext";

export const RootContextProvider = combineComponents<
  AppContextProviderProps 
>(AppContextProvider);