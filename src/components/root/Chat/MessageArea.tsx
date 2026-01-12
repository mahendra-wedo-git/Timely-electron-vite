import { FC, use, useState } from "react";
import {
  Check,
  CheckCheckIcon,
  Edit2,
  Forward,
  ReplyIcon,
  Trash,
  X,
} from "lucide-react";
import { formatDateLabel, getFileURL } from "src/utils";
import {
  cleanedHTML,
  extractPlainText,
  isEmptyHtmlString,
} from "src/utils/string.helper";
import { useAppSelector } from "src/redux/hooks";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { ForwardedMessage } from "./ForwardMessages";
import { GroupActivityItem } from "./group-activity";
import { RenderAttachments } from "./file-details";
import { RichTextReadOnlyEditor } from "./RichTextReadOnlyEditor";
import { useParams } from "react-router-dom";

interface MentionProps {
  entityIdentifier: string;
  entityName: string;
}

interface GroupedMessages {
  [date: string]: any[];
}
export const MessageArea: FC<{
  groupedMessages: GroupedMessages;
  currentUserId: string;
  messagesEndRef?: any;
  deleteMassages?: any;
  handleForward?: any;
  handleReplay?: any;
  handleEditMessage?: any;
}> = ({
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
  // console.log("groupedMessages >>>", groupedMessages);
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});
  const Mention: FC<MentionProps> = ({ entityIdentifier, entityName }) => {
    return <span className="text-indigo-600">@{entityName}</span>;
  };
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
  const DeletedMessage = ({ isCurrentUser }: { isCurrentUser: boolean }) => (
    <div>
      <div
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-2 rounded-2xl w-100 italic flex ${
            isCurrentUser
              ? "bg-indigo-600 text-white justify-end"
              : "bg-gray-200 text-gray-900 justify-start"
          }`}
        >
          <p className="text-xs">This message was deleted</p>
        </div>
      </div>
    </div>
  );

  const renderMessageContent = (content: string, msgId: string) => {
    const sanitizedMessageContent = cleanedHTML(content);
    // Check if content has image components
    const hasImageComponents =
      sanitizedMessageContent.includes("image-component");
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
            onClick={() =>
              setExpandedMessages((prev) => ({
                ...prev,
                [msgId]: !prev[msgId], // Toggle expanded state for this message
              }))
            }
            className="px-2 transition-colors  text-xs"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        </>
      );
    }

    return plainTextContent;
  };
  const { workspace: currentWorkspaceSlug, project: currentProjectId } =
    useParams();
  return (
    <div className="flex-1 overflow-y-auto py-6 px-[150px] space-y-5">
      {Object.entries(groupedMessages).map(([date, messages]) => {
        return messages.map((msg, index) => {
          if (!msg.id) return null;
          const userDetail = memberMap[msg?.sender];
          const sanitizedMessageContent = cleanedHTML(msg.content || "");
          (window as any).__CURRENT_PROJECT_ID__ = currentProjectId; // dynamically from context or store
          (window as any).__CURRENT_WORKSPACE_SLUG__ = currentWorkspaceSlug;
          // Check if content has image components
          const hasImageComponents = /<image-component[\s\S]*?>/.test(
            msg.content
          );
          // const hasImageComponents =
          // msg.content.includes("image-component");
          const textWithoutImages = msg.content
            .replace(/<image-component[\s\S]*?<\/image-component>/g, "")
            .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/g, "")
            .trim();
          const shouldRenderImageOnly =
            hasImageComponents && textWithoutImages.length === 0;
          console.log("hasImageComponents", hasImageComponents);
          const hasNoTextContent = isEmptyHtmlString(
            sanitizedMessageContent || "",
            []
          );
          // const shouldRenderImageOnly = hasImageComponents && hasNoTextContent;
          console.log("shouldRenderImageOnly", msg, shouldRenderImageOnly);
          const isCurrentUser = msg?.sender === currentUserId;
          if (shouldRenderImageOnly) {
            return (
              <div
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-2 flex-row">
                  {!isCurrentUser && (
                    <div className="mb-2 flex">
                      {userDetail.avatar_url ? (
                        <img
                          src={getFileURL(userDetail.avatar_url)}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs  flex-shrink-0">
                          {msg?.sender_first_name &&
                            msg?.sender_first_name[0].toUpperCase()}
                          {msg?.sender_last_name &&
                            msg?.sender_last_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="ml-2 flex flex-col">
                    <div
                      className={`${isCurrentUser ? "mr-2" : "ml-2"} flex flex-col align-end`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold text-gray-900 mb-1">
                          {userDetail?.first_name && userDetail?.last_name
                            ? `${userDetail.first_name} ${userDetail.last_name}`
                            : userDetail?.display_name}
                        </p>
                      )}
                    </div>

                    <RichTextReadOnlyEditor
                      content={msg.content}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </div>
              </div>
            );
          }
          // <RichTextReadOnlyEditor
          //   content={msg.content}
          //   className="prose prose-sm max-w-none"
          // />

          const forwardedFrom = msg?.forwarded_from || null;
          const replayedFrom = msg?.reply_to || null;
          const forwardedFromUser = memberMap[forwardedFrom?.sender];
          const replayedFromUser = memberMap[msg?.reply_to?.sender];
          const isEditing = editingMessageId === msg.id;
          const showTimestamp =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
              new Date(msg.created_at).toDateString();

          const hasNonImageAttachments =
            msg.attachment?.some(
              (att) => !att.attributes?.type?.startsWith("image/")
            ) ?? false;

          if (msg.deleted_at)
            return <DeletedMessage isCurrentUser={isCurrentUser} />;
          // if (msg.action !== undefined) return GroupActivityItem({ log: msg });
          if (msg.action !== undefined) {
            return <GroupActivityItem key={msg.id} log={msg} />;
          }

          if (msg?.attachment?.length > 0) {
            return (
              <div
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-2 flex-row">
                  {!isCurrentUser && (
                    <div className="mb-2 flex">
                      {userDetail.avatar_url ? (
                        <img
                          src={getFileURL(userDetail.avatar_url)}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs  flex-shrink-0">
                          {msg?.sender_first_name &&
                            msg?.sender_first_name[0].toUpperCase()}
                          {msg?.sender_last_name &&
                            msg?.sender_last_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="ml-2 flex flex-col">
                    <div
                      className={`${isCurrentUser ? "mr-2" : "ml-2"} flex flex-col align-end`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold text-gray-900 mb-1">
                          {userDetail?.first_name && userDetail?.last_name
                            ? `${userDetail.first_name} ${userDetail.last_name}`
                            : userDetail?.display_name}
                        </p>
                      )}
                    </div>

                    <RenderAttachments
                      key={msg.id}
                      message={msg}
                      isCurrentUser={isCurrentUser}
                    />
                  </div>
                </div>
              </div>
            );
          }
          console.log("shouldRenderImageOnly", shouldRenderImageOnly);
          // if (shouldRenderImageOnly) {
          //   return (
          //     <RichTextReadOnlyEditor
          //       content={msg.content}
          //       className="prose prose-sm max-w-none"
          //     />
          //   );
          // }
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
                className={`group flex items-center ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isCurrentUser &&
                    (userDetail?.avatar_url ? (
                      <img
                        src={getFileURL(userDetail.avatar_url)}
                        className="w-8 h-8 rounded-full"
                        alt={
                          userDetail?.first_name && userDetail?.last_name
                            ? `${userDetail.first_name} ${userDetail.last_name}`
                            : userDetail?.display_name
                        }
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs  flex-shrink-0">
                        {userDetail?.first_name && userDetail?.last_name
                          ? userDetail.first_name.charAt(0) +
                            userDetail.last_name.charAt(0)
                          : userDetail?.display_name?.charAt(0)}{" "}
                        {/* Assuming the sender's first letter */}
                      </div>
                    ))}

                  <div
                    className={`${isCurrentUser ? "mr-2" : "ml-2"} flex flex-col`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold text-gray-900 mb-1">
                        {userDetail?.first_name && userDetail?.last_name
                          ? `${userDetail.first_name} ${userDetail.last_name}`
                          : userDetail?.display_name}
                      </p>
                    )}
                    {msg?.updated_at &&
                      new Date(msg.updated_at).getTime() -
                        new Date(msg.created_at).getTime() >
                        2000 && (
                        <span
                          className={`text-[10px] text-custom-text-300 ${isCurrentUser ? "text-end" : "text-start"}`}
                        >
                          Edited
                        </span>
                      )}
                    {isEditing ? (
                      <div className="bg-white border-2 border-gray-200 rounded-md shadow-lg p-3 min-w-[300px]">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-2">
                            Edit message
                          </p>
                          <input
                            type="text"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, msg)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg)}
                            disabled={!editedContent.trim()}
                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex items-end gap-2 ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`relative text-xs py-2 px-3 rounded-xl w-[50%] ${isCurrentUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-900 rounded-tl-none"}`}
                        >
                          <div
                            className={`absolute -top-9 hidden group-hover:flex items-center gap-2 bg-white rounded-md px-5 py-2 shadow-sm backdrop-blur-md transition-all duration-200 ${isCurrentUser ? "right-0 translate-x-0" : "left-0 translate-x-0"}`}
                          >
                            {/* <button className="bg-white border rounded-full p-1">
                            ✏️
                          </button> */}
                            {isCurrentUser && (
                              <button
                                onClick={() => handleStartEdit(msg)}
                                className="p-1.5 border hover:bg-gray-100 rounded-full transition"
                                title="Edit message"
                              >
                                <Edit2 size={14} className="text-gray-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleForward(msg)}
                              className="p-1.5 border hover:bg-gray-100 rounded-full transition"
                              title="Forward message"
                            >
                              <Forward size={14} className="text-gray-600" />
                            </button>
                            {isCurrentUser && (
                              <button
                                onClick={() => deleteMassages(msg)}
                                className="p-1.5 border hover:bg-red-50 rounded-full transition"
                                title="Delete message"
                              >
                                <Trash size={14} className="text-red-500" />
                              </button>
                            )}
                            <button
                              onClick={() => handleReplay(msg)}
                              className="p-1.5 border hover:bg-gray-100 rounded-full transition"
                              title="Reply to message"
                            >
                              <ReplyIcon size={14} className="text-gray-600" />
                            </button>
                          </div>

                          {msg.forwarded_from && forwardedFromUser ? (
                            <ForwardedMessage
                              forwardedFromUser={forwardedFromUser}
                              forwardedFrom={forwardedFrom}
                              msg={msg}
                            />
                          ) : msg?.reply_to && replayedFromUser ? (
                            <ForwardedMessage
                              forwardedFromUser={replayedFromUser}
                              forwardedFrom={replayedFrom}
                              msg={msg}
                              reply={true}
                            />
                          ) : (
                            <>
                              {/* // renderMessageContent(msg.content) */}
                              <p className="text-sm">
                                {renderMessageContent(msg.content, msg.id)}
                              </p>
                            </>
                          )}
                        </div>

                        <span className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>

                        {/* Read Status */}
                        {isCurrentUser && (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {msg.isRead ? (
                              <CheckCheckIcon className="h-3 w-3 text-indigo-600" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        });
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageArea;
