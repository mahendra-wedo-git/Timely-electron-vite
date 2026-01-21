import React, { useState, useRef, useEffect, FC } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Send, Smile, X, Plus, ImagePlus, Paperclip } from "lucide-react";
import { useAppDispatch } from "src/redux/hooks";
import { uploadEditorAsset } from "src/redux/assetsSlice";
import { getFileIcon } from "src/assets/attachment";
import { Node } from "@tiptap/core";
import { getFileURL } from "src/utils";
import CodeBlock from "@tiptap/extension-code-block";
import { resolveAssetUrl } from "./imageComponent";
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { IChatMessage } from "src/types";
import { useForm } from "react-hook-form";
import { useOutsideClick } from "src/hooks/useOutsideClick";

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
const ImageComponent = Node.create({
  name: "imageComponent",
  inline: true,
  group: "inline",
  atom: true,

  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "129px" },
      height: { default: "129px" },
      id: { default: null },
      aspectratio: { default: "1" },
    };
  },

  parseHTML() {
    return [{ tag: "image-component" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-component", HTMLAttributes];
  },

  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div");
      wrapper.style.display = "inline-block";
      wrapper.style.margin = "4px";
      wrapper.style.borderRadius = "8px";
      wrapper.style.overflow = "hidden";
      wrapper.style.border = "1px solid #e5e7eb";
      wrapper.style.width = node.attrs.width;
      wrapper.style.height = node.attrs.height;

      const img = document.createElement("img");
      img.onclick = () => {
        window.dispatchEvent(
          new CustomEvent("open-image-fullscreen", {
            detail: { src: img.src },
          })
        );
      };

      const resolvedSrc = resolveAssetUrl(node.attrs.src) || node.attrs.src;

      img.src = resolvedSrc;
      // const assetMap = (window as any).__CHAT_ASSET_MAP__ || {};
      // img.src = assetMap[node.attrs.src] || node.attrs.src;

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.display = "block";

      wrapper.appendChild(img);

      return { dom: wrapper };
    };
  },
});

// Emoji Picker Component


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
  memberDetails,
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
  const [uploadedAssetIds, setUploadedAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageAssetIds, setImageAssetIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLElement>;
  const dispatch = useAppDispatch();
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    useOutsideClick(
    emojiPickerRef,
    () => setShowEmojiPicker(false),
    showEmojiPicker
  );
  const editor = useEditor({
    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
    },
    extensions: [
      StarterKit.configure({
        heading: false,
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
      // Custom Code Block Extension
      CodeBlock.configure({
        tabSize: 2,
        exitOnTripleEnter: true,
        HTMLAttributes: {
          class: "code-block",
        },
      }),
      Placeholder.configure({
        placeholder:
          files.length > 0
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
      handleKeyDown(view, event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },

    content:
      '<p class="editor-paragraph-block break-all whitespace-pre-wrap"></p>',
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
        alert(
          `"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
        );
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
            type: "imageComponent",
            attrs: {
              src: assetId,
              width: "129px",
              height: "129px",
              id: componentId,
              aspectratio: "1",
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

  useEffect(() => {
 if (files.length > 0 || uploadedAssetIds.size > 0 || editor?.isEmpty === false) {
   setIsEditorEmpty(false);
 } 
},[files])

  // Handle send message
  const handleSend = () => {
    if (!editor) return;

   const isEmpty = editor.isEmpty;
  const hasFiles = uploadedAssetIds.size > 0;

  // If nothing at all, do nothing
  if (isEmpty && !hasFiles) return;

  let content = "";

  // Only include editor HTML if there's text
  if (!isEmpty) {
    content = editor.getHTML();

    // Ensure paragraph class only when text exists
    if (!content.includes('class="editor-paragraph-block')) {
      content = content.replace(
        /<p>/g,
        '<p class="editor-paragraph-block break-all whitespace-pre-wrap">'
      );
    }
  }

    onSendMessage(content, Array.from(uploadedAssetIds));

    // Reset state
    editor.commands.clearContent();
    editor.commands.setContent(
      '<p class="editor-paragraph-block break-all whitespace-pre-wrap"></p>'
    );
    setFiles([]);
    setUploadedAssetIds(new Set());
    setImageAssetIds([]);
    onCancelReply?.();
  };

  // Handle Enter key
  // useEffect(() => {
  //   if (!editor) return;

  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === "Enter" && !event.shiftKey) {
  //       event.preventDefault();
  //       handleSend();
  //     }
  //   };

  //   const editorElement = editor.view.dom;
  //   editorElement.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     editorElement.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [editor, uploadedAssetIds, replyTo]);

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
        <div className=" rounded-2xl shadow-sm border border-gray-200 focus-within:shadow-md transition-all">
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
          <div className="relative flex items-end gap-2 px-5 py-2.5">
            {/* Editor Content */}
            <div className="flex-1 m-auto break-words">
              <EditorContent editor={editor} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 ml-2">
              {/* Emoji Picker */}
              <div className="relative" ref={emojiPickerRef} >

                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    type="button"
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <Smile size={20} />
                  </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-10 right-0 z-50">
                    <div className="rounded-2xl shadow-lg border border-custom-sidebar-border-300 overflow-hidden">
                      <EmojiPicker
                        previewConfig={{ showPreview: false }}
                        autoFocusSearch={false}
                        emojiStyle={EmojiStyle.NATIVE}
                        onEmojiClick={(emojiData) => {
                          handleEmojiSelect(emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                   <EmojiPicker open={showEmojiPicker} />
                </button>
              </div> */}

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
                <Paperclip className="h-5 w-5" />
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
                disabled={isEditorEmpty}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
