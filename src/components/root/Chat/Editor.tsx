import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Send, Smile, X, Plus, ImagePlus } from "lucide-react";

// Emoji Picker Component
const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👏",
    "🙌",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "🔥",
    "✨",
    "💫",
    "⭐",
    "🌟",
    "💯",
    "✅",
    "❌",
    "⚡",
    "💥",
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
const FilePreview = ({ files, onRemove }) => {
  const getFileIcon = (extension) => {
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📊",
      pptx: "📊",
      zip: "📦",
      rar: "📦",
      txt: "📃",
      default: "📎",
    };
    return iconMap[extension] || iconMap.default;
  };

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
              <span className="text-xl">
                {getFileIcon(file.name.split(".").pop())}
              </span>
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
const ReplyPreview = ({ replyTo, onClose }) => {
  if (!replyTo) return null;

  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-100">
      <div className="flex items-start justify-between bg-indigo-50 border-l-4 border-indigo-500 rounded p-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-indigo-700 mb-1">
            Replying to {replyTo.sender}
          </div>
          <div className="text-sm text-gray-600 line-clamp-2">
            {replyTo.content}
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
const TiptapChatEditor = () => {
  const [files, setFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
        placeholder:
          files.length > 0
            ? `${files.length} file(s) ready to send...`
            : "Type a message...",
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-2",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 hover:underline",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
        //   "prose prose-sm max-w-none focus:outline-none min-h-[24px] max-h-[300px] overflow-y-auto text-sm text-gray-700 placeholder:text-gray-400",
         "focus:outline-none min-h-[24px] max-h-[300px] overflow-y-auto text-sm text-gray-700 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        //    "prose prose-sm max-w-none focus:outline-none min-h-[24px] max-h-[300px] overflow-y-auto text-sm text-gray-700 placeholder:text-gray-400 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      },
    },
    onUpdate: ({ editor }) => {
      console.log("Editor content:", editor.getHTML());
    },
  });

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file: file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor?.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    editor?.chain().focus().insertContent(emoji).run();
  };

  // Handle send message
  const handleSend = () => {
    if (!editor) return;

    const content = editor.getHTML();
    const isEmpty = editor.isEmpty;

    if (isEmpty && files.length === 0) return;

    console.log("Sending message:", {
      content,
      files,
      replyTo,
    });

    editor.commands.clearContent();
    setFiles([]);
    setReplyTo(null);
  };

  // Handle Enter key
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event) => {
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
  }, [editor, files, replyTo]);

  // Remove file
  const handleRemoveFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  if (!editor) return null;

  return (
    <div className="flex justify-center py-4 px-6 bg-gray-50">
      <div className="w-full max-w-4xl">
        {/* Demo: Reply Example Button */}
        {/* <div className="mb-4">
          <button
            onClick={() =>
              setReplyTo({
                sender: "John Doe",
                content: "Hey, how are you doing today?",
              })
            }
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            Demo: Set Reply Message
          </button>
        </div> */}

        {/* Editor Container */}
        <div className="bg-white rounded rounded-2xl  rounded shadow-sm border border-gray-200 focus-within:shadow-md transition-all overflow-hidden">
          {/* Reply Preview */}
          {replyTo && (
            <div className="px-5 pt-3 pb-2">
              <ReplyPreview
                replyTo={replyTo}
                onClose={() => setReplyTo(null)}
              />
            </div>
          )}

          {/* File Preview */}
          {files.length > 0 && (
            <div className="px-5 pt-3 pb-2">
              <FilePreview files={files} onRemove={handleRemoveFile} />
            </div>
          )}

          {/* Input Container */}
          {/* Input Container */}
          {/* <div className="flex flex-col px-5 py-3 gap-3"> */}
          <div className="relative flex items-end gap-2 px-5 py-3">
            {/* Editor Content */}
            {/* <div className="flex-1 min-w-0"> */}
            <div className="flex-1 m-auto break-words">
              <EditorContent editor={editor} />
            </div>

            {/* Action Buttons (Bottom) */}
            {/* <div className="flex items-center justify-end gap-4 flex-shrink-0"> */}
            <div className="flex items-center gap-4 shrink-0 ml-2">
              {/* Emoji Picker */}
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
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={editor.isEmpty && files.length === 0}
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

export default TiptapChatEditor;
