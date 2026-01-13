import { FC, useState } from "react";
import { FileText, Image, File, Download, Search } from "lucide-react";
import { IChatMessage } from "src/types";
import { formatFileSize, getFileURL } from "src/utils";
import { getFileIcon } from "src/assets/attachment";

// File type interface
interface ChatFile {
  id: string;
  name: string;
  type: string;
  sharedOn: string;
  sentBy: string;
  sentByAvatar?: string;
  url?: string;
  size?: string;
}

interface ChatFileListProps {
  files: IChatMessage[];
  memberDetails?: any;
}

export const ChatFileList: FC<ChatFileListProps> = ({
  files,
  memberDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Filter files based on search
  const filteredFiles = files.filter((file) =>
    file.attachment?.some(
      (att) =>
        att.attributes?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        att.created_at.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) as IChatMessage[];
  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    console.log("toggleFileSelection called", fileId);
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };
  const handleDownloadFile = async (files: any) => {
    if (!files?.attributes) return;
    const attachment = files;
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
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Search Bar */}
      {files.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 ml-auto">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none "
            />
          </div>
        </div>
      )}

      {/* File List Table */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files found
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? "Try adjusting your search"
                : "Files shared in this chat will appear here"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={
                      selectedFiles.size === filteredFiles.length &&
                      filteredFiles.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(
                          new Set(filteredFiles.map((f) => f.id))
                        );
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                  />
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shared on
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent by
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((files) =>
                files.attachment?.map((file) => {
                  const memberInfo = memberDetails
                    ? memberDetails[files.sender]
                    : null;

                  console.log("memberInfomemberInfo", memberInfo);
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      //   onClick={() => onOpen?.(file.attributes)}
                    >
                      {/* <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10">
                          {getFileIcon(file.attributes?.name?.split(".").pop() || "")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate max-w-md">
                            {file?.attributes.name}
                          </span>
                          {file?.attributes.size && (
                            <span className="text-xs text-gray-500">
                              {formatFileSize(file?.attributes.size)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatDate(file.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {memberInfo?.avatar_url ? (
                            <img
                              src={getFileURL(memberInfo?.avatar_url)}
                              alt={file.attributes.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold mr-2">
                              {memberInfo?.display_name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">
                            {memberInfo?.first_name && memberInfo?.last_name
                              ? `${memberInfo.first_name} ${memberInfo.last_name}`
                              : memberInfo?.display_name || "User"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {/* <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                            title="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
