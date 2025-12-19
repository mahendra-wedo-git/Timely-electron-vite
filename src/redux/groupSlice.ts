// import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
// import { ChatService } from 'src/services';
// import { IChatGroup, IChatPin, IMuteChat } from 'src/types';

// // Define the initial state of the slice
// interface GroupState {
//   groupMap: Record<string, Record<string, IChatGroup>>;
//   unreadCounts: Record<string, number>;
//   groupDetailPeek: Record<string, { isOpen: boolean; group: IChatGroup | null }>;
//   currentSelectedGroup: Record<string, { groupId: string; userId: string; group_name: string } | undefined>; 
//   showFullSettings: boolean;
//   loader: 'init-loading' | 'fetching-groups' | undefined;
// }

// const initialState: GroupState = {
//   groupMap: {},
//   unreadCounts: {},
//   groupDetailPeek: {},
//   currentSelectedGroup: {},
//   showFullSettings: false,
//   loader: undefined,
// };

// // Define thunks for async actions
// export const fetchGroups = createAsyncThunk<IChatGroup[], string, { rejectValue: string }>(
//   'groups/fetchGroups',
//   async (workspaceSlug, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       const response = await chatService.userChats(workspaceSlug);
//       return response;
//     } catch (err) {
//       return rejectWithValue('Failed to fetch groups');
//     }
//   }
// );

// export const createGroup = createAsyncThunk<IChatGroup, { workspaceSlug: string, data: Partial<IChatGroup> }>(
//   'groups/createGroup',
//   async ({ workspaceSlug, data }, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       const response = await chatService.createChatGroup(workspaceSlug, data);
//       return response;
//     } catch (err) {
//       return rejectWithValue('Failed to create group');
//     }
//   }
// );

// export const pinGroup = createAsyncThunk<IChatPin, { workspaceSlug: string; data: Partial<IChatPin> }>(
//   'groups/pinGroup',
//   async ({ workspaceSlug, data }, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       const response = await chatService.pinChat(workspaceSlug, data);
//       return response;
//     } catch (err) {
//       return rejectWithValue('Failed to pin group');
//     }
//   }
// );

// export const muteGroup = createAsyncThunk<IMuteChat, { workspaceSlug: string; data: Partial<IMuteChat> }>(
//   'groups/muteGroup',
//   async ({ workspaceSlug, data }, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       const response = await chatService.muteGroup(workspaceSlug, data);
//       return response;
//     } catch (err) {
//       return rejectWithValue('Failed to mute group');
//     }
//   }
// );

// export const unmuteGroup = createAsyncThunk<void, { workspaceSlug: string; muteId: string; groupId: string }>(
//   'groups/unmuteGroup',
//   async ({ workspaceSlug, muteId, groupId }, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       await chatService.unmuteGroup(workspaceSlug, muteId);
//     } catch (err) {
//       return rejectWithValue('Failed to unmute group');
//     }
//   }
// );

// export const unpinGroup = createAsyncThunk<void, { workspaceSlug: string; pinId: string; groupId: string }>(
//   'groups/unpinGroup',
//   async ({ workspaceSlug, pinId, groupId }, { rejectWithValue }) => {
//     try {
//       const chatService = new ChatService();
//       await chatService.unpinChat(workspaceSlug, pinId);
//     } catch (err) {
//       return rejectWithValue('Failed to unpin group');
//     }
//   }
// );

