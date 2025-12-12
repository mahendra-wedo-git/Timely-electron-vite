import { createContext, useContext, useState, useCallback, ReactNode, FC } from "react";
import { UserService } from "src/services/user.service";
import { IUser } from "src/types";
// import type { IUser } from "@plane/types";
// import { UserService } from "@/services/user.service";

type TUserErrorStatus = {
  status: string;
  message: string;
};

interface IUserContextState {
  data: IUser | undefined;
  isLoading: boolean;
  error: TUserErrorStatus | null;
  fetchCurrentUser: () => Promise<IUser | undefined>;
}
export interface UserContextProviderProps {
  children: ReactNode;
}
const UserContext = createContext<IUserContextState | undefined>(undefined);

export const UserProvider:FC<UserContextProviderProps> = ({ children }) => {
  const [data, setData] = useState<IUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TUserErrorStatus | null>(null);

  const userService = new UserService();

  /**
   * ONLY CALL userService.currentUser()
   */
  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.currentUser();
      setData(user);
      return user;
    } catch (err) {
      setError({
        status: "user-fetch-error",
        message: "Failed to fetch current user",
      });
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        data,
        isLoading,
        error,
        fetchCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
};
