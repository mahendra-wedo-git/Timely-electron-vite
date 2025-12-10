import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { BrowserPersistence, localStorageKeys } from "../utils";

interface AppContextType {
  authToken: string;
  setAuthToken: Dispatch<SetStateAction<string>>;
  isForgotPassword: boolean;
  setIsForgotPassword: Dispatch<SetStateAction<boolean>>;
  isCurrentAuthTab: string;
  setCurrentAuthTab: Dispatch<SetStateAction<string>>;
  isAuthDrawerOpen: boolean;
  setIsAuthDrawerOpen: Dispatch<SetStateAction<boolean>>;
}
export interface AppContextProviderProps {
  children: ReactNode;
}

const contextData: AppContextType = {
  authToken: "",
  setAuthToken: () => null,
  isForgotPassword: false,
  setIsForgotPassword: () => null,
  isCurrentAuthTab: "",
  setCurrentAuthTab: () => null,
  isAuthDrawerOpen: false,
  setIsAuthDrawerOpen: () => null,
};

const AppContext = createContext(contextData);

export const AppContextProvider: FC<AppContextProviderProps> = ({
  children,
}) => {
  const storage = new BrowserPersistence();
  const token: string = storage.getItem(localStorageKeys.AUTH_TOKEN);
  const [authToken, setAuthToken] = useState<string>(token || "");
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isCurrentAuthTab, setCurrentAuthTab] = useState<string>("LOGIN");
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        authToken,
        setAuthToken,
        isForgotPassword,
        setIsForgotPassword,
        isCurrentAuthTab,
        setCurrentAuthTab,
        isAuthDrawerOpen,
        setIsAuthDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
