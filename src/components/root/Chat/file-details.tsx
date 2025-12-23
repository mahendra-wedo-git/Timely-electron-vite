import { useRef } from "react";
import { getFileIcon } from "src/assets/attachment";
import { IChatMessage } from "src/types";
import { formatFileSize, getFileURL } from "src/utils";
import { truncateText } from "src/utils/string.helper";

export const renderAttachments = (
  message: IChatMessage,
  isCurrentUser: boolean
) => {
  if (!message.attachment || message.attachment.length === 0) return null;
  
  return (
    <div
      className={`flex flex-wrap gap-2 mt-2 pb-2 ${isCurrentUser ? "justify-end" : "justify-start"} `}
    >
      {message.attachment.map((att) => {
        const url = getFileURL(att.asset);
        const isImage = att.attributes?.type?.startsWith("image/");

        if (isImage) return null;

        return (
          <div
            key={att.id}
            className="flex w-fit max-w-[280px] items-center gap-2 rounded-md border border-custom-border-200 bg-custom-background-100 px-2 py-1.5"
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(att.attributes?.name?.split(".").pop() || "")}
            </div>

            {/* File Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate font-medium text-sm text-custom-text-100">
                {truncateText(att.attributes?.name || "Unnamed file", 20)}
              </span>
              <span className="text-xs text-gray-500">
                {formatFileSize(att.attributes?.size) || ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
