import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ChatService } from "src/services";
import { IChatGroup, IChatPin, IMuteChat } from "src/types";
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

export const pinGroup = createAsyncThunk<
  { pin: IChatPin; groupId: string },
  { workspaceSlug: string; data: Partial<IChatPin> }
>("chat/pinGroup", async ({ workspaceSlug, data }) => {
  const response = await chatService.pinChat(workspaceSlug, data);
  return { pin: response, groupId: data.group as string };
});

export const unpinGroup = createAsyncThunk<
  { groupId: string },
  { workspaceSlug: string; pinId: string; groupId: string }
>("chat/unpinGroup", async ({ workspaceSlug, pinId, groupId }) => {
  await chatService.unpinChat(workspaceSlug, pinId);
  return { groupId };
});

export const muteGroup = createAsyncThunk<
  { mute: IMuteChat; groupId: string },
  { workspaceSlug: string; data: Partial<IMuteChat> }
>("chat/muteGroup", async ({ workspaceSlug, data }) => {
  const response = await chatService.muteGroup(workspaceSlug, data);
  return { mute: response, groupId: data.group as string };
});

export const unmuteGroup = createAsyncThunk<
  { groupId: string },
  { workspaceSlug: string; muteId: string; groupId: string }
>("chat/unmuteGroup", async ({ workspaceSlug, muteId, groupId }) => {
  await chatService.unmuteGroup(workspaceSlug, muteId);
  return { groupId };
});

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

    // reorderGroupsBasedOnSender(state, action: PayloadAction<string>) {
    //   const senderGroupId = action.payload;

    //   const groupIds = Object.keys(state.entities);

    //   const filteredGroupIds = groupIds.filter(id => id !== senderGroupId);
    //   const reorderedGroupIds = [senderGroupId, ...filteredGroupIds];

    //   state.ids = reorderedGroupIds;
    // },

    //order chat list by sender
    reorderGroupsBasedOnSender(state, action: PayloadAction<string>) {
      const senderGroupId = action.payload;

      const groupIds = [...state.ids]; // Start with the current order (from state.ids)

      const filteredGroupIds = groupIds.filter((id) => id !== senderGroupId);

      const reorderedGroupIds = [senderGroupId, ...filteredGroupIds];

      state.ids = reorderedGroupIds;
    },

    updateGroupMembers(state, action: PayloadAction<IChatGroup>) {
      if (!action.payload.id) return;
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
      })

      // .addCase(pinGroup.fulfilled, (state, action) => {
      //   const { pin, groupId } = action.payload;
      //   console.log("action.payload",action.payload,groupsAdapter)
      //   const workspaceSlug = action.meta.arg.workspaceSlug;

      //   const group = state.groupMap[workspaceSlug]?.[groupId];
      //   if (group) {
      //     group.is_pinned = true;
      //     group.pin_id = pin.id;
      //   }
      // })

      // // Unpin Group
      // .addCase(unpinGroup.fulfilled, (state, action) => {
      //   const { groupId } = action.payload;
      //   const workspaceSlug = action.meta.arg.workspaceSlug;

      //   const group = state.groupMap[workspaceSlug]?.[groupId];
      //   if (group) {
      //     group.is_pinned = false;
      //     group.pin_id = undefined;
      //   }
      // })

      // // Mute Group
      // .addCase(muteGroup.fulfilled, (state, action) => {
      //   const { mute, groupId } = action.payload;
      //   const workspaceSlug = action.meta.arg.workspaceSlug;

      //   const group = state.groupMap[workspaceSlug]?.[groupId];
      //   if (group) {
      //     group.is_mute = true;
      //     group.mute_id = mute.id;
      //   }
      // })

      // // Unmute Group
      // .addCase(unmuteGroup.fulfilled, (state, action) => {
      //   const { groupId } = action.payload;
      //   const workspaceSlug = action.meta.arg.workspaceSlug;

      //   const group = state.groupMap[workspaceSlug]?.[groupId];
      //   if (group) {
      //     group.is_mute = false;
      //     group.mute_id = undefined;
      //   }
      // })

      .addCase(pinGroup.fulfilled, (state, action) => {
        const { pin, groupId } = action.payload;

        const group = state.entities[groupId]; // Access the group from the state using `entities`
        if (group) {
          group.is_pinned = true;
          group.pin_id = pin.id;

          groupsAdapter.upsertOne(state, group);
        }
      })

      .addCase(unpinGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const group = state.entities[groupId]; 
        if (group) {
          group.is_pinned = false;
          group.pin_id = undefined;

          groupsAdapter.upsertOne(state, group);
        }
      })

      .addCase(muteGroup.fulfilled, (state, action) => {
        const { mute, groupId } = action.payload;

        const group = state.entities[groupId]; 
        if (group) {
          group.is_mute = true;
          group.mute_id = mute.id;

          groupsAdapter.upsertOne(state, group);
        }
      })

      .addCase(unmuteGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;

        const group = state.entities[groupId]; 
        if (group) {
          group.is_mute = false;
          group.mute_id = undefined;

          groupsAdapter.upsertOne(state, group);
        }
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
  reorderGroupsBasedOnSender,
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
      groups.find((group) =>
        group?.group_name.toLowerCase().includes(searchQuery)
      )
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
