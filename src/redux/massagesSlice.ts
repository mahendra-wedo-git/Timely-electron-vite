import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { 
  IChatGroupLog, 
  IChatMessage, 
  IChatPagination, 
  IChatReaction, 
  IChatTyping, 
  ILastMessageResponse, 
  IMessageReadStatus, 
  IUser, 
  IUserLite 
} from "src/types";
// import { notifyNewMessage } from "@/helpers/chat-notiication.helper";
import { ChatService } from "src/services";
import { stripAndTruncateHTML } from "src/utils/string.helper";

type TChatLoader =
  | "init-loading"
  | "last-message-loading"
  | "chat-pagination-loading"
  | "group-attachment-loading"
  | undefined;

interface MessageState {
  typingTimers: Record<string, NodeJS.Timeout>;
  typing: Record<string, { isTyping: boolean; sender?: string }>;
  lastMessage: Record<string, IChatMessage>;
  chatMessages: Record<string, Record<string, IChatMessage[]>>;
  chatPagination: Record<string, Record<string, IChatPagination>>;
  chatGroupLog: Record<string, Record<string, IChatGroupLog[]>>;
  groupAttachments: Record<string, Record<string, IChatMessage[]>>;
  groupattachmentPagination: Record<string, Record<string, IChatPagination>>;
  loader: TChatLoader;
}

const initialState: MessageState = {
  typingTimers: {},
  typing: {},
  lastMessage: {},
  chatMessages: {},
  chatPagination: {},
  chatGroupLog: {},
  groupAttachments: {},
  groupattachmentPagination: {},
  loader: undefined,
};

const chatService = new ChatService();

// Async Thunks
export const fetchSearchMessages = createAsyncThunk(
  "message/fetchSearchMessages",
  async ({ workspaceSlug, chatId, search }: { workspaceSlug: string; chatId: string; search: string }) => {
    const response = await chatService.searchChatMessages(workspaceSlug, chatId, { search });
    return response;
  }
);

export const fetchLastMessage = createAsyncThunk(
  "message/fetchLastMessage",
  async ({ workspaceSlug, currentUserId }: { workspaceSlug: string; currentUserId: string }) => {
    const response = await chatService.getWorkspaceLastMessages(workspaceSlug);
    return { response, currentUserId };
  }
);

export const fetchChatGroupLog = createAsyncThunk(
  "message/fetchChatGroupLog",
  async ({ workspaceSlug, chatId }: { workspaceSlug: string; chatId: string }, { getState }) => {
    const state = getState() as { message: MessageState };
    const existingLogs = state.message.chatGroupLog[workspaceSlug]?.[chatId];
    
    if (existingLogs && existingLogs.length > 0) {
      return { workspaceSlug, chatId, logs: existingLogs, fromCache: true };
    }

    const response = await chatService.getChatGroupLog(workspaceSlug, { group__id: chatId });
    return { workspaceSlug, chatId, logs: response || [], fromCache: false };
  }
);

export const fetchChatMessage = createAsyncThunk(
  "message/fetchChatMessage",
  async (
    { workspaceSlug, chatId, params }: { workspaceSlug: string; chatId: string; params?: { cursor?: string } },
    { getState }
  ) => {
    const state = getState() as { message: MessageState };
    
    // Return cached data if no cursor and data exists
    if (!params?.cursor && state.message.chatMessages[workspaceSlug]?.[chatId]?.length) {
      return {
        workspaceSlug,
        chatId,
        messages: state.message.chatMessages[workspaceSlug][chatId],
        pagination: state.message.chatPagination[workspaceSlug]?.[chatId],
        fromCache: true,
      };
    }

    const finalParams = params ?? undefined;
    const response = await chatService.userChatMessages(workspaceSlug, chatId, finalParams);
    
    return {
      workspaceSlug,
      chatId,
      messages: response?.results?.reverse() || [],
      pagination: {
        next: response?.next_cursor || null,
        previous: response?.prev_cursor || null,
        isnext: response?.next_page_results || false,
        count: response?.total_count || 0,
      },
      fromCache: false,
    };
  }
);

export const fetchGroupAttachments = createAsyncThunk(
  "message/fetchGroupAttachments",
  async (
    { workspaceSlug, chatId, params }: { workspaceSlug: string; chatId: string; params?: { cursor?: string } },
    { getState }
  ) => {
    const state = getState() as { message: MessageState };

    // Return cached data if no cursor and data exists
    if (!params?.cursor && state.message.groupAttachments[workspaceSlug]?.[chatId]?.length) {
      return {
        workspaceSlug,
        chatId,
        attachments: state.message.groupAttachments[workspaceSlug][chatId],
        fromCache: true,
      };
    }

    const finalParams = params ?? undefined;
    const response = await chatService.getChatGroupAttachment(workspaceSlug, chatId, finalParams);

    return {
      workspaceSlug,
      chatId,
      attachments: response?.results || [],
      pagination: {
        next: response?.next_cursor || null,
        previous: response?.prev_cursor || null,
        isnext: response?.next_page_results || false,
        count: response?.total_count || 0,
      },
      fromCache: false,
    };
  }
);

// Slice
const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    updateMessages: (
      state,
      action: PayloadAction<{
        workspaceSlug: string;
        chatId: string;
        msgs: IChatMessage[];
        message_id?: string;
        currentUserId?: string;
        // groupStore?: any;
      }>
    ) => {
      const { workspaceSlug, chatId, msgs, message_id, currentUserId } = action.payload;

      if (!state.chatMessages[workspaceSlug]) {
        state.chatMessages[workspaceSlug] = {};
      }
      if (!state.chatMessages[workspaceSlug][chatId]) {
        state.chatMessages[workspaceSlug][chatId] = [];
      }

      // msgs.forEach((msg) => {
      //   const existingIndex = state.chatMessages[workspaceSlug][chatId].findIndex((m) => m.id === message_id);
      //   // const existingIndex = state.chatMessages[workspaceSlug][chatId].findIndex((m) =>(msg.id && m.id === msg.id) ||(msg.clientMessageId && m.clientMessageId === msg.clientMessageId));
      //   if (existingIndex !== -1) {
      //     state.chatMessages[workspaceSlug][chatId][existingIndex] = msg;
      //   } else {
      //     state.chatMessages[workspaceSlug][chatId].push(msg);
      //   }
      // });

      msgs.forEach((msg) => {
  const existingIndex =
    state.chatMessages[workspaceSlug][chatId].findIndex(
      (m) =>
        (msg.id && m.id === msg.id) ||
        (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
    );

  if (existingIndex !== -1) {
    state.chatMessages[workspaceSlug][chatId][existingIndex] = msg;
  } else {
    state.chatMessages[workspaceSlug][chatId].push(msg);
  }
});


      // Update last message
      state.lastMessage[chatId] =
        state.chatMessages[workspaceSlug][chatId][state.chatMessages[workspaceSlug][chatId].length - 1];

      // Update unread counts if not current selected group
      // if (groupStore?.currentSelectedGroup[workspaceSlug]?.groupId !== chatId && currentUserId !== msgs[0].sender) {
      //   if (!groupStore.unreadCounts) groupStore.unreadCounts = {};
      //   if (!groupStore.unreadCounts[chatId]) groupStore.unreadCounts[chatId] = 0;
      //   groupStore.unreadCounts[chatId] += msgs.length;
      // }
    },

    // replaceTemporaryMessage: (
    //   state,
    //   action: PayloadAction<{
    //     workspaceSlug: string;
    //     chatId: string;
    //     messageId: string;
    //     message: IChatMessage;
    //   }>
    // ) => {
    //   const { workspaceSlug, chatId, messageId, message } = action.payload;
    //   console.log("replaceTemporaryMessage redux",workspaceSlug, chatId, messageId, message)

    //   if (!state.chatMessages[workspaceSlug]) {
    //     state.chatMessages[workspaceSlug] = {};
    //   }
    //   if (!state.chatMessages[workspaceSlug][chatId]) {
    //     state.chatMessages[workspaceSlug][chatId] = [];
    //   }

    //   const idx = state.chatMessages[workspaceSlug][chatId].findIndex((m) => m.clientMessageId === messageId);
    //   if (idx !== -1) {
    //     state.chatMessages[workspaceSlug][chatId][idx] = message;

    //     // Update attachments if message has attachments
    //     if (message.attachment?.length) {
    //       if (!state.groupAttachments[workspaceSlug]) state.groupAttachments[workspaceSlug] = {};
    //       if (!state.groupAttachments[workspaceSlug][chatId]) state.groupAttachments[workspaceSlug][chatId] = [];

    //       const existingAttachIndex = state.groupAttachments[workspaceSlug][chatId].findIndex(
    //         (m) => m.id === message.id
    //       );
    //       if (existingAttachIndex !== -1) {
    //         state.groupAttachments[workspaceSlug][chatId][existingAttachIndex] = message;
    //       } else {
    //         state.groupAttachments[workspaceSlug][chatId].unshift(message);
    //       }
    //     }
    //   }

    //   // Update last message
    //   state.lastMessage[chatId] =
    //     state.chatMessages[workspaceSlug][chatId][state.chatMessages[workspaceSlug][chatId].length - 1];
    // },


      replaceTemporaryMessage: (
        state,
        action: PayloadAction<{
          workspaceSlug: string;
          chatId: string;
          clientMessageId: string;
          message: IChatMessage;
        }>
      ) => {
        const { workspaceSlug, chatId, clientMessageId, message } = action.payload;

        const msgs = state.chatMessages[workspaceSlug]?.[chatId];
        if (!msgs) return;

        const index = msgs.findIndex(
          (m) => m.clientMessageId === clientMessageId
        );

        if (index !== -1) {
          msgs[index] = message;
        }
      },

    addTemporaryMessage: (
      state,
      action: PayloadAction<{
        workspaceSlug: string;
        chatId: string;
        message: IChatMessage;
      }>
    ) => {
      const { workspaceSlug, chatId, message } = action.payload;

      if (!state.chatMessages[workspaceSlug]) {
        state.chatMessages[workspaceSlug] = {};
      }

      if (!state.chatMessages[workspaceSlug][chatId]) {
        state.chatMessages[workspaceSlug][chatId] = [];
      }

      state.chatMessages[workspaceSlug][chatId].push(message);
    },

    updateMessageReaction: (
      state,
      action: PayloadAction<{
        workspaceSlug: string;
        chatId: string;
        messageId: string;
        reaction: IChatReaction;
        intent?: string;
      }>
    ) => {
      const { workspaceSlug, chatId, messageId, reaction, intent } = action.payload;

      if (!state.chatMessages[workspaceSlug]) {
        state.chatMessages[workspaceSlug] = {};
      }
      if (!state.chatMessages[workspaceSlug][chatId]) {
        state.chatMessages[workspaceSlug][chatId] = [];
      }

      const messageIndex = state.chatMessages[workspaceSlug][chatId].findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        const message = state.chatMessages[workspaceSlug][chatId][messageIndex];
        if (!message.reactions) {
          message.reactions = [];
        }

        const reactionIndex = message.reactions.findIndex((r) => r.user === reaction.user);
        if (reactionIndex !== -1) {
          if (intent === "delete") {
            message.reactions.splice(reactionIndex, 1);
            return;
          }
          message.reactions[reactionIndex] = reaction;
        } else {
          message.reactions.push(reaction);
        }
      }
    },

    deleteMessage: (
      state,
      action: PayloadAction<{ workspaceSlug: string; chatId: string; messageId: string }>
    ) => {
      const { workspaceSlug, chatId, messageId } = action.payload;
      console.log("deleteMessage from redux ", workspaceSlug, chatId, messageId);

      if (!state.chatMessages[workspaceSlug]) {
        state.chatMessages[workspaceSlug] = {};
      }
      if (!state.chatMessages[workspaceSlug][chatId]) {
        state.chatMessages[workspaceSlug][chatId] = [];
      }

      const idx = state.chatMessages[workspaceSlug][chatId].findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        console.log('idxidxidxidxidx',idx)
        state.chatMessages[workspaceSlug][chatId][idx] = {
          ...state.chatMessages[workspaceSlug][chatId][idx],
          deleted_at: new Date().toString(),
        };
      }
    },

    setTyping: (state, action: PayloadAction<IChatTyping>) => {
      const chatType = action.payload;
      state.typing[chatType.group] = { isTyping: true, sender: chatType.sender };

      // Clear existing timer
      if (state.typingTimers[chatType.group]) {
        clearTimeout(state.typingTimers[chatType.group]);
      }

      // Set new timer (Note: This won't work perfectly in Redux due to serialization)
      // You may want to handle this differently, like using middleware
      state.typingTimers[chatType.group] = setTimeout(() => {
        state.typing[chatType.group] = { isTyping: false };
        delete state.typingTimers[chatType.group];
      }, 5000) as any;
    },

    clearTyping: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      state.typing[groupId] = { isTyping: false };
      if (state.typingTimers[groupId]) {
        clearTimeout(state.typingTimers[groupId]);
        delete state.typingTimers[groupId];
      }
    },

    updateChatGroupLog: (
      state,
      action: PayloadAction<{ workspaceSlug: string; chatId: string; log: IChatGroupLog }>
    ) => {
      const { workspaceSlug, chatId, log } = action.payload;

      if (!state.chatGroupLog[workspaceSlug]) state.chatGroupLog[workspaceSlug] = {};
      if (!state.chatGroupLog[workspaceSlug][chatId]) state.chatGroupLog[workspaceSlug][chatId] = [];

      state.chatGroupLog[workspaceSlug][chatId].push(log);
    },

    handleReadStatus: (
      state,
      action: PayloadAction<{
        workspaceSlug: string;
        chatId: string;
        userId: string;
        messages: IMessageReadStatus[];
        groupStore?: any;
      }>
    ) => {
      const { workspaceSlug, chatId, messages, groupStore } = action.payload;

      if (!groupStore?.groupMap[workspaceSlug]) return;

      const chatGroup = groupStore.groupMap[workspaceSlug][chatId];
      if (!chatGroup) return;

      if (!chatGroup.read_status) {
        chatGroup.read_status = [];
      }

      messages.forEach((m) => {
        chatGroup.read_status = chatGroup.read_status ?? [];
        chatGroup.read_status = chatGroup.read_status.filter((rs: IMessageReadStatus) => rs.user !== m.user);
        chatGroup.read_status.push(m);
      });
    },

    clearLoader: (state) => {
      state.loader = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Search Messages
      .addCase(fetchSearchMessages.pending, (state) => {
        state.loader = "init-loading";
      })
      .addCase(fetchSearchMessages.fulfilled, (state) => {
        state.loader = undefined;
      })
      .addCase(fetchSearchMessages.rejected, (state) => {
        state.loader = undefined;
      })

      // Fetch Last Message
      .addCase(fetchLastMessage.pending, (state) => {
        state.loader = "last-message-loading";
      })
      .addCase(fetchLastMessage.fulfilled, (state, action) => {
        state.loader = undefined;
        state.lastMessage = {};

        (action.payload.response as ILastMessageResponse[]).forEach((item) => {
          if (item.last_message) {
            state.lastMessage[item.group] = item.last_message;
          }
        });
      })
      .addCase(fetchLastMessage.rejected, (state) => {
        state.loader = undefined;
      })

      // Fetch Chat Group Log
      .addCase(fetchChatGroupLog.fulfilled, (state, action) => {
        const { workspaceSlug, chatId, logs, fromCache } = action.payload;
        
        if (!fromCache) {
          if (!state.chatGroupLog[workspaceSlug]) state.chatGroupLog[workspaceSlug] = {};
          state.chatGroupLog[workspaceSlug][chatId] = logs;
        }
        state.loader = undefined;
      })
      .addCase(fetchChatGroupLog.rejected, (state) => {
        state.loader = undefined;
      })

      // Fetch Chat Message
      .addCase(fetchChatMessage.pending, (state) => {
        state.loader = "chat-pagination-loading";
      })
      .addCase(fetchChatMessage.fulfilled, (state, action) => {
        const { workspaceSlug, chatId, messages, pagination, fromCache } = action.payload;

        if (!fromCache) {
          if (!state.chatMessages[workspaceSlug]) state.chatMessages[workspaceSlug] = {};
          if (!state.chatMessages[workspaceSlug][chatId]) state.chatMessages[workspaceSlug][chatId] = [];

          const existing = state.chatMessages[workspaceSlug][chatId];
          const merged = [...messages, ...existing].filter(
            (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
          );
          state.chatMessages[workspaceSlug][chatId] = merged;

          if (!state.chatPagination[workspaceSlug]) state.chatPagination[workspaceSlug] = {};
          state.chatPagination[workspaceSlug][chatId] = pagination;
        }
        state.loader = undefined;
      })
      .addCase(fetchChatMessage.rejected, (state) => {
        state.loader = undefined;
      })

      // Fetch Group Attachments
      .addCase(fetchGroupAttachments.pending, (state) => {
        state.loader = "group-attachment-loading";
      })
      .addCase(fetchGroupAttachments.fulfilled, (state, action) => {
        const { workspaceSlug, chatId, attachments, pagination, fromCache } = action.payload;

        if (!fromCache) {
          if (!state.groupAttachments[workspaceSlug]) state.groupAttachments[workspaceSlug] = {};
          if (!state.groupAttachments[workspaceSlug][chatId]) state.groupAttachments[workspaceSlug][chatId] = [];

          if (state.groupAttachments[workspaceSlug][chatId]?.length) {
            state.groupAttachments[workspaceSlug][chatId] = [
              ...state.groupAttachments[workspaceSlug][chatId],
              ...attachments,
            ];
          } else {
            state.groupAttachments[workspaceSlug][chatId] = attachments;
          }

          if (pagination) {
            if (!state.groupattachmentPagination[workspaceSlug])
              state.groupattachmentPagination[workspaceSlug] = {};
            state.groupattachmentPagination[workspaceSlug][chatId] = pagination;
          }
        }
        state.loader = undefined;
      })
      .addCase(fetchGroupAttachments.rejected, (state) => {
        state.loader = undefined;
      });
  },
});

