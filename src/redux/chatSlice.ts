import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ChatService } from "src/services";
import { IChatGroup } from "src/types";
import { RootState } from "./store";

const chatService = new ChatService();

/* ------------------ ENTITY ADAPTER ------------------ */

const groupsAdapter = createEntityAdapter<IChatGroup>({
  selectId: (g) => g.id,
  sortComparer: false,
});

/* ------------------ ASYNC THUNK ------------------ */

export const fetchGroups = createAsyncThunk<IChatGroup[], string>(
  "chat/fetchGroups",
  async (workspaceSlug) => {
    return await chatService.userChats(workspaceSlug);
  }
);

/* ------------------ STATE TYPE ------------------ */
type CurrentSelectedGroup = {
  groupId: string;
  userId: string;
  group_name: string;
};

type ChatExtraState = {
  unreadCounts: Record<string, number>;
  loader: boolean;
  selectedGroupId: string | null;
  currentSelectedGroup: Record<string, CurrentSelectedGroup | undefined>;
  searchQuery: string;
};

type ChatState = ReturnType<typeof groupsAdapter.getInitialState> &
  ChatExtraState;

/* ------------------ INITIAL STATE ------------------ */

const initialState: ChatState = groupsAdapter.getInitialState({
  unreadCounts: {},
  loader: false,
  selectedGroupId: null as string | null,
  currentSelectedGroup: {},
  searchQuery: "", // add search query state
});

/* ------------------ SLICE ------------------ */

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedGroup(state, action: PayloadAction<string>) {
      state.selectedGroupId = action.payload;
      state.unreadCounts[action.payload] = 0;
    },

    updateUnread(
      state,
      action: PayloadAction<{ groupId: string; count: number }>
    ) {
      const { groupId, count } = action.payload;
      state.unreadCounts[groupId] = count;
    },

    updateGroup(state, action: PayloadAction<IChatGroup>) {
      if (!action.payload.id) return;
      groupsAdapter.upsertOne(state, action.payload);
    },
    updateGroupMembers(state, action: PayloadAction<IChatGroup>) {
      if(!action.payload.id) return
      console.log("updateGroupMembers called",action.payload)
      groupsAdapter.upsertOne(state, action.payload);
    },

    removeGroup(state, action: PayloadAction<string>) {
      groupsAdapter.removeOne(state, action.payload);
    },

    setCurrentSelectedGroup(
      state,
      action: PayloadAction<{
        workspaceSlug: string;
        groupId: string;
        userId: string;
        group_name: string;
      }>
    ) {
      const { workspaceSlug, groupId, userId, group_name } = action.payload;

      state.currentSelectedGroup[workspaceSlug] = {
        groupId,
        userId,
        group_name,
      };

      state.unreadCounts[groupId] = 0;

      // persist last selected group
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            `timely_last_selected_chat_${workspaceSlug}`,
            groupId
          );
        } catch {}
      }
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload; // update search query
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loader = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        groupsAdapter.setAll(state, action.payload);

        action.payload.forEach((g) => {
          state.unreadCounts[g.id] = g.unread_count ?? 0;
        });

        state.loader = false;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.loader = false;
      });
  },
});

/* ------------------ EXPORTS ------------------ */

export const {
  setSelectedGroup,
  updateUnread,
  updateGroup,
  setCurrentSelectedGroup,
  removeGroup,
  updateGroupMembers,
  setSearchQuery, // export search query setter
} = chatSlice.actions;

export default chatSlice.reducer;

/* ------------------ SELECTORS ------------------ */

export const {
  selectAll: selectAllGroups,
  selectById: selectGroupById,
  selectIds: selectGroupIds,
} = groupsAdapter.getSelectors<RootState>((state) => state.chat);

export const selectCurrentSelectedGroup = (
  state: RootState,
  workspaceSlug: string
) => state.chat.currentSelectedGroup[workspaceSlug];

export const getGroup = (state: RootState, groupId: string) => {
  return state.chat.entities[groupId] || (null as IChatGroup | null);
};

// Selector to get the search results
export const selectFilteredGroupIds = (state: RootState) => {
  const searchQuery = state.chat.searchQuery.trim().toLowerCase();
  const workspaceSlug = state.chat.selectedGroupId;

  if (!workspaceSlug) return [];

  const groups = Object.values(state.chat.entities).filter((group) => {
    return group?.workspace_slug === workspaceSlug;
  });

  let ids = groups.map((group) => group?.id).filter((id) => !!id);

  if (searchQuery) {
    ids = ids.filter((groupId) =>
      groups.find((group) => group?.group_name.toLowerCase().includes(searchQuery))
    );
  }

  // Sort by pinned status, last message timestamp, and unread count
  return ids.sort((a, b) => {
    const groupA = state.chat.entities[a];
    const groupB = state.chat.entities[b];

    const pinnedA = groupA?.is_pinned ? 1 : 0;
    const pinnedB = groupB?.is_pinned ? 1 : 0;

    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA;
    }

    const messageA = groupA?.last_message;
    const messageB = groupB?.last_message;

    const timestampA = messageA ? new Date(messageA.created_at).getTime() : 0;
    const timestampB = messageB ? new Date(messageB.created_at).getTime() : 0;

    if (timestampA !== timestampB) {
      return timestampB - timestampA;
    }

    const unreadA = state.chat.unreadCounts[a] ?? 0;
    const unreadB = state.chat.unreadCounts[b] ?? 0;

    return unreadB - unreadA;
  });
};
