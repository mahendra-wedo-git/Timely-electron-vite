// import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
// import set from "lodash/set";
// import sortBy from "lodash/sortBy";
// import { WorkspaceService } from "src/services/workspace.service";
// // types
// import { IWorkspaceBulkInviteFormData, IWorkspaceMember, IWorkspaceMemberInvitation } from "src/types";
// // services
// import { EUserPermissions } from "src/utils";

// export interface IWorkspaceMembership {
//   id: string;
//   member: string;
//   role: EUserPermissions;
//   is_client: boolean;
// }

// interface WorkspaceMemberState {
//   workspaceMemberMap: Record<string, Record<string, IWorkspaceMembership>>;
//   workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]>;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: WorkspaceMemberState = {
//   workspaceMemberMap: {},
//   workspaceMemberInvitations: {},
//   loading: false,
//   error: null,
// };

// const workspaceService = new WorkspaceService();


// // Async Thunks
// export const fetchWorkspaceMembers = createAsyncThunk(
//   "workspaceMember/fetchWorkspaceMembers",
//   async ({ workspaceSlug,  }: { workspaceSlug: string;}) => {
//     const response = await workspaceService.fetchWorkspaceMembers(workspaceSlug);
//     return { workspaceSlug, response };
//   }
// );

// export const updateMember = createAsyncThunk(
//   "workspaceMember/updateMember",
//   async (
//     {
//       workspaceSlug,
//       userId,
//       data,
//       membershipId,
//     }: {
//       workspaceSlug: string;
//       userId: string;
//       data: { role: EUserPermissions };
//       membershipId: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       await workspaceService.updateWorkspaceMember(workspaceSlug, membershipId, data as any);
//       return { workspaceSlug, userId, data };
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// export const removeMemberFromWorkspace = createAsyncThunk(
//   "workspaceMember/removeMemberFromWorkspace",
//   async (
//     {
//       workspaceSlug,
//       userId,
//       membershipId,
//       memberRoot,
//     }: {
//       workspaceSlug: string;
//       userId: string;
//       membershipId: string;
//       memberRoot: any;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       await workspaceService.deleteWorkspaceMember(workspaceSlug, membershipId);
//       return { workspaceSlug, userId, memberRoot };
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// export const inactiveMemberFromWorkspace = createAsyncThunk(
//   "workspaceMember/inactiveMemberFromWorkspace",
//   async (
//     {
//       workspaceSlug,
//       userId,
//       membershipId,
//       memberRoot,
//     }: {
//       workspaceSlug: string;
//       userId: string;
//       membershipId: string;
//       memberRoot: any;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       await workspaceService.inactiveWorkspaceMember(workspaceSlug, membershipId);
//       return { workspaceSlug, userId, memberRoot };
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// export const fetchWorkspaceMemberInvitations = createAsyncThunk(
//   "workspaceMember/fetchWorkspaceMemberInvitations",
//   async (workspaceSlug: string) => {
//     const response = await workspaceService.workspaceInvitations(workspaceSlug);
//     return { workspaceSlug, response };
//   }
// );

// export const inviteMembersToWorkspace = createAsyncThunk(
//   "workspaceMember/inviteMembersToWorkspace",
//   async ({ workspaceSlug, data }: { workspaceSlug: string; data: IWorkspaceBulkInviteFormData }, { dispatch }) => {
//     const response = await workspaceService.inviteWorkspace(workspaceSlug, data);
//     await dispatch(fetchWorkspaceMemberInvitations(workspaceSlug));
//     return response;
//   }
// );

// export const updateMemberInvitation = createAsyncThunk(
//   "workspaceMember/updateMemberInvitation",
//   async (
//     {
//       workspaceSlug,
//       invitationId,
//       data,
//     }: {
//       workspaceSlug: string;
//       invitationId: string;
//       data: Partial<IWorkspaceMemberInvitation>;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       await workspaceService.updateWorkspaceInvitation(workspaceSlug, invitationId, data);
//       return { workspaceSlug, invitationId, data };
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// export const deleteMemberInvitation = createAsyncThunk(
//   "workspaceMember/deleteMemberInvitation",
//   async ({ workspaceSlug, invitationId }: { workspaceSlug: string; invitationId: string }) => {
//     await workspaceService.deleteWorkspaceInvitations(workspaceSlug, invitationId);
//     return { workspaceSlug, invitationId };
//   }
// );