export const {
  updateMessages,
  replaceTemporaryMessage,
  addTemporaryMessage,
  updateMessageReaction,
  deleteMessage,
  setTyping,
  clearTyping,
  updateChatGroupLog,
  handleReadStatus,
  clearLoader,
} = messageSlice.actions;

export default messageSlice.reducer;

// Selectors
export const selectChatMessages = (state: { message: MessageState }) => state.message.chatMessages ;
export const selectLastMessage = (state: { message: MessageState }) => state.message.lastMessage;
export const selectTyping = (state: { message: MessageState }) => state.message.typing;
export const selectLoader = (state: { message: MessageState }) => state.message.loader;
export const selectChatPagination = (state: { message: MessageState }) => state.message.chatPagination ;
export const selectChatGroupLog = (state: { message: MessageState }) => state.message.chatGroupLog;
export const selectGroupAttachments = (state: { message: MessageState }) => state.message.groupAttachments;
export const selectGroupAttachmentPagination = (state: { message: MessageState }) =>
  state.message.groupattachmentPagination;

// Memoized Selectors
export const selectChatMessageDetails = createSelector(
  [selectChatMessages, (_: any, workspaceSlug: string) => workspaceSlug, (_: any, __: string, chatId: string) => chatId],
  (chatMessages, workspaceSlug, chatId): IChatMessage[] | null => {
    return chatMessages[workspaceSlug]?.[chatId] || null;
  }
);


