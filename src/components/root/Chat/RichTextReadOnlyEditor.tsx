import { FC, useMemo, useRef, useEffect, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageComponentReadOnly } from "./imageComponent";
import { Node, mergeAttributes } from "@tiptap/core";
import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import { MentionPreview } from "./MentionPreview";
import * as ReactDOMClient from "react-dom/client";

type RichTextReadOnlyEditorProps = {
  content: string;
  className?: string;
  maxHeight?: number;
  text?: string;
  memberDetails?: any;
};

// Custom read-only node view for mention-component
const MentionReadOnlyItem = (props: any) => {
  const { node, extension } = props;
  const memberDetails = extension.options.memberDetails;
  
  // Get entity_identifier (the user's ID) from the mention-component attributes
  const entityIdentifier = node.attrs.entity_identifier;
  const label = node.attrs.label;

  const user = memberDetails?.[entityIdentifier];
  const name = user
    ? (user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.display_name || user.first_name)
    : label || "Unknown";

  const spanRef = useRef<HTMLSpanElement>(null);
  const tippyInstanceRef = useRef<TippyInstance | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for component to fully mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only initialize tippy after component is mounted and ref is available
    if (!isMounted || !spanRef.current || !entityIdentifier || !memberDetails) return;
    // console.log("memberDetailsmemberDetailsmemberDetails",memberDetails)

    // Small delay to ensure DOM is fully ready
    const timeoutId = setTimeout(() => {
      if (!spanRef.current) return;

      // Create a container for the tooltip content
      const tooltipContainer = document.createElement('div');
      const root = ReactDOMClient.createRoot(tooltipContainer);

      root.render(<MentionPreview userId={entityIdentifier} memberDetails={memberDetails} />);

      // Initialize tippy
      const instance = tippy(spanRef.current, {
        content: tooltipContainer,
        interactive: true,
        appendTo: () => document.body,
        placement: 'bottom',
        theme: 'light-border',
        trigger: 'mouseenter focus',
        delay: [200, 0], // 200ms delay on show, 0ms on hide
        arrow: true,
        animation: 'fade',
        onDestroy() {
          root.unmount();
        }
      });

      tippyInstanceRef.current = instance;
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (tippyInstanceRef.current) {
        tippyInstanceRef.current.destroy();
        tippyInstanceRef.current = null;
      }
    };
  }, [isMounted, entityIdentifier, memberDetails]);

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        ref={spanRef}
        className="bg-indigo-50 text-indigo-700 rounded px-1 font-medium decoration-clone cursor-pointer hover:bg-indigo-100 transition-colors"
      >
        {name}
      </span>
    </NodeViewWrapper>
  );
};

// Custom Mention Component Node for Read-Only Editor
const createMentionComponentReadOnly = (memberDetails: any) => {
  return Node.create({
    name: "mention",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    addOptions() {
      return {
        HTMLAttributes: {},
        memberDetails: memberDetails,
      };
    },

    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute("id"),
          renderHTML: (attributes) => {
            if (!attributes.id) {
              return {};
            }
            return {
              id: attributes.id,
            };
          },
        },
        entity_identifier: {
          default: null,
          parseHTML: (element) => element.getAttribute("entity_identifier"),
          renderHTML: (attributes) => {
            if (!attributes.entity_identifier) {
              return {};
            }
            return {
              entity_identifier: attributes.entity_identifier,
            };
          },
        },
        entity_name: {
          default: "user_mention",
          parseHTML: (element) => element.getAttribute("entity_name"),
          renderHTML: (attributes) => {
            return {
              entity_name: attributes.entity_name || "user_mention",
            };
          },
        },
        label: {
          default: null,
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: "mention-component",
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return ["mention-component", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addNodeView() {
      return ReactNodeViewRenderer(MentionReadOnlyItem);
    },
  });
};

export const RichTextReadOnlyEditor: FC<RichTextReadOnlyEditorProps> = ({
  content,
  className,
  maxHeight = 400,
  text = "sm",
  memberDetails
}) => {

  const extensions = useMemo(() => {
    return [
      StarterKit,
      ImageComponentReadOnly,
      createMentionComponentReadOnly(memberDetails)
    ];
  }, [memberDetails]);

  const editor = useEditor({
    editable: false,
    extensions: extensions,
    editorProps: {
      attributes: {
        class: `text-${text} break-words tracking-wide whitespace-pre-wrap max-h-[${maxHeight}px] overflow-y-auto outline-none`,
      },
    },
    content,
  }, [extensions]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};