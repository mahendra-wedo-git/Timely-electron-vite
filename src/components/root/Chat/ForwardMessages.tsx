import { Forward } from "lucide-react";
import React, { FC, useState } from "react";
import { useUser } from "src/context";
import { formatDateLabel } from "src/utils";
interface IForwardedMessage {
  forwardedFromUser: any;
  forwardedFrom: any;
  msg: any;
}
export const ForwardedMessage: FC<IForwardedMessage> = ({
  forwardedFromUser,
  forwardedFrom,
  msg,
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

  return (
    <div className={` ${currentUser?.data?.id === forwardedFromUser.id ? "bg-indigo-600 text-white" : "bg-gray-100"}  w-full max-w-md rounded-2xl font-sans`}>
      <div className="bg-white text-gray-800 rounded-lg p-3 mb-4 flex flex-col gap-1 relative border-l-4 border-gray-300">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {/* <span className="text-lg">↪</span> */}
          <Forward className="h-3.5 w-3.5 text-custom-text-100" />
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
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
        <div className="text-sm pl-5">
          {forwardedFrom?.content && forwardedFrom.content}
        </div>
      </div>

      <div className="text-sm leading-relaxed break-words">{content.length > MAX_LENGTH ? displayText : content}</div>
      {content.length > MAX_LENGTH && (
        <>
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-2  font-bold   transition-colors block text-sm"
            >
              Read more
            </button>
          )}

          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-2  font-bold  transition-colors block text-sm"
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
};