// // Slice
// const workspaceMemberSlice = createSlice({
//   name: "workspaceMember",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Workspace Members
//       .addCase(fetchWorkspaceMembers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
//         state.loading = false;
//         const { workspaceSlug, response, memberRoot } = action.payload;
        
//         response.forEach((member) => {
//           // Update member root
//           if (memberRoot?.memberMap) {
//             set(memberRoot.memberMap, member.member.id, {
//               ...member.member,
//               joining_date: member.created_at,
//             });
//           }
          
//           // Update workspace member map
//           set(state.workspaceMemberMap, [workspaceSlug, member.member.id], {
//             id: member.id,
//             member: member.member.id,
//             role: member.role,
//             is_client: member.is_client,
//           });
//         });
//       })
//       .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || "Failed to fetch workspace members";
//       })

//       // Update Member
//       .addCase(updateMember.pending, (state, action) => {
//         const { workspaceSlug, userId, data } = action.meta.arg;
//         // Optimistic update
//         if (state.workspaceMemberMap[workspaceSlug]?.[userId]) {
//           state.workspaceMemberMap[workspaceSlug][userId].role = data.role;
//         }
//       })
//       .addCase(updateMember.rejected, (state, action) => {
//         state.error = action.payload as string || "Failed to update member";
//         // Revert handled by re-fetching or storing original data
//       })

//       // Remove Member
//       .addCase(removeMemberFromWorkspace.fulfilled, (state, action) => {
//         const { workspaceSlug, userId, memberRoot } = action.payload;
//         if (state.workspaceMemberMap[workspaceSlug]) {
//           delete state.workspaceMemberMap[workspaceSlug][userId];
//         }
//         if (memberRoot?.memberMap) {
//           delete memberRoot.memberMap[userId];
//         }
//       })

//       // Inactive Member
//       .addCase(inactiveMemberFromWorkspace.fulfilled, (state, action) => {
//         const { workspaceSlug, userId, memberRoot } = action.payload;
//         if (state.workspaceMemberMap[workspaceSlug]) {
//           delete state.workspaceMemberMap[workspaceSlug][userId];
//         }
//         if (memberRoot?.memberMap) {
//           delete memberRoot.memberMap[userId];
//         }
//       })

//       // Fetch Invitations
//       .addCase(fetchWorkspaceMemberInvitations.fulfilled, (state, action) => {
//         const { workspaceSlug, response } = action.payload;
//         state.workspaceMemberInvitations[workspaceSlug] = response;
//       })

//       // Update Invitation
//       .addCase(updateMemberInvitation.pending, (state, action) => {
//         const { workspaceSlug, invitationId, data } = action.meta.arg;
//         // Optimistic update
//         if (state.workspaceMemberInvitations[workspaceSlug]) {
//           state.workspaceMemberInvitations[workspaceSlug] = state.workspaceMemberInvitations[workspaceSlug].map(
//             (invitation) => ({
//               ...invitation,
//               ...(invitation.id === invitationId && data),
//             })
//           );
//         }
//       })
//       .addCase(updateMemberInvitation.rejected, (state, action) => {
//         state.error = action.payload as string || "Failed to update invitation";
//       })

//       // Delete Invitation
//       .addCase(deleteMemberInvitation.fulfilled, (state, action) => {
//         const { workspaceSlug, invitationId } = action.payload;
//         if (state.workspaceMemberInvitations[workspaceSlug]) {
//           state.workspaceMemberInvitations[workspaceSlug] = state.workspaceMemberInvitations[
//             workspaceSlug
//           ].filter((inv) => inv.id !== invitationId);
//         }
//       });
//   },
// });

// export const { clearError } = workspaceMemberSlice.actions;
// export default workspaceMemberSlice.reducer;

// // Selectors
// export const selectWorkspaceMemberMap = (state: { workspaceMember: WorkspaceMemberState }) =>
//   state.workspaceMember.workspaceMemberMap;

// export const selectWorkspaceMemberInvitations = (state: { workspaceMember: WorkspaceMemberState }) =>
//   state.workspaceMember.workspaceMemberInvitations;

// export const selectLoading = (state: { workspaceMember: WorkspaceMemberState }) => state.workspaceMember.loading;

// export const selectError = (state: { workspaceMember: WorkspaceMemberState }) => state.workspaceMember.error;

// // Memoized Selectors
// export const makeSelectWorkspaceMemberIds = () =>
//   createSelector(
//     [
//       selectWorkspaceMemberMap,
//       (_: any, workspaceSlug: string) => workspaceSlug,
//       (_: any, __: string, userStore: any) => userStore,
//       (_: any, __: string, ___: any, memberRoot: any) => memberRoot,
//     ],
//     (workspaceMemberMap, workspaceSlug, userStore, memberRoot): string[] | null => {
//       if (!workspaceSlug) return null;
//       let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {});
//       members = sortBy(members, [
//         (m) => m.member !== userStore?.data?.id,
//         (m) => memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
//       ]);
//       const memberIds = members
//         .filter((m) => !memberRoot?.memberMap?.[m.member]?.is_bot)
//         .map((m) => m.member);
//       return memberIds;
//     }
//   );

// export const makeSelectWorkspaceSalesMemberIds = () =>
//   createSelector(
//     [
//       selectWorkspaceMemberMap,
//       (_: any, workspaceSlug: string) => workspaceSlug,
//       (_: any, __: string, userStore: any) => userStore,
//       (_: any, __: string, ___: any, memberRoot: any) => memberRoot,
//     ],
//     (workspaceMemberMap, workspaceSlug, userStore, memberRoot): string[] | null => {
//       if (!workspaceSlug) return null;
//       let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {});
//       members = members.filter((m) =>
//         [
//           EUserPermissions.ADMIN,
//           EUserPermissions.MANAGER,
//           EUserPermissions.SALES,
//           EUserPermissions.SALES_MANAGER,
//         ].includes(m.role)
//       );
//       members = sortBy(members, [
//         (m) => m.member !== userStore?.data?.id,
//         (m) => memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
//       ]);
//       const memberIds = members
//         .filter((m) => !memberRoot?.memberMap?.[m.member]?.is_bot)
//         .map((m) => m.member);
//       return memberIds;
//     }
//   );

// export const makeSelectWorkspaceManagerMemberIds = () =>
//   createSelector(
//     [
//       selectWorkspaceMemberMap,
//       (_: any, workspaceSlug: string) => workspaceSlug,
//       (_: any, __: string, userStore: any) => userStore,
//       (_: any, __: string, ___: any, memberRoot: any) => memberRoot,
//     ],
//     (workspaceMemberMap, workspaceSlug, userStore, memberRoot): string[] | null => {
//       if (!workspaceSlug) return null;
//       let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {});
//       members = members.filter((m) =>
//         [EUserPermissions.ADMIN, EUserPermissions.MANAGER, EUserPermissions.TEAM_LEAD].includes(m.role)
//       );
//       members = sortBy(members, [
//         (m) => m.member !== userStore?.data?.id,
//         (m) => memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
//       ]);
//       const memberIds = members
//         .filter((m) => !memberRoot?.memberMap?.[m.member]?.is_bot)
//         .map((m) => m.member);
//       return memberIds;
//     }
//   );

// export const makeSelectMemberMap = () =>
//   createSelector(
//     [selectWorkspaceMemberMap, (_: any, workspaceSlug: string) => workspaceSlug],
//     (workspaceMemberMap, workspaceSlug): Record<string, IWorkspaceMembership> | null => {
//       if (!workspaceSlug) return null;
//       return workspaceMemberMap?.[workspaceSlug] ?? {};
//     }
//   );

// export const makeSelectWorkspaceMemberInvitationIds = () =>
//   createSelector(
//     [selectWorkspaceMemberInvitations, (_: any, workspaceSlug: string) => workspaceSlug],
//     (workspaceMemberInvitations, workspaceSlug): string[] | null => {
//       if (!workspaceSlug) return null;
//       return workspaceMemberInvitations?.[workspaceSlug]?.map((inv) => inv.id) ?? null;
//     }
//   );

