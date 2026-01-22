import { FC, use, useEffect, useState } from "react";
import {
  Check,
  CheckCheckIcon,
  Edit2,
  Forward,
  ReplyIcon,
  SmilePlus,
  Trash,
  X,
} from "lucide-react";
import { extractImageComponents, formatDateLabel, getFileURL, groupReactionsWithUsers } from "src/utils";
import {
  cleanedHTML,
  extractPlainText,
  isEmojiOnlyText,
  isEmptyHtmlString,
} from "src/utils/string.helper";
import { useAppSelector } from "src/redux/hooks";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { ForwardedMessage } from "./ForwardMessages";
import { GroupActivityItem } from "./group-activity";
import { RenderAttachments } from "./file-details";
import { RichTextReadOnlyEditor } from "./RichTextReadOnlyEditor";
import { useParams } from "react-router-dom";
import { ImageFullscreenProvider } from "./ImageFullscreenProvider";
import { ChatImageGrid } from "./ChatImageGrid";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { renderEmoji } from "src/utils/emoji.helper";
import { IChatReaction } from "src/types";
import { useChatSocket } from "src/context/chatContext";

// ============= TYPES =============
interface MentionProps {
  entityIdentifier: string;
  entityName: string;
}

interface GroupedMessages {
  [date: string]: any[];
}

interface MessageAreaProps {
  groupedMessages: GroupedMessages;
  currentUserId: string;
  messagesEndRef?: any;
  deleteMassages?: any;
  handleForward?: any;
  handleReplay?: any;
  handleEditMessage?: any;
}

// COMPONENTS

// User Avatar Component
const UserAvatar: FC<{ userDetail: any; msg: any }> = ({ userDetail, msg }) => {
  if (userDetail?.avatar_url) {
    return (
      <img
        src={getFileURL(userDetail.avatar_url)}
        className="w-8 h-8 rounded-full flex-shrink-0"
        alt={
          userDetail?.first_name && userDetail?.last_name
            ? `${userDetail.first_name} ${userDetail.last_name}`
            : userDetail?.display_name
        }
      />
    );
  }

  const initials =
    userDetail?.first_name && userDetail?.last_name
      ? userDetail.first_name.charAt(0) + userDetail.last_name.charAt(0)
      : userDetail?.display_name?.charAt(0) || "U";

  return (
    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  );
};

// User Name Component
const UserName: FC<{ userDetail: any }> = ({ userDetail }) => {
  const displayName =
    userDetail?.first_name && userDetail?.last_name
      ? `${userDetail.first_name} ${userDetail.last_name}`
      : userDetail?.display_name;

  return (
    <p className="text-xs font-semibold text-gray-900 mb-1">{displayName}</p>
  );
};

