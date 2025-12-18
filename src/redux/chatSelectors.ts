import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { selectAllGroups } from "./chatSlice";

export const selectSortedGroups = createSelector(
  [
    selectAllGroups,
    (state: RootState) => state.chat.unreadCounts,
  ],
  (groups, unreadCounts) => {
    return [...groups].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return Number(b.is_pinned) - Number(a.is_pinned);
      }
      return (unreadCounts[b.id] ?? 0) - (unreadCounts[a.id] ?? 0);
    });
  }
);
