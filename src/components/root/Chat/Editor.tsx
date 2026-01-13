import React, { useState, useRef, useEffect, FC } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Send, Smile, X, Plus, ImagePlus } from "lucide-react";
import { useAppDispatch } from "src/redux/hooks";
import { uploadEditorAsset } from "src/redux/assetsSlice";
import { getFileIcon } from "src/assets/attachment";
import { Node } from '@tiptap/core';

// Types
export type FileData = {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

interface FilePreviewProps {
  files: FileData[];
  onRemove: (fileId: string) => void;
}

interface ReplyPreviewProps {
  replyTo: any;
  onClose: () => void;
  memberDetails?: any;
}

interface TiptapChatEditorProps {
  currentChatId?: string;
  workspaceSlug?: string;
  replyTo?: any;
  selectedMessage?: any;
  memberDetails?: any;
  onSendMessage: (content: string, attachments: string[]) => void;
  onCancelReply?: () => void;
  placeholder?: string;
  maxHeight?: number;
}

// Custom Image Component Extension
const ImageComponent = Node.create({
  name: 'imageComponent',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '129px' },
      height: { default: '129px' },
      id: { default: null },
      aspectratio: { default: '1' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'image-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['image-component', HTMLAttributes];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.style.display = 'inline-block';
      dom.style.border = '2px solid #e5e7eb';
      dom.style.borderRadius = '8px';
      dom.style.padding = '8px';
      dom.style.margin = '4px';
      dom.style.width = node.attrs.width;
      dom.style.height = node.attrs.height;
      dom.style.backgroundColor = '#f9fafb';
      
      const icon = document.createElement('div');
      icon.innerHTML = '🖼️';
      icon.style.fontSize = '48px';
      icon.style.display = 'flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.height = '100%';
      
      dom.appendChild(icon);
      return { dom };
    };
  },
});

// Emoji Picker Component
const EmojiPicker: FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
    "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
    "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👏", "🙌",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "🔥", "✨", "💫", "⭐", "🌟", "💯", "✅", "❌", "⚡", "💥"
  ];

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72 z-50">
      <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-xl hover:bg-gray-100 rounded p-1 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// File Preview Component
