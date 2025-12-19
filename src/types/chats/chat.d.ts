export interface IMessageReadStatus {
  last_read_message?: string;
  id: string;
  user: string;
  created_at?: string;
  updated_at?: string;
  group: string;
}

export interface IChatGroup {
  id: string;
  is_private: boolean;
  group_name: string;
  members: string[];
  workspace: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
  is_pinned?: boolean;  
  is_mute?: boolean;
  mute_id?: string;
  member_count?: number;
  group_avatar?: string | null;
  group_avatar_detail?: IGroupAttachment;
  pin_id?: string;
  read_status?: IMessageReadStatus[];
  unread_count?: number;
  name?: string;
}

export interface IChatRequest {
  id : string;
  sender: string;
  receiver: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
  deleted_at?: Date;
}

export interface IChatReaction {
  id: string;
  message: string;
  user: string;
  emoji: string;
}

export interface IChatTyping {
  group: string;
  sender: string;
  type: string;
}

export interface IForwardedMessage {
  id: string;
  sender: string;
  content?: string;
  attachment?: IGroupAttachment[];
  created_at: string;
}

export interface IAttachmentAttributes {
  name: string;
  size: number;
  type: string;
}

export interface IGroupAttachment {
  id: string;
  created_by: string;
  created_at: string;
  asset: string;
  attributes: IAttachmentAttributes;
}

export interface IChatMessageLite {
  id: string;
  sender: string;
  content?: string;
  attachment?: IGroupAttachment[];
  created_at: string;
}

export interface IChatMessage {
  id: string;
  clientMessageId?: string;
  group: string;
  sender: string;
  content?: string;
  reactions?: IChatReaction[];

  reply_to?: IChatMessageLite;
  mentions: string[]; 
  ticket_mention?: string;
  attachment?: IGroupAttachment[];

  is_forwarded: boolean;
  forwarded_from?: IForwardedMessage; 

  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  deleted_at?: string | null;
}

export interface IChatGroupLog {
  id: string;
  group: string;
  user: string;
  action?: string;
  created_at?: string;
  removed_by?: string;
}

interface IChatMessagesState {
  results: IChatMessage[];
  next_cursor: string | null;
  prev_cursor: string | null;
  total_count: number;
  next_page_results: boolean;
  hasPrevPage: boolean;
}

interface IChatPagination {
  next: string | null;
  previous: string | null;
  isnext: boolean;
  count: number;
}

interface ILastMessageResponse {
  group: string;
  is_last_active: boolean;
  last_message: IChatMessage | null;
}

interface IChatPin {
  id: string;
  group: string;
  pinned_at: Date;
  user: string;
}

interface IMuteChat {
  id: string;
  group: string;
  muted_at: Date;
  user: string;
}

interface IChatQuickActionProps {
  parentRef: React.RefObject<HTMLElement>;
  group: IChatGroup;
  handlePinToGroup: () => Promise<IChatPin>;
  handleMuteGroup: () => Promise<void>;
  handleUnPinGroup: () => Promise<void>;
  handleUnMuteGroup: () => Promise<void>;
  customActionButton?: React.ReactElement;
  portalElement?: HTMLDivElement | null;
  readOnly?: boolean;
  placements?: Placement
}

export type TRenderChatQuickActions = ({
  group,
  parentRef,
  customActionButton,
  placement,
  portalElement,
}: {
  group: IChatGroup;
  parentRef: React.RefObject<HTMLElement>;
  customActionButton?: React.ReactElement;
  placement?: Placement;
  portalElement?: HTMLDivElement | null;
}) => React.ReactNode;