// Deleted Message Component
const DeletedMessage: FC<{ isCurrentUser: boolean }> = ({ isCurrentUser }) => (
  isCurrentUser &&
  <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`px-4 py-2 rounded-2xl italic ${
        isCurrentUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"
      }`}
    >
      <p className="text-xs">This message was deleted</p>
    </div>
  </div>
);
const reactionEmojis = ["128077", "128516", "128533", "129505"];
// Message Actions Toolbar
const MessageActionsToolbar: FC<{
  isCurrentUser: boolean;
  currentUserDetails?: string;
  onEdit?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onReply: () => void;
  message: any;
}> = ({ isCurrentUser, onEdit, onForward, onDelete, onReply, message,currentUserDetails}) => {
  const chatSocketService = useChatSocket();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  if (!message || !chatSocketService) return null;
  const handelReact = (emoji: string) => {
      try {
        const alreadyReacted = message?.reactions?.some(
          (r: IChatReaction) => r.emoji === emoji && r.user === currentUserDetails
        );

        const newReaction = {
          type: "reaction",
          intent: alreadyReacted ? "delete" : "create",
          message_id: message.id,
          emoji: emoji,
          group_id: message.group,
        };
        chatSocketService?.send(newReaction);
      } catch (err) {
        console.error(err);
      }
    };
  return(
  <div
  className={`absolute -top-9 hidden group-hover:flex items-center gap-2 bg-white rounded-md px-3 py-2 shadow-sm backdrop-blur-md transition-all duration-200 ${
    isCurrentUser ? "right-0" : "left-0"
  }`}
  >
            {reactionEmojis.slice(0, 2).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handelReact(emoji)}
                className="flex cursor-pointer sitems-center justify-center rounded-md p-1 text-sm hover:bg-gray-100"
              >
                {renderEmoji(emoji)}
              </button>
            ))}
              <button
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="relative grid place-items-center rounded p-1  outline-none hover:text-custom-text-100 cursor-pointer hover:bg-gray-100"
              >
                <SmilePlus className="text-custom-text-100 h-4 w-4" color="grey" />
              </button>
              {isEmojiPickerOpen && (
                <div className="absolute bottom-10 right-0 z-50">
                  <div className="rounded-2xl shadow-lg border border-custom-sidebar-border-300 overflow-hidden">
                    <EmojiPicker
                      previewConfig={{ showPreview: false }}
                      autoFocusSearch={false}
                      emojiStyle={EmojiStyle.NATIVE}
                      style={{ height: "350px" }}
                      onEmojiClick={(emojiData) => {
                        handelReact(emojiData.unified);
                        setIsEmojiPickerOpen(false);
                      }}
                    />
                  </div>
                </div>
              )}
    {isCurrentUser && onEdit && (
      <button
        onClick={onEdit}
        className="p-1.5 border hover:bg-gray-100 rounded-full transition"
        title="Edit message"
      >
        <Edit2 size={10} className="text-gray-600" />
      </button>
    )}
    <button
      onClick={onForward}
      className="p-1.5 border hover:bg-gray-100 rounded-full transition"
      title="Forward message"
    >
      <Forward size={10} className="text-gray-600" />
    </button>
    {isCurrentUser && onDelete && (
      <button
        onClick={onDelete}
        className="p-1.5 border hover:bg-red-50 rounded-full transition"
        title="Delete message"
      >
        <Trash size={10} className="text-red-500" />
      </button>
    )}
    <button
      onClick={onReply}
      className="p-1.5 border hover:bg-gray-100 rounded-full transition"
      title="Reply to message"
    >
      <ReplyIcon size={10} className="text-gray-600" />
    </button>
  </div>
)}

