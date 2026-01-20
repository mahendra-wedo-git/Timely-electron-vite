import { Download, MoreVertical } from "lucide-react";
import { FC, useState } from "react";
import { getFileIcon } from "src/assets/attachment";
import { IChatGroup, IChatMessage } from "src/types";
import { formatFileSize, getFileURL } from "src/utils";
import { truncateText } from "src/utils/string.helper";
import { QuickActionsMenu } from "./QuickActionsMenu";
interface RenderAttachmentsProps {
  message: IChatMessage;
  isCurrentUser?: boolean;
}

export const RenderAttachments: FC<RenderAttachmentsProps> = ({
  message,
  isCurrentUser,
}) => {
  if (!message.attachment || message.attachment.length === 0) return null;
  const [menuState, setMenuState] = useState<{
    attachment: any;
    position: { top: number; right: number };
  } | null>(null);

  const getChatActions = (chat: IChatGroup) => [
    {
      id: "download",
      label: "Download",
      icon: <Download className="w-3 h-3" />,
      onClick: handleDownloadFile,
    },
  ];

  const handleDownloadFile = async (attachment: any) => {
    // if (!menuState?.attachment) return;
    // const attachment = menuState.attachment;
    try {
      const fileUrl = getFileURL(attachment.asset);
      const response = await fetch(fileUrl || "");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = attachment.attributes?.name || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };
  return (
    <div
      className={`flex flex-wrap flex-row cols-2 gap-2 mt-2 pb-2 ${isCurrentUser ? "justify-end " : "justify-start"} `}
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
              <span className="truncate font-medium text-xs text-custom-text-100">
                {truncateText(att.attributes?.name || "Unnamed file", 20)}
              </span>
              <span className="text-xs">
                {formatFileSize(att.attributes?.size) || ""}
              </span>
            </div>
            <div className="ml-auto pe-2">
              <Download
                className="h-4 w-4 text cursor-pointer"  
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(att as any);
                }}
              />
              {/* <MoreVertical
                className="h-3 w-3 text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuState({
                    attachment: att,
                    position: {
                      top: rect.bottom + window.scrollY,
                      right: window.innerWidth - rect.right,
                    },
                  });
                }}
              /> */}
            </div>

            {menuState?.attachment?.id === att.id && (
              <QuickActionsMenu
                actions={getChatActions(message as unknown as IChatGroup)}
                onClose={() => setMenuState(null)}
                position={menuState.position}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
