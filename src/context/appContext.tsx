import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { BrowserPersistence, localStorageKeys } from "src/utils";

interface AppContextType {
  authToken: string;
  setAuthToken: Dispatch<SetStateAction<string>>;
  isForgotPassword: boolean;
  setIsForgotPassword: Dispatch<SetStateAction<boolean>>;
  isCurrentAuthTab: string;
  setCurrentAuthTab: Dispatch<SetStateAction<string>>;
  isAuthDrawerOpen: boolean;
  setIsAuthDrawerOpen: Dispatch<SetStateAction<boolean>>;
  currentUser: CurrentUserType;
  setCurrentUser: Dispatch<SetStateAction<CurrentUserType>>;
}
interface CurrentUserType {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  id?: string;
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
  currentUser: {},
  setCurrentUser: () => null,
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
  const storedUser = localStorage.getItem("currentUser");
  const [currentUser, setCurrentUser] = useState<CurrentUserType>(
    storedUser ? JSON.parse(storedUser) : {}
  );

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
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
