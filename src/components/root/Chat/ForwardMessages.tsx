import { Forward } from "lucide-react";
import React, { FC, useState } from "react";
import { useUser } from "src/context";
import { extractImageComponents, formatDateLabel } from "src/utils";
import { RichTextReadOnlyEditor } from "./RichTextReadOnlyEditor";
import { cleanedHTML, extractPlainText } from "src/utils/string.helper";
import { IChatMessage } from "src/types";
import { RenderAttachments } from "./file-details";
import { ChatImageGrid } from "./ChatImageGrid";
interface IForwardedMessage {
  forwardedFromUser: any;
  forwardedFrom: any;
  msg: any;
  reply?: any;
}
export const ForwardedMessage: FC<IForwardedMessage> = ({
  forwardedFromUser,
  forwardedFrom,
  msg,
  reply,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUser = useUser();

  // The long repetitive string from your image
  const content = msg?.content;
  // Define how many characters to show before "Read more"
  const MAX_LENGTH = 150;
  const displayText = isExpanded
    ? content
    : content.slice(0, MAX_LENGTH) + "...";

  const IsMe = currentUser?.data?.id === forwardedFromUser.id;
  const sanitizedMessageContent = cleanedHTML(forwardedFrom?.content);
  const plainTextContent = extractPlainText(sanitizedMessageContent);
  const { images: forwardedImages } = extractImageComponents(
    forwardedFrom?.content || "",
  );
  const hasForwardedImages = forwardedImages.length > 0;
  return (
    <div
      className={`${reply ? "bg-transparent text-gray" : IsMe ? "bg-indigo-600 text-white" : ""}   w-full max-w-2xl rounded-2xl font-sans`}
    >
      <div className="bg-white text-gray-800 rounded-lg p-3 mb-1 flex flex-col gap-1 relative border-l-4 border-gray-300">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {/* <span className="text-lg">↪</span> */}
          {msg?.forwarded_from && (
            <Forward className="h-3.5 w-3.5 text-custom-text-100" />
          )}
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {forwardedFromUser.first_name && forwardedFromUser.first_name[0]}
            </div>
          </div>
          <span className="font-semibold text-gray-700">
            {forwardedFromUser.first_name && forwardedFromUser.first_name}{" "}
            {forwardedFromUser.last_name && forwardedFromUser.last_name}
          </span>
          <span>
            {forwardedFrom.created_at &&
              formatDateLabel(forwardedFrom.created_at)}
          </span>
        </div>
        <div className="text-xs pl-8">
          {forwardedFrom?.content && plainTextContent}
        </div>

        <div className="text-xs">
          {hasForwardedImages && (
            <div className="mb-2">
              <ChatImageGrid images={forwardedImages} />
              <RenderAttachments message={forwardedFrom} isCurrentUser={IsMe} />
            </div>
          )}
          {forwardedFrom?.attachment?.length > 0 &&
          <RenderAttachments message={forwardedFrom} isCurrentUser={IsMe} />
          }
        </div>
      </div>

      <div className="text-xs leading-relaxed break-words">
        {reply ? (
          <>
            <RichTextReadOnlyEditor
              content={msg.content}
              className={`prose prose-sm max-w-none prose-invert`}
            />
          </>
        ) : plainTextContent.length > MAX_LENGTH ? (
          displayText
        ) : (
          content
        )}
      </div>
      {content.length > MAX_LENGTH && (
        <>
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-2  font-bold   transition-colors text-xs"
            >
              Read more
            </button>
          )}

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-2  font-bold  transition-colors text-xs"
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
};