const FilePreview: FC<FilePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-100">
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-100 group"
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                {getFileIcon(file.name.split(".").pop() || "")}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate max-w-[150px] text-xs font-medium text-gray-700">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="ml-2 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reply Preview Component
const ReplyPreview: FC<ReplyPreviewProps> = ({ 
  replyTo, 
  onClose,
  memberDetails 
}) => {
  if (!replyTo) return null;

  const getMemberName = (senderId: string) => {
    if (!memberDetails || !senderId) return "Unknown User";
    const member = memberDetails[senderId];
    return member?.display_name || member?.first_name || "Unknown User";
  };

  const stripHTML = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-100">
      <div className="flex items-start justify-between bg-indigo-50 border-l-4 border-indigo-500 rounded p-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-indigo-700 mb-1">
            Replying to {getMemberName(replyTo.sender)}
          </div>
          <div className="text-sm text-gray-600 line-clamp-2">
            {stripHTML(replyTo.content || "")}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Main Tiptap Chat Editor Component
export const TiptapChatEditor: FC<TiptapChatEditorProps> = ({
  currentChatId,
  workspaceSlug,
  replyTo,
  selectedMessage,
  memberDetails,
  onSendMessage,
  onCancelReply,
  placeholder = "Type a message...",
  maxHeight = 300,
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploadedAssetIds, setUploadedAssetIds] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageAssetIds, setImageAssetIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
      }),
      Placeholder.configure({
        placeholder: files.length > 0 
          ? `${files.length} file(s) ready to send...` 
          : placeholder,
      }),
      ImageComponent,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 hover:underline",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-[24px] max-h-[${maxHeight}px] overflow-y-auto text-sm text-gray-700 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`,
      },
    },
    content: '<p class="editor-paragraph-block break-all whitespace-pre-wrap"></p>',
  });

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentChatId || !workspaceSlug) return;

    const selectedFiles = Array.from(e.target.files);
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const validFiles: FileData[] = [];

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      const tempId = crypto.randomUUID();
      validFiles.push({
        id: tempId,
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      });
    }

    if (validFiles.length === 0) return;

    // Upload files
    const uploadPromises = validFiles.map(async (fileData) => {
      try {
        const result = await dispatch(
          uploadEditorAsset({
            blockId: currentChatId,
            workspaceSlug,
            data: {
              entity_identifier: currentChatId,
              entity_type: "CHAT_ATTACHMENT",
            },
            file: fileData.file!,
          })
        ).unwrap();

        return {
          ...fileData,
          id: result.asset_id,
        };
      } catch (err) {
        console.error(`Failed to upload file: ${fileData.name}`, err);
        return null;
      }
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as FileData[];

    setFiles((prev) => [...prev, ...uploadedFiles]);
    setUploadedAssetIds((prev) => {
      const updated = new Set(prev);
      uploadedFiles.forEach((f) => updated.add(f.id));
      return updated;
    });

    e.target.value = "";
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentChatId || !workspaceSlug || !editor) return;

    const selectedFiles = Array.from(e.target.files);

    for (const file of selectedFiles) {
      try {
        const result = await dispatch(
          uploadEditorAsset({
            blockId: currentChatId,
            workspaceSlug,
            data: {
              entity_identifier: currentChatId,
              entity_type: "CHAT_ATTACHMENT",
            },
            file,
          })
        ).unwrap();

        const assetId = result.asset_id;
        const componentId = crypto.randomUUID();

        // Insert image-component instead of img tag
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'imageComponent',
            attrs: {
              src: assetId,
              width: '129px',
              height: '129px',
              id: componentId,
              aspectratio: '1',
            },
          })
          .run();

        // Track image asset IDs separately
        setImageAssetIds((prev) => [...prev, assetId]);
        setUploadedAssetIds((prev) => {
          const updated = new Set(prev);
          updated.add(assetId);
          return updated;
        });
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }

    e.target.value = "";
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
  };

  // Handle send message
  const handleSend = () => {
    if (!editor) return;

    let content = editor.getHTML();
    const isEmpty = editor.isEmpty;

    if (isEmpty && uploadedAssetIds.size === 0) return;

    // Ensure proper paragraph structure matching web version
    if (!content.includes('class="editor-paragraph-block')) {
      content = content.replace(
        /<p>/g,
        '<p class="editor-paragraph-block break-all whitespace-pre-wrap">'
      );
    }

    onSendMessage(content, Array.from(uploadedAssetIds));

    // Reset state
    editor.commands.clearContent();
    editor.commands.setContent('<p class="editor-paragraph-block break-all whitespace-pre-wrap"></p>');
    setFiles([]);
    setUploadedAssetIds(new Set());
    setImageAssetIds([]);
    onCancelReply?.();
  };

  // Handle Enter key
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);

    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, uploadedAssetIds, replyTo]);

  // Focus editor when replyTo changes
  useEffect(() => {
    if (replyTo && editor) {
      setTimeout(() => {
        editor.commands.focus("end");
      }, 100);
    }
  }, [replyTo, editor]);

  // Remove file
  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadedAssetIds((prev) => {
      const updated = new Set(prev);
      updated.delete(fileId);
      return updated;
    });
  };

  if (!editor) return null;

  return (
    <div className="w-full p-4 bg-white">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 focus-within:shadow-md transition-all overflow-hidden">
          {/* Reply Preview */}
          {replyTo && (
            <ReplyPreview
              replyTo={replyTo}
              onClose={() => onCancelReply?.()}
              memberDetails={memberDetails}
            />
          )}

          {/* File Preview */}
          <FilePreview files={files} onRemove={handleRemoveFile} />

          {/* Input Container */}
          <div className="relative flex items-end gap-2 px-5 py-3">
            {/* Editor Content */}
            <div className="flex-1 m-auto break-words">
              <EditorContent editor={editor} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {/* Emoji Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>

              {/* Image Upload */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />

              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.json,.zip,.rar,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={editor.isEmpty && uploadedAssetIds.size === 0}
                className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};