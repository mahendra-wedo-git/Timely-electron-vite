import { IChatMessage, IGroupAttachment } from "./chat";

interface IMessageQuickActionProps {
  parentRef: React.RefObject<HTMLElement>;
  message: IChatMessage;
  handleReaction: () => Promise<IChatPin>;
  handleEdit: () => Promise<void>;
  handleReply: (message: IChatMessage) => Promise<void>;
  hadleForward: () => Promise<void>;
  handleInfo?: () => void;
  customActionButton?: React.ReactElement;
  portalElement?: HTMLDivElement | null;
  readOnly?: boolean;
  placements?: Placement
}

export type TRenderMessageQuickActions = ({
  message,
  parentRef,
  customActionButton,
  placement,
  portalElement,
}: {
  message: IChatMessage;
  parentRef: React.RefObject<HTMLElement>;
  customActionButton?: React.ReactElement;
  placement?: Placement;
  portalElement?: HTMLDivElement | null;
}) => React.ReactNode;

interface IMessageAttachmentQuickActionProps {
  parentRef: React.RefObject<HTMLElement>;
  attachment: IGroupAttachment;
  handleCopy: () => Promise<void>;
  handleDownload: () => Promise<void>;
  handleOpen: () => Promise<void>;
  customActionButton?: React.ReactElement;
  portalElement?: HTMLDivElement | null;
  readOnly?: boolean;
  placements?: Placement
}

export type TRenderMessageAttachmentsQuickActions = ({
  attachment,
  parentRef,
  customActionButton,
  placement,
  portalElement,
}: {
  attachment: IGroupAttachment;
  parentRef: React.RefObject<HTMLElement>;
  customActionButton?: React.ReactElement;
  placement?: Placement;
  portalElement?: HTMLDivElement | null;
}) => React.ReactNode;