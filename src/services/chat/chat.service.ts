import {
  IChatGroup,
  IChatGroupLog,
  IChatMessage,
  IChatMessagesState,
  IChatPin,
  IChatRequest,
  ILastMessageResponse,
  IMuteChat,
} from "src/types";
import { SocketService } from "../socket.service";
import { API_BASE_URL, WEBSOCKET_BASE_URL } from "src/utils";
import { APIService } from "../api.service";

export class ChatSocketService extends SocketService {
  constructor() {
    super(WEBSOCKET_BASE_URL, {
      reconnect: true,
      reconnectInterval: 5000,
      heartbeatInterval: 15000,
    });
  }
  connectToRoom(
    workspaceSlug: string,
    onMessage: (msg: any) => void,
    onOpen?: () => void,
    onError?: (err: any) => void,
    onClose?: () => void
  ) {
    this.connect(
      `/ws/chat/workspace/${workspaceSlug}/`,
      onMessage,
      onOpen,
      onError,
      onClose
    );
  }

}

export class ChatService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async userChats(workspaceSlug: string): Promise<IChatGroup[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/chatgroup/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createChatGroup(
    workspaceSlug: string,
    data: Partial<IChatGroup>
  ): Promise<IChatGroup> {
    return this.post(`/api/workspaces/${workspaceSlug}/chatgroup/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateChatGroup(
    workspaceSlug: string,
    data: Partial<IChatGroup>,
    groupId: string
  ): Promise<IChatGroup> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/chatgroup/${groupId}/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async pinChat(
    workspaceSlug: string,
    data: Partial<IChatPin>
  ): Promise<IChatPin> {
    return this.post(`/api/workspaces/${workspaceSlug}/chat/pin/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async unpinChat(workspaceSlug: string, pinId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/chat/pin/${pinId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async muteGroup(
    workspaceSlug: string,
    data: Partial<IMuteChat>
  ): Promise<IMuteChat> {
    return this.post(`/api/workspaces/${workspaceSlug}/chat/mute/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async unmuteGroup(workspaceSlug: string, muteId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/chat/mute/${muteId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async userReceivedRequests(workspaceSlug: string): Promise<IChatRequest[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/received/chat-request/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async userSentRequests(workspaceSlug: string): Promise<IChatRequest[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/sent/chat-request/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createSendRequest(
    workspaceSlug: string,
    data: Partial<IChatRequest>
  ): Promise<IChatRequest> {
    return this.post(`/api/workspaces/${workspaceSlug}/chat-request/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateSendRequest(
    workspaceSlug: string,
    data: Partial<IChatRequest>,
    requestId: string
  ): Promise<IChatRequest> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/chat-request/${requestId}/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async userChatMessages(
    workspaceSlug: string,
    groupId: string,
    params?: { cursor?: string }
  ): Promise<IChatMessagesState> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/chat/${groupId}/messages/`,
      { params }
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async searchChatMessages(
    workspaceSlug: string,
    groupId: string,
    params?: { search?: string }
  ): Promise<IChatMessage[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/chat/${groupId}/messages/`,
      { params }
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getChatGroupLog(
    workspaceSlug: string,
    params?: { group__id?: string }
  ): Promise<IChatGroupLog[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/chat/group-log/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getChatGroupAttachment(
    workspaceSlug: string,
    groupId: string,
    params?: { cursor?: string }
  ): Promise<IChatMessagesState> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/chat/${groupId}/attachments/`,
      { params }
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getWorkspaceLastMessages(
    workspaceSlug: string
  ): Promise<ILastMessageResponse[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/chat/last/messages/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
