import { FC } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageComponentReadOnly } from "./imageComponent";

type RichTextReadOnlyEditorProps = {
  content: string; // HTML from editor.getHTML()
  className?: string;
  maxHeight?: number;
  text?: string;
};

export const RichTextReadOnlyEditor: FC<RichTextReadOnlyEditorProps> = ({
  content,
  className,
  maxHeight = 400,
  text = "sm",
}) => {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      ImageComponentReadOnly,
    ],
    editorProps: {
      attributes: {
        class: `text-${text}  break-words tracking-wide whitespace-pre-wrap max-h-[${maxHeight}px] overflow-y-auto`,
      },
    },
    content,
  });

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};