// export const makeSelectWorkspaceMemberDetails = () =>
//   createSelector(
//     [
//       selectWorkspaceMemberMap,
//       (_: any, workspaceSlug: string) => workspaceSlug,
//       (_: any, __: string, userId: string) => userId,
//       (_: any, __: string, ___: string, memberRoot: any) => memberRoot,
//     ],
//     (workspaceMemberMap, workspaceSlug, userId, memberRoot): IWorkspaceMember | null => {
//       if (!workspaceSlug) return null;
//       const workspaceMember = workspaceMemberMap?.[workspaceSlug]?.[userId];
//       if (!workspaceMember) return null;

//       const memberDetails: IWorkspaceMember = {
//         id: workspaceMember.id,
//         role: workspaceMember.role as any,
//         member: memberRoot?.memberMap?.[workspaceMember.member],
//         is_client: workspaceMember.is_client,
//       };
//       return memberDetails;
//     }
//   );

// export const makeSelectWorkspaceInvitationDetails = () =>
//   createSelector(
//     [
//       selectWorkspaceMemberInvitations,
//       (_: any, workspaceSlug: string) => workspaceSlug,
//       (_: any, __: string, invitationId: string) => invitationId,
//     ],
//     (workspaceMemberInvitations, workspaceSlug, invitationId): IWorkspaceMemberInvitation | null => {
//       if (!workspaceSlug) return null;
//       const invitationsList = workspaceMemberInvitations?.[workspaceSlug];
//       if (!invitationsList) return null;

//       const invitation = invitationsList.find((inv) => inv.id === invitationId);
//       return invitation ?? null;
//     }
//   );

// // Helper function for searching members
// export const selectSearchedWorkspaceMemberIds = createSelector(
//   [
//     selectWorkspaceMemberMap,
//     (_: any, workspaceSlug: string) => workspaceSlug,
//     (_: any, __: string, searchQuery: string) => searchQuery,
//     (_: any, __: string, ___: string, userStore: any) => userStore,
//     (_: any, __: string, ___: string, ____: any, memberRoot: any) => memberRoot,
//   ],
//   (workspaceMemberMap, workspaceSlug, searchQuery, userStore, memberRoot): string[] | null => {
//     if (!workspaceSlug) return null;
//     let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {});
//     members = sortBy(members, [
//       (m) => m.member !== userStore?.data?.id,
//       (m) => memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
//     ]);
//     const memberIds = members
//       .filter((m) => !memberRoot?.memberMap?.[m.member]?.is_bot)
//       .map((m) => m.member);

//     const searchedIds = memberIds.filter((userId) => {
//       const workspaceMember = workspaceMemberMap?.[workspaceSlug]?.[userId];
//       if (!workspaceMember) return false;
//       const member = memberRoot?.memberMap?.[workspaceMember.member];
//       if (!member) return false;

//       const memberSearchQuery = `${member.first_name} ${member.last_name} ${member?.display_name} ${
//         member.email ?? ""
//       }`;
//       return memberSearchQuery.toLowerCase()?.includes(searchQuery.toLowerCase());
//     });

//     return searchedIds;
//   }
// );

// // Helper function for searching invitations
// export const selectSearchedWorkspaceInvitationIds = createSelector(
//   [
//     selectWorkspaceMemberInvitations,
//     (_: any, workspaceSlug: string) => workspaceSlug,
//     (_: any, __: string, searchQuery: string) => searchQuery,
//   ],
//   (workspaceMemberInvitations, workspaceSlug, searchQuery): string[] | null => {
//     if (!workspaceSlug) return null;
//     const invitations = workspaceMemberInvitations?.[workspaceSlug];
//     if (!invitations) return null;

//     const searchedIds = invitations
//       .filter((invitation) => {
//         const invitationSearchQuery = `${invitation.email}`;
//         return invitationSearchQuery.toLowerCase()?.includes(searchQuery.toLowerCase());
//       })
//       .map((inv) => inv.id);

