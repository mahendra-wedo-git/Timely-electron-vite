
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserLite } from "src/types";

interface MemberRootState {
  memberMap: Record<string, IUserLite>;
}

const initialState: MemberRootState = {
  memberMap: {},
};

const memberRootSlice = createSlice({
  name: "memberRoot",
  initialState,
  reducers: {
    setMember: (state, action: PayloadAction<{ userId: string; user: IUserLite }>) => {
      const { userId, user } = action.payload;
      state.memberMap[userId] = user;
    },
    setMembers: (state, action: PayloadAction<Record<string, IUserLite>>) => {
      state.memberMap = { ...state.memberMap, ...action.payload };
    },
    removeMember: (state, action: PayloadAction<string>) => {
      delete state.memberMap[action.payload];
    },
    clearMembers: (state) => {
      state.memberMap = {};
    },
  },
});

export const { setMember, setMembers, removeMember, clearMembers } = memberRootSlice.actions;
export default memberRootSlice.reducer;

// Selectors
export const selectMemberMap = (state: { memberRoot: MemberRootState }) => state.memberRoot.memberMap;

export const selectMemberIds = (state: { memberRoot: MemberRootState }) => 
  Object.keys(state.memberRoot.memberMap);

export const selectUserDetails = (state: { memberRoot: MemberRootState }, userId: string) =>
  state.memberRoot.memberMap[userId] ?? undefined;