// // Create the slice
// const groupSlice = createSlice({
//   name: 'groups',
//   initialState,
//   reducers: {
//     setShowFullSettings(state, action: PayloadAction<boolean>) {
//       state.showFullSettings = action.payload;
//     },
//     setGroupDetailPeek(state, action: PayloadAction<{ group: IChatGroup | null; isOpen: boolean }>) {
//       const { group, isOpen } = action.payload;
//       if (group) {
//         state.groupDetailPeek[group.id] = { isOpen, group };
//       } else {
//         Object.keys(state.groupDetailPeek).forEach(id => {
//           state.groupDetailPeek[id] = { isOpen: false, group: null };
//         });
//       }
//     },
//     setCurrentSelectedGroup(state, action: PayloadAction<{ groupId: string; userId: string; group_name: string }>) {
//       const { groupId, userId, group_name } = action.payload;
//       state.currentSelectedGroup = { groupId, userId, group_name };
//     },
//     removeGroup(state, action: PayloadAction<string>) {
//       const groupId = action.payload;
//       delete state.groupMap[groupId];
//       delete state.unreadCounts[groupId];
//       delete state.groupDetailPeek[groupId];
//     },
//     updateGroup(state, action: PayloadAction<IChatGroup>) {
//       const updatedGroup = action.payload;
//       if (state.groupMap[updatedGroup.id]) {
//         state.groupMap[.id] = { ...state.groupMap[updatedGroup.id], ...updatedGroup };
//       }updatedGroup
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch groups
//       .addCase(fetchGroups.pending, (state) => {
//         state.loader = 'fetching-groups';
//       })
//       .addCase(fetchGroups.fulfilled, (state, action) => {
//         state.loader = undefined;
//         const groups = action.payload;
//         groups.forEach(group => {
//           state.groupMap[group.id] = group;
//           state.unreadCounts[group.id] = group.unread_count || 0;
//         });
//       })
//       .addCase(fetchGroups.rejected, (state, action) => {
//         state.loader = undefined;
//         console.error(action.payload);
//       })
//       // Create group
//       .addCase(createGroup.fulfilled, (state, action) => {
//         const newGroup = action.payload;
//         state.groupMap[newGroup.id] = newGroup;
//       })
//       .addCase(createGroup.rejected, (state, action) => {
//         console.error(action.payload);
//       })
//       // Pin group
//       .addCase(pinGroup.fulfilled, (state, action) => {
//         const groupId = action.payload.group;
//         const group = state.groupMap[groupId];
//         if (group) {
//           group.is_pinned = true;
//           group.pin_id = action.payload.id;
//         }
//       })
//       .addCase(pinGroup.rejected, (state, action) => {
//         console.error(action.payload);
//       })
//       // Mute group
//       .addCase(muteGroup.fulfilled, (state, action) => {
//         const groupId = action.payload.group;
//         const group = state.groupMap[groupId];
//         if (group) {
//           group.is_mute = true;
//           group.mute_id = action.payload.id;
//         }
//       })
//       .addCase(muteGroup.rejected, (state, action) => {
//         console.error(action.payload);
//       })
//       // Unmute group
//       .addCase(unmuteGroup.fulfilled, (state, action) => {
//         const groupId = action.meta.arg.groupId;
//         const group = state.groupMap[groupId];
//         if (group) {
//           group.is_mute = false;
//           group.mute_id = undefined;
//         }
//       })
//       // Unpin group
//       .addCase(unpinGroup.fulfilled, (state, action) => {
//         const groupId = action.meta.arg.groupId;
//         const group = state.groupMap[groupId];
//         if (group) {
//           group.is_pinned = false;
//           group.pin_id = undefined;
//         }
//       });
//   },
// });

// // Actions and reducer export
// export const {
//   setShowFullSettings,
//   setGroupDetailPeek,
//   setCurrentSelectedGroup,
//   removeGroup,
//   updateGroup,
// } = groupSlice.actions;

// export default groupSlice.reducer;

// // Selectors for derived state
// export const selectGroupIds = (state: any, workspaceSlug: string) => {
//   return Object.keys(state.groups.groupMap[workspaceSlug] || {});
// };

// export const selectGroup = (state: any, workspaceSlug: string, groupId: string) => {
//   return state.groups.groupMap[workspaceSlug]?.[groupId] || null;
// };

// export const selectUnreadCounts = (state: any) => state.groups.unreadCounts;