//     return searchedIds;
//   }
// );



import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import set from "lodash/set";
import sortBy from "lodash/sortBy";
import { IWorkspaceBulkInviteFormData, IWorkspaceMember, IWorkspaceMemberInvitation } from "src/types";
import { setMember, removeMember } from "./memberRootSlice";
import { EUserPermissions } from "src/utils";
import { WorkspaceService } from "src/services/workspace.service";

export interface IWorkspaceMembership {
  id: string;
  member: string;
  role: EUserPermissions;
  is_client: boolean;
}

interface WorkspaceMemberState {
  workspaceMemberMap: Record<string, Record<string, IWorkspaceMembership>>;
  workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]>;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceMemberState = {
  workspaceMemberMap: {},
  workspaceMemberInvitations: {},
  loading: false,
  error: null,
};

const workspaceService = new WorkspaceService();

// Async Thunks
export const fetchWorkspaceMembers = createAsyncThunk(
  "workspaceMember/fetchWorkspaceMembers",
  async (workspaceSlug: string, { dispatch }) => {
    const response = await workspaceService.fetchWorkspaceMembers(workspaceSlug);
    
    // Update memberRoot with user details
    response.forEach((member) => {
      dispatch(setMember({
        userId: member.member.id,
        user: { ...member.member, joining_date: member.created_at }
      }));
    });
    
    return { workspaceSlug, response };
  }
);

