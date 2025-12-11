import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrowserPersistence, CookiePersistence, cookieStorageKey, localStorageKeys } from "src/utils";

interface CurrentUserType {
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  id?: string;
}

interface UserState {
  token?: string;
  isSignedIn?: boolean;
  currentUser?: CurrentUserType;
}

const storage = new BrowserPersistence();
const localCookie = new CookiePersistence();
const token = storage.getItem(localStorageKeys.AUTH_TOKEN);

const initialState: UserState = {
  currentUser: { email: "", first_name: "", last_name: "" },
  isSignedIn: !!token,
  token,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<CurrentUserType>) => {
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    setToken: (state, action: PayloadAction<UserState>) => {
      if (action.payload.token) {
        storage.setItem(
          localStorageKeys.AUTH_TOKEN,
          action.payload.token,
          // 86400000
          86400000 // 1Day
        );
        localCookie.setItem(
          cookieStorageKey.AUTH_TOKEN,
          action.payload.token,
          // 86400000
          86400000 // 1Day
        );

        return {
          ...state,
          token: action.payload.token,
          isSignedIn: true,
        };
      }
    },
    clearToken: (state, action) => {
      storage.removeItem(localStorageKeys.AUTH_TOKEN);
      localCookie.removeItem(cookieStorageKey.AUTH_TOKEN);
      document.cookie =
        "PHPSESSID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      return {
        ...state,
        token: "",
        isSignedIn: false,
      };
    },
  },
});

export const { setCurrentUser, setToken, clearToken } = UserSlice.actions;
export default UserSlice.reducer;