// Message Timestamp and Status
const MessageMetadata: FC<{
  isCurrentUser: boolean;
  createdAt: string;
  isRead?: boolean;
}> = ({ isCurrentUser, createdAt, isRead }) => (
  <>
    <span className="text-[9px] min-w-[45px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
      {new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
    {/* {isCurrentUser && (
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {isRead ? (
          <CheckCheckIcon className="h-3 w-3 text-indigo-600" />
        ) : (
          <Check className="h-3 w-3 text-gray-400" />
        )}
      </span>
    )} */}
  </>
);

// Edit Message Form
const EditMessageForm: FC<{
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = ({ content, onChange, onSave, onCancel, onKeyDown }) => (
  <div className="bg-white border-2 border-gray-200 rounded-md shadow-lg p-3 min-w-[300px]">
    <div className="mb-2">
      <p className="text-xs text-gray-500 mb-2">Edit message</p>
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autoFocus
      />
    </div>
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onCancel}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        onClick={onSave}
        disabled={!content.trim()}
        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  </div>
);
const ReplyHeader = ({ msg, memberMap }: any) => {
  if (!msg.reply_to || !memberMap[msg.reply_to.sender]) return null;

  return (
    <ForwardedMessage
      forwardedFromUser={memberMap[msg.reply_to.sender]}
      forwardedFrom={msg.reply_to}
      msg={msg}
      reply={true}
    />
  );
};

// Common Message Wrapper - THIS IS THE KEY REFACTORED COMPONENT
const MessageWrapper: FC<{
  msg: any;
  isCurrentUser: boolean;
  currentUserId: string;
  userDetail: any;
  children: React.ReactNode;
  showActions?: any;
  groupedReactions?: any;
  reactions?: any;
  onEdit?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  showSenderName?: boolean
}> = ({
  msg,
  isCurrentUser,
  currentUserId,  
  userDetail,
  children,
  groupedReactions,
  showActions,
  reactions,
  onEdit,
  onForward,
  onDelete,
  onReply,
  showSenderName = true,
}) => {
  const isEdited =
    msg?.updated_at &&
    new Date(msg.updated_at).getTime() - new Date(msg.created_at).getTime() >
      2000;
  const chatSocketService = useChatSocket();
  if (!msg || !chatSocketService) return null;

    const hasReactedByMe = (emoji: string) =>
        msg?.reactions?.some(
          (r: IChatReaction) =>
            r.emoji === emoji && r.user === currentUserId
        );

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : showSenderName ? "justify-start pt-2" : "justify-start"}`}>
      <div
        className={`flex items-start gap-2 ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isCurrentUser && showSenderName && <UserAvatar userDetail={userDetail} msg={msg} />}
        <div className={`${isCurrentUser ? "mr-2" : !showSenderName ? "ml-10" : "ml-1"} flex flex-col`}>
          {!isCurrentUser && showSenderName && <UserName userDetail={userDetail} />}

          {isEdited && (
            <span
              className={`text-[10px] text-gray-400 ${
                isCurrentUser ? "text-end" : "text-start"
              }`}
            >
              Edited
            </span>
          )}

          <div className="relative">
            <div className="relative z-10 h-auto">
              {children}
            </div>

            {/* Emoji reactions */}
            {reactions?.length > 0 && (
              <div
                className={`absolute z-10 -bottom-2.5 flex flex-wrap gap-1 ${
                  isCurrentUser ? "right-2 justify-end" : "left-2 justify-start"
                }`}
              >
                {groupedReactions.map((reaction: any) => (
                  <span
                    key={reaction.emoji}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-1 py-[2px] text-xs shadow-sm cursor-pointer"
                    onClick={() => {
                      try {
                        const reactedByMe = hasReactedByMe(reaction.emoji)
                        chatSocketService.send({
                          type: "reaction",
                          intent: reactedByMe ? "delete" : "create",
                          message_id: msg.id,
                          emoji: reaction.emoji,
                          group_id: msg.group,
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    {renderEmoji(reaction.emoji)}
                    {reaction.count > 1 && (
                      <span className="text-[10px] text-gray-600">
                        {reaction.count}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Text Message Content with Actions
const TextMessageContent: FC<{
  msg: any;
  isCurrentUser: boolean;
  currentUserId: string;
  content: React.ReactNode;
  onEdit?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onReply: () => void;
  className?: string
}> = ({
  msg,
  isCurrentUser,
  currentUserId,
  content,
  onEdit,
  onForward,
  onDelete,
  onReply,
  className
}) => (
  <div
    className={`flex items-end gap-2 ${
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    }`}
  >
    <div
      className={`relative text-sm py-3 rounded-xl px-3 w-full max-w-2xl ${className}`}
      // className={`relative text-sm py-2 px-3 rounded-xl w-full max-w-2xl ${
      //   isCurrentUser
      //     ? "bg-indigo-600 text-white rounded-tr-none"
      //     : "bg-gray-100 text-gray-900 rounded-tl-none"
      // }`}
    >
      <MessageActionsToolbar
        isCurrentUser={isCurrentUser}
        currentUserDetails={currentUserId}
        onEdit={onEdit}
        onForward={onForward}
        onDelete={onDelete}
        onReply={onReply}
        message={msg}
      />
      {content}
    </div>

    <MessageMetadata
      isCurrentUser={isCurrentUser}
      createdAt={msg.created_at}
      isRead={msg.isRead}
    />
  </div>
);

// MAIN COMPONENT
export const MessageArea: FC<MessageAreaProps> = ({
  groupedMessages,
  currentUserId,
  messagesEndRef,
  deleteMassages,
  handleForward,
  handleReplay,
  handleEditMessage,
}) => {
  const memberMap = useAppSelector(selectMemberMap);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});
  const { workspace: currentWorkspaceSlug, project: currentProjectId } =
    useParams();

  // Set global variables for image components
  (window as any).__CURRENT_PROJECT_ID__ = currentProjectId;
  (window as any).__CURRENT_WORKSPACE_SLUG__ = currentWorkspaceSlug;

  // HANDLERS
  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg?.id);
    const sanitizedContent = cleanedHTML(msg.content);
    const plainText = extractPlainText(sanitizedContent);
    setEditedContent(plainText);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, msg: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(msg);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleSaveEdit = (msg: any) => {
    if (editedContent.trim() && handleEditMessage) {
      handleEditMessage(msg, editedContent);
      setEditingMessageId(null);
      setEditedContent("");
    }
  };

  const toggleExpanded = (msgId: string) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // ============= RENDER HELPERS =============
  const renderMessageContent = (content: string, msgId: string) => {
    const sanitizedMessageContent = cleanedHTML(content);
    const plainTextContent = extractPlainText(sanitizedMessageContent);
    const MAX_LENGTH = 800;
    const isExpanded = expandedMessages[msgId];

    if (plainTextContent.length > MAX_LENGTH) {
      return (
        <>
          {isExpanded
            ? plainTextContent
            : plainTextContent.slice(0, MAX_LENGTH) + "..."}
          <button
            onClick={() => toggleExpanded(msgId)}
            className="px-2 transition-colors text-xs"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        </>
      );
    }

    return plainTextContent;
  };

  const checkImageOnlyMessage = (msg: any) => {
    const hasImageComponents = /<image-component[\s\S]*?>/.test(msg.content);
    const textWithoutImages = msg.content
      .replace(/<image-component[\s\S]*?<\/image-component>/g, "")
      .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/g, "")
      .trim();
    return hasImageComponents && textWithoutImages.length === 0;
  };

  const shouldShowTimestamp = (messages: any[], index: number) => {
    return (
      index === 0 ||
      new Date(messages[index - 1].created_at).toDateString() !==
        new Date(messages[index].created_at).toDateString()
    );
  };

  //  RENDER MESSAGE
  const renderMessage = (msg: any, messages: any[], index: number) => {
    if (!msg.id) return null;
const { images, textHTML } = extractImageComponents(msg.content);
const hasImages = images.length > 0;

    const userDetail = memberMap[msg?.sender] || {};
    const isCurrentUser = msg?.sender === currentUserId;
    const isEditing = editingMessageId === msg.id;
    const showTimestamp = shouldShowTimestamp(messages, index);
    // const shouldRenderImageOnly = checkImageOnlyMessage(msg);
const sanitizedMessageContent = cleanedHTML(msg.content || "");
    // Check if content has image components
    const hasImageComponents =
      sanitizedMessageContent.includes("image-component");
    const hasNoTextContent = isEmptyHtmlString(
      sanitizedMessageContent || "",
      []
    );
    const hasNonImageAttachments =
      msg.attachment?.some(
        (att : any) => !att.attributes?.type?.startsWith("image/")
      ) ?? false;
    const hasReplyOrForward = !!(msg.reply_to || msg.is_forwarded);
    const hasAnyAttachments = (msg.attachment?.length || 0) > 0;
    const shouldRenderImageOnly =
      hasImageComponents &&
      hasNoTextContent &&
      !msg.deleted_at &&
      !hasNonImageAttachments &&
      !hasReplyOrForward;
      const shouldRenderImageWithText = 
            hasImageComponents && 
            !hasNoTextContent && 
    !msg.deleted_at;
    const plainTextContent = extractPlainText(sanitizedMessageContent);
    const isEmojiOnlyContent = isEmojiOnlyText(plainTextContent);
      const shouldRenderEmojiOnly =
      isEmojiOnlyContent &&
      !hasAnyAttachments &&
      !hasReplyOrForward &&
      !hasImageComponents &&
      !msg.deleted_at;
      const prevMsg = messages[index - 1];
      const isSameSender = prevMsg && prevMsg.sender === msg.sender;
      const showSenderName = !isSameSender;
    // console.log("shouldRenderImageOnly >>>",shouldRenderImageOnly);

    // Deleted message
    if (msg.deleted_at) {
      return <DeletedMessage key={msg.id} isCurrentUser={isCurrentUser} />;
    }

    // Activity log
    if (msg.action !== undefined) {
      return <GroupActivityItem key={msg.id} log={msg} />;
    }

    // Message actions
    const messageActions = {
      onEdit: isCurrentUser ? () => handleStartEdit(msg) : undefined,
      onForward: () => handleForward(msg),
      onDelete: isCurrentUser ? () => deleteMassages(msg) : undefined,
      onReply: () => handleReplay(msg),
    };

    return (
      <div key={msg.id}>
        {showTimestamp && (
          <div className="text-center my-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {formatDateLabel(msg?.created_at)
                .split(" ")
                .slice(0, 3)
                .join(" ")}
            </span>
          </div>
        )}

        <div
          className={`group flex items-center ${isCurrentUser ? "justify-end" : "justify-start"}`}
        >
          {/* Image-only message */}
          {shouldRenderImageOnly && (
            <MessageWrapper
              msg={msg}
              showSenderName={showSenderName}
              isCurrentUser={isCurrentUser}
              currentUserId={currentUserId}
              userDetail={userDetail}
              showActions={msg.reaction}
              reactions={msg.reactions}
                groupedReactions={groupReactionsWithUsers(
                msg.reactions || [],
                userDetail.id || "",
                msg.group || []
              )}
            >
              <TextMessageContent
                msg={msg}
                currentUserId={currentUserId}
                isCurrentUser={isCurrentUser}
                content={hasImages && <ChatImageGrid images={images} />}
                onEdit={messageActions.onEdit}
                // onForward={messageActions.onForward}
                onDelete={messageActions.onDelete}
                onReply={messageActions.onReply}
              />
            </MessageWrapper>
          )}

          {/* Emoji-only message */}
          {shouldRenderEmojiOnly && (
            <MessageWrapper
              msg={msg}
              isCurrentUser={isCurrentUser}
              showSenderName={showSenderName}
              currentUserId={currentUserId}
              userDetail={userDetail}
              showActions={msg.reaction}
              reactions={msg.reactions}
                groupedReactions={groupReactionsWithUsers(
                msg.reactions || [],
                userDetail.id || "",
                msg.group || []
              )}
            >
              <TextMessageContent
                msg={msg}
                currentUserId={currentUserId}
                isCurrentUser={isCurrentUser}
                content={plainTextContent}
                onEdit={messageActions.onEdit}
                // onForward={messageActions.onForward} 
                onDelete={messageActions.onDelete}
                onReply={messageActions.onReply}
              />
            </MessageWrapper>
          )}

          {/* Image + Text message */}
        {shouldRenderImageWithText && msg?.attachment?.length && (
          <MessageWrapper
            msg={msg}
            isCurrentUser={isCurrentUser}
            currentUserId={currentUserId}
            showSenderName={showSenderName}
            userDetail={userDetail}
            showActions={msg.reaction}
              reactions={msg.reactions}
                groupedReactions={groupReactionsWithUsers(
                msg.reactions || [],
                userDetail.id || "",
                msg.group || []
        )}
          >
            {isEditing ? (
              <EditMessageForm
                content={editedContent}
                onChange={setEditedContent}
                onSave={() => handleSaveEdit(msg)}
                onCancel={handleCancelEdit}
                onKeyDown={(e) => handleKeyPress(e, msg)}
              />
            ) : (
              <TextMessageContent
                msg={msg}
                currentUserId={currentUserId}
                className={`px-3 ${isCurrentUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}
                isCurrentUser={isCurrentUser}
                content={
                  <>
                    {/* Render images first */}
                    {hasImages && (
                      <div className="mb-2">
                        <ChatImageGrid images={images} />
                      </div>
                    )}
                    {/* Render text content */}
                    {textHTML && (
                      <RichTextReadOnlyEditor
                        content={textHTML}
                        className="prose prose-sm max-w-none"
                      />
                    )}
                    <RenderAttachments
                      key={msg.id}
                      message={msg}
                      isCurrentUser={isCurrentUser}
                    />
                  </>
                }
                {...messageActions}
              />
            )}
          </MessageWrapper>
          )}

          {/* Message with attachments */}
          {!shouldRenderImageOnly && !shouldRenderImageWithText && msg?.attachment?.length > 0 && (
            <MessageWrapper
              msg={msg}
              isCurrentUser={isCurrentUser}
              showSenderName={showSenderName}
              currentUserId={currentUserId}
              userDetail={userDetail}
              showActions={msg.reaction}
              reactions={msg.reactions}
                groupedReactions={groupReactionsWithUsers(
                msg.reactions || [],
                userDetail.id || "",
                msg.group || []
        )}
            >
              <TextMessageContent
                msg={msg}
                currentUserId={currentUserId}
                className={`${textHTML && `px-3 ${isCurrentUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}`}
                isCurrentUser={isCurrentUser}
                content={
              <>
              <RenderAttachments
                key={msg.id}
                message={msg}
                isCurrentUser={isCurrentUser}
              />
                {textHTML && (
                      <RichTextReadOnlyEditor
                        content={textHTML}
                        className="prose prose-sm max-w-none"
                      />
                    )}</>
                    }
                onEdit={messageActions.onEdit}
                onDelete={messageActions.onDelete}
                onReply={messageActions.onReply}
              />
                
            </MessageWrapper>
        )}

          {/* Message with attachments */}
          {/* {!shouldRenderImageOnly && msg?.attachment?.length > 0 && (
            <MessageWrapper
              msg={msg}
              isCurrentUser={isCurrentUser}
              userDetail={userDetail}
              showActions={false}
            >
              <TextMessageContent
                msg={msg}
                isCurrentUser={isCurrentUser}
                content={
                  <RenderAttachments
                    message={msg}
                    isCurrentUser={isCurrentUser}
                  />
                }
                onEdit={messageActions.onEdit}
                onDelete={messageActions.onDelete}
                onReply={messageActions.onReply}
              />
            </MessageWrapper>
          )} */}

          {/* Regular text message */}
          {!shouldRenderImageOnly && !shouldRenderEmojiOnly && !msg?.attachment?.length && (
            <MessageWrapper
              msg={msg}
              currentUserId={currentUserId}
              showSenderName={showSenderName}
              isCurrentUser={isCurrentUser}
              userDetail={userDetail}
              showActions={msg.reaction}
              reactions={msg.reactions}
                groupedReactions={groupReactionsWithUsers(
                msg.reactions || [],
                userDetail.id || "",
                msg.group || []
        )}
            >
              {isEditing ? (
                <EditMessageForm
                  content={editedContent}
                  onChange={setEditedContent}
                  onSave={() => handleSaveEdit(msg)}
                  onCancel={handleCancelEdit}
                  onKeyDown={(e) => handleKeyPress(e, msg)}
                />
              ) : (
                <TextMessageContent
                  msg={msg}
                  currentUserId={currentUserId}
                  className={`px-3 ${isCurrentUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}
                  isCurrentUser={isCurrentUser}
                  content={
                    msg.forwarded_from &&
                    memberMap[msg.forwarded_from?.sender] ? (
                      <ForwardedMessage
                        forwardedFromUser={
                          memberMap[msg.forwarded_from?.sender]
                        }
                        forwardedFrom={msg.forwarded_from}
                        msg={msg}
                      />
                    ) : msg?.reply_to && memberMap[msg?.reply_to?.sender] ? (
                      <ForwardedMessage
                        forwardedFromUser={memberMap[msg?.reply_to?.sender]}
                        forwardedFrom={msg?.reply_to}
                        msg={msg}
                        reply={true}
                      />
                    ) : (
                      // Normal message
                      <>
                        {/* <p className="text-sm">
                          {renderMessageContent(msg.content, msg.id)}
                        </p> */}
                        <RichTextReadOnlyEditor
                          content={msg.content}
                          text="sm"
                          className="prose text-lg prose-sm max-w-none"
                        />
                      </>
                    )
                  }
                  {...messageActions}
                />
              )}
            </MessageWrapper>
          )}
        </div>
      </div>
    );
  };

  // MAIN RENDER
  return (
    <div className="flex-1 overflow-y-auto bg-white py-4 sm:py-5 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto space-y-2 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-4xl ">
        {Object.entries(groupedMessages).map(([date, messages]) =>
          messages.map((msg, index) => renderMessage(msg, messages, index))
        )}
        <ImageFullscreenProvider />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageArea;