export const updateMember = createAsyncThunk(
  "workspaceMember/updateMember",
  async (
    {
      workspaceSlug,
      userId,
      data,
      membershipId,
    }: {
      workspaceSlug: string;
      userId: string;
      data: { role: EUserPermissions };
      membershipId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await workspaceService.updateWorkspaceMember(workspaceSlug, membershipId, data as any);
      return { workspaceSlug, userId, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMemberFromWorkspace = createAsyncThunk(
  "workspaceMember/removeMemberFromWorkspace",
  async (
    {
      workspaceSlug,
      userId,
      membershipId,
    }: {
      workspaceSlug: string;
      userId: string;
      membershipId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await workspaceService.deleteWorkspaceMember(workspaceSlug, membershipId);
      
      // Remove from memberRoot
      dispatch(removeMember(userId));
      
      return { workspaceSlug, userId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const inactiveMemberFromWorkspace = createAsyncThunk(
  "workspaceMember/inactiveMemberFromWorkspace",
  async (
    {
      workspaceSlug,
      userId,
      membershipId,
    }: {
      workspaceSlug: string;
      userId: string;
      membershipId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await workspaceService.inactiveWorkspaceMember(workspaceSlug, membershipId);
      
      // Remove from memberRoot
      dispatch(removeMember(userId));
      
      return { workspaceSlug, userId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkspaceMemberInvitations = createAsyncThunk(
  "workspaceMember/fetchWorkspaceMemberInvitations",
  async (workspaceSlug: string) => {
    const response = await workspaceService.workspaceInvitations(workspaceSlug);
    return { workspaceSlug, response };
  }
);

export const inviteMembersToWorkspace = createAsyncThunk(
  "workspaceMember/inviteMembersToWorkspace",
  async ({ workspaceSlug, data }: { workspaceSlug: string; data: IWorkspaceBulkInviteFormData }, { dispatch }) => {
    const response = await workspaceService.inviteWorkspace(workspaceSlug, data);
    await dispatch(fetchWorkspaceMemberInvitations(workspaceSlug));
    return response;
  }
);

export const updateMemberInvitation = createAsyncThunk(
  "workspaceMember/updateMemberInvitation",
  async (
    {
      workspaceSlug,
      invitationId,
      data,
    }: {
      workspaceSlug: string;
      invitationId: string;
      data: Partial<IWorkspaceMemberInvitation>;
    },
    { rejectWithValue }
  ) => {
    try {
      await workspaceService.updateWorkspaceInvitation(workspaceSlug, invitationId, data);
      return { workspaceSlug, invitationId, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMemberInvitation = createAsyncThunk(
  "workspaceMember/deleteMemberInvitation",
  async ({ workspaceSlug, invitationId }: { workspaceSlug: string; invitationId: string }) => {
    await workspaceService.deleteWorkspaceInvitations(workspaceSlug, invitationId);
    return { workspaceSlug, invitationId };
  }
);

// Slice
const workspaceMemberSlice = createSlice({
  name: "workspaceMember",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.loading = false;
        const { workspaceSlug, response } = action.payload;
        
        response.forEach((member) => {
          set(state.workspaceMemberMap, [workspaceSlug, member.member.id], {
            id: member.id,
            member: member.member.id,
            role: member.role,
            is_client: member.is_client,
          });
        });
      })
      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch workspace members";
      })
      .addCase(updateMember.pending, (state, action) => {
        const { workspaceSlug, userId, data } = action.meta.arg;
        if (state.workspaceMemberMap[workspaceSlug]?.[userId]) {
          state.workspaceMemberMap[workspaceSlug][userId].role = data.role;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to update member";
      })
      .addCase(removeMemberFromWorkspace.fulfilled, (state, action) => {
        const { workspaceSlug, userId } = action.payload;
        if (state.workspaceMemberMap[workspaceSlug]) {
          delete state.workspaceMemberMap[workspaceSlug][userId];
        }
      })
      .addCase(inactiveMemberFromWorkspace.fulfilled, (state, action) => {
        const { workspaceSlug, userId } = action.payload;
        if (state.workspaceMemberMap[workspaceSlug]) {
          delete state.workspaceMemberMap[workspaceSlug][userId];
        }
      })
      .addCase(fetchWorkspaceMemberInvitations.fulfilled, (state, action) => {
        const { workspaceSlug, response } = action.payload;
        state.workspaceMemberInvitations[workspaceSlug] = response;
      })
      .addCase(updateMemberInvitation.pending, (state, action) => {
        const { workspaceSlug, invitationId, data } = action.meta.arg;
        if (state.workspaceMemberInvitations[workspaceSlug]) {
          state.workspaceMemberInvitations[workspaceSlug] = state.workspaceMemberInvitations[workspaceSlug].map(
            (invitation) => ({
              ...invitation,
              ...(invitation.id === invitationId && data),
            })
          );
        }
      })
      .addCase(updateMemberInvitation.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to update invitation";
      })
      .addCase(deleteMemberInvitation.fulfilled, (state, action) => {
        const { workspaceSlug, invitationId } = action.payload;
        if (state.workspaceMemberInvitations[workspaceSlug]) {
          state.workspaceMemberInvitations[workspaceSlug] = state.workspaceMemberInvitations[
            workspaceSlug
          ].filter((inv) => inv.id !== invitationId);
        }
      });
  },
});

export const { clearError } = workspaceMemberSlice.actions;
export default workspaceMemberSlice.reducer;

// Basic Selectors
export const selectWorkspaceMemberMap = (state: { workspaceMember: WorkspaceMemberState }) =>
  state.workspaceMember.workspaceMemberMap;

export const selectWorkspaceMemberInvitations = (state: { workspaceMember: WorkspaceMemberState }) =>
  state.workspaceMember.workspaceMemberInvitations;

export const selectLoading = (state: { workspaceMember: WorkspaceMemberState }) => 
  state.workspaceMember.loading;

export const selectError = (state: { workspaceMember: WorkspaceMemberState }) => 
  state.workspaceMember.error;

// Combined Selectors (using memberRoot + workspaceMember)
export const selectWorkspaceMemberIds = createSelector(
  [
    (state: any) => state.workspaceMember.workspaceMemberMap,
    (state: any) => state.memberRoot.memberMap,
    (state: any) => state.user?.data?.id, // current user ID
    (_: any, workspaceSlug: string) => workspaceSlug,
  ],
  (workspaceMemberMap, memberMap, currentUserId, workspaceSlug): string[] | null => {
    if (!workspaceSlug) return null;
    let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {}) as IWorkspaceMembership[];
    members = sortBy(members, [
      (m) => m.member !== currentUserId,
      (m) => memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);
    const memberIds = members
      .filter((m) => !memberMap?.[m.member]?.is_bot)
      .map((m) => m.member);
    return memberIds;
  }
);

export const selectWorkspaceSalesMemberIds = createSelector(
  [
    (state: any) => state.workspaceMember.workspaceMemberMap,
    (state: any) => state.memberRoot.memberMap,
    (state: any) => state.user?.data?.id,
    (_: any, workspaceSlug: string) => workspaceSlug,
  ],
  (workspaceMemberMap, memberMap, currentUserId, workspaceSlug): string[] | null => {
    if (!workspaceSlug) return null;
    let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {}) as IWorkspaceMembership[];
    members = members.filter((m) =>
      [
        EUserPermissions.ADMIN,
        EUserPermissions.MANAGER,
        EUserPermissions.SALES,
        EUserPermissions.SALES_MANAGER,
      ].includes(m.role)
    );
    members = sortBy(members, [
      (m) => m.member !== currentUserId,
      (m) => memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);
    const memberIds = members
      .filter((m) => !memberMap?.[m.member]?.is_bot)
      .map((m) => m.member);
    return memberIds;
  }
);

export const selectWorkspaceManagerMemberIds = createSelector(
  [
    (state: any) => state.workspaceMember.workspaceMemberMap,
    (state: any) => state.memberRoot.memberMap,
    (state: any) => state.user?.data?.id,
    (_: any, workspaceSlug: string) => workspaceSlug,
  ],
  (workspaceMemberMap, memberMap, currentUserId, workspaceSlug): string[] | null => {
    if (!workspaceSlug) return null;
    let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {}) as IWorkspaceMembership[];
    members = members.filter((m) =>
      [EUserPermissions.ADMIN, EUserPermissions.MANAGER, EUserPermissions.TEAM_LEAD].includes(m.role)
    );
    members = sortBy(members, [
      (m) => m.member !== currentUserId,
      (m) => memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);
    const memberIds = members
      .filter((m) => !memberMap?.[m.member]?.is_bot)
      .map((m) => m.member);
    return memberIds;
  }
);

export const selectWorkspaceMemberDetails = createSelector(
  [
    (state: any) => state.workspaceMember.workspaceMemberMap,
    (state: any) => state.memberRoot.memberMap,
    (_: any, workspaceSlug: string) => workspaceSlug,
    (_: any, __: string, userId: string) => userId,
  ],
  (workspaceMemberMap, memberMap, workspaceSlug, userId): IWorkspaceMember | null => {
    if (!workspaceSlug) return null;
    const workspaceMember = workspaceMemberMap?.[workspaceSlug]?.[userId];
    if (!workspaceMember) return null;

    const memberDetails: IWorkspaceMember = {
      id: workspaceMember.id,
      role: workspaceMember.role as any,
      member: memberMap?.[workspaceMember.member],
      is_client: workspaceMember.is_client,
    };
    return memberDetails;
  }
);

export const selectSearchedWorkspaceMemberIds = createSelector(
  [
    (state: any) => state.workspaceMember.workspaceMemberMap,
    (state: any) => state.memberRoot.memberMap,
    (state: any) => state.user?.data?.id,
    (_: any, workspaceSlug: string) => workspaceSlug,
    (_: any, __: string, searchQuery: string) => searchQuery,
  ],
  (workspaceMemberMap, memberMap, currentUserId, workspaceSlug, searchQuery): string[] | null => {
    if (!workspaceSlug) return null;
    let members = Object.values(workspaceMemberMap?.[workspaceSlug] ?? {}) as IWorkspaceMembership[];
    members = sortBy(members, [
      (m) => m.member !== currentUserId,
      (m) => memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);
    const memberIds = members
      .filter((m) => !memberMap?.[m.member]?.is_bot)
      .map((m) => m.member);

    const searchedIds = memberIds.filter((userId) => {
      const member = memberMap?.[userId];
      if (!member) return false;

      const memberSearchQuery = `${member.first_name} ${member.last_name} ${member?.display_name} ${
        member.email ?? ""
      }`;
      return memberSearchQuery.toLowerCase()?.includes(searchQuery.toLowerCase());
    });

    return searchedIds;
  }
);
