import { FC } from "react";
import { X } from "lucide-react";
import { formatDateLabel } from "src/utils";
import { cleanedHTML, extractPlainText } from "src/utils/string.helper";

interface IMessage {
  memberMap: any;
  selectedMassage: any;
  reply?: any;
  handleReplay?: any;
}

export const PreviewMessage: FC<IMessage> = ({
  memberMap,
  selectedMassage,
  reply,
  handleReplay,
}) => {
  const senderDetails = memberMap[selectedMassage?.sender];
  const sanitizedMessageContent = cleanedHTML(selectedMassage?.content);
  const plainTextContent = extractPlainText(sanitizedMessageContent);
  
  return (
    <div className="relative bg-gray-50 rounded-lg p-3 border-l-4 border-indigo-600">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {senderDetails?.display_name?.charAt(0).toUpperCase() || 
           senderDetails?.first_name?.charAt(0).toUpperCase() || 
           "U"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {senderDetails?.first_name && senderDetails?.last_name
                ? `${senderDetails.first_name} ${senderDetails.last_name}`
                : senderDetails?.display_name || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {selectedMassage?.created_at && formatDateLabel(selectedMassage.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {plainTextContent && plainTextContent.length > 100
              ? `${plainTextContent.slice(0, 100)}...`
              : plainTextContent}
          </p>
        </div>

        {/* Close Button */}
        {reply && handleReplay && (
          <button
            onClick={() => handleReplay(null)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};