import { FC, useState } from "react";
import {
  Check,
  CheckCheckIcon,
  Delete,
  DeleteIcon,
  Forward,
  Move3DIcon,
  Recycle,
  Trash,
} from "lucide-react";
import { formatDateLabel } from "src/utils";
import { cleanedHTML, extractPlainText } from "src/utils/string.helper";
import { useAppSelector } from "src/redux/hooks";
import { selectMemberMap } from "src/redux/memberRootSlice";
import { IoRemove } from "react-icons/io5";
import { BiTab } from "react-icons/bi";
import { IChatMessage } from "src/types";
import { ForwardedMessage } from "./ForwardMessages";
import { GroupActivityItem } from "./group-activity";
import { renderAttachments } from "./file-details";

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
}> = ({
  groupedMessages,
  currentUserId,
  messagesEndRef,
  deleteMassages,
  handleForward,
}) => {
  const memberMap = useAppSelector(selectMemberMap);
  // console.log("groupedMessages >>>", groupedMessages);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const Mention: FC<MentionProps> = ({ entityIdentifier, entityName }) => {
    return <span className="text-indigo-600">@{entityName}</span>;
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
              : "bg-gray-100 text-gray-900 justify-start"
          }`}
        >
          <p className="text-xs">This message was deleted</p>
        </div>
      </div>
    </div>
  );

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
  return (
    <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
      {Object.entries(groupedMessages).map(([date, messages]) => {
        return messages.map((msg, index) => {
          const userDetail = memberMap[msg?.sender];
          const forwardedFrom = msg?.forwarded_from || null;
          const forwardedFromUser = memberMap[forwardedFrom?.sender];
          const showTimestamp =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
              new Date(msg.created_at).toDateString();
          const isCurrentUser = msg?.sender === currentUserId;

          if (msg.deleted_at)
            return <DeletedMessage isCurrentUser={isCurrentUser} />;
          // if (msg.action !== undefined) return GroupActivityItem({ log: msg });
          if (msg.action !== undefined) {
            return <GroupActivityItem key={msg.id} log={msg} />;
          }

          if (msg?.attachment?.length > 0) {
            return renderAttachments(msg, isCurrentUser);
          }
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
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start max-w-xl`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {userDetail?.first_name && userDetail?.last_name
                        ? userDetail.first_name.charAt(0) +
                          userDetail.last_name.charAt(0)
                        : userDetail?.display_name?.charAt(0)}{" "}
                      {/* Assuming the sender's first letter */}
                    </div>
                  )}

                  <div className={`${isCurrentUser ? "mr-2" : "ml-2"}`}>
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold text-gray-900 mb-1">
                        {userDetail?.first_name && userDetail?.last_name
                          ? `${userDetail.first_name} ${userDetail.last_name}`
                          : userDetail?.display_name}
                        {/* {msg.sender} */}
                      </p>
                    )}

                    {isCurrentUser ? (
                      <div className="flex items-center space-x-2 justify-end">
                        <div>
                          <Trash
                            size={15}
                            className="text-red-400 cursor-pointer justify-end"
                            onClick={() => deleteMassages(msg)}
                          />
                        </div>
                        <div>
                          <Forward
                            size={15}
                            onClick={() => handleForward(msg)}
                            className="text-gray-400 cursor-pointer justify-end"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 justify-start">
                        <div>
                          <Forward
                            size={15}
                            onClick={() => handleForward(msg)}
                            className="text-gray-400 cursor-pointer justify-start"
                          />
                        </div>
                      </div>
                    )}

                    {/* Render message content with mentions replaced */}
                    <div
                      className={`text-xs mt-1 py-2 px-3 rounded-md  ${
                        isCurrentUser
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-xs ">
                        {forwardedFrom && forwardedFromUser ? (
                          <ForwardedMessage
                            forwardedFromUser={forwardedFromUser}
                            forwardedFrom={forwardedFrom}
                            msg={msg}
                          />
                        ) : (
                          // renderMessageContent(msg.content)
                          renderMessageContent(msg.content, msg.id)
                        )}
                      </p>
                    </div>

                    <div
                      className={`flex items-center mt-1 space-x-1 ${isCurrentUser ? "justify-end" : ""}`}
                    >
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isCurrentUser &&
                        (msg.isRead ? (
                          <CheckCheckIcon className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-400" />
                        ))}
                    </div>
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