export const selectChatTypingStatus = createSelector(
  [selectTyping, (_: any, groupId: string) => groupId],
  (typing, groupId) => typing[groupId] || { isTyping: false }
);

export const selectLastMessageForChat = createSelector(
  [selectLastMessage, (_: any, chatId: string) => chatId],
  (lastMessage, chatId) => lastMessage[chatId] || null
);

export const selectChatGroupLogDetails = createSelector(
  [selectChatGroupLog, (_: any, workspaceSlug: string) => workspaceSlug, (_: any, __: string, chatId: string) => chatId],
  (chatGroupLog, workspaceSlug, chatId): IChatGroupLog[] | null => {
    return chatGroupLog[workspaceSlug]?.[chatId] || null;
  }
);

export const selectGroupAttachmentDetails = createSelector(
  [
    selectGroupAttachments,
    (_: any, workspaceSlug: string) => workspaceSlug,
    (_: any, __: string, chatId: string) => chatId,
  ],
  (groupAttachments, workspaceSlug, chatId): IChatMessage[] | null => {
    return groupAttachments[workspaceSlug]?.[chatId] || null;
  }
);

// Thunk for notifying new message (needs to be called separately as it involves side effects)
export const notifyNewMessageThunk = createAsyncThunk(
  "message/notifyNewMessage",
  async (
    {
      workspaceSlug,
      message,
      senderDetail,
      currentUser,
      type,
      groupStore,
    }: {
      workspaceSlug: string;
      message: IChatMessage;
      senderDetail: IUserLite | undefined;
      currentUser: IUser | undefined;
      type: string;
      groupStore: any;
    },
    { dispatch }
  ) => {
    let group = groupStore.groupMap[workspaceSlug]?.[message.group];
    
    if (!group) {
      // Fetch groups if not available
      // await dispatch(fetchGroups()).unwrap();
      group = groupStore.groupMap[workspaceSlug]?.[message.group];
      if (!group) return;
    }

    if (group.is_mute) return;

    const content = stripAndTruncateHTML(message?.content || "", 100);
    let title = group.group_name;
    let body = content;

    if (type === "reaction") {
      if (group.is_private) {
        body = `${senderDetail?.display_name || "User"} reacted to your message.`;
      } else {
        body = `${senderDetail?.display_name || "User"} reacted to Chat.`;
      }
    } else if (!group.is_private) {
      body = `${senderDetail?.display_name || "User"}: ${content}`;
    }

    // notifyNewMessage({
    //   currentUser,
    //   senderDetail,
    //   group,
    //   workspaceSlug,
    //   title,
    //   body,
    //   message,
    //   setCurrentSelectedGroup: groupStore.setCurrentSelectedGroup,
    // });
  }
);