import { configureStore } from "@reduxjs/toolkit";
import homePageSlice from "./homePageSlice";
import userSlice from "./userSlice";
import chatReducer from "./chatSlice";
import workspaceMemberReducer from "./workspaceMemberSlice";
import memberRootReducer from "./memberRootSlice";
import messageReducer from "./massagesSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    homepage: homePageSlice,
    chat: chatReducer,
    memberRoot: memberRootReducer,
    workspaceMember: workspaceMemberReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;