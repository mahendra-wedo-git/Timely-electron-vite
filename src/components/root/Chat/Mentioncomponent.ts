import { Node, mergeAttributes } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";

export type MentionOptions = {
  HTMLAttributes: Record<string, any>;
  renderLabel: (props: { options: MentionOptions; node: any }) => string;
  suggestion: Omit<SuggestionOptions, "editor">;
};

export const MentionPluginKey = new PluginKey("mention");

export const MentionComponent = Node.create<MentionOptions>({
  name: "mention",

  addOptions() {
    return {
      HTMLAttributes: {},
      renderLabel({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        char: "@",
        pluginKey: MentionPluginKey,
        command: ({ editor, range, props }) => {
          // Generate unique ID for this mention instance
          const mentionId = crypto.randomUUID();

          // Delete the @ character and insert mention-component
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "mention",
                attrs: {
                  id: mentionId,
                  entity_identifier: props.id,
                  entity_name: "user_mention",
                  label: props.label,
                },
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const type = state.schema.nodes[this.name];
          const allow = !!$from.parent.type.contentMatch.matchType(type);

          return allow;
        },
      },
    };
  },

  group: "inline",

  inline: true,

  selectable: false,

  atom: true,

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
        tag: `mention-component[entity_name="${this.options.HTMLAttributes["entity_name"] ?? "user_mention"}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "mention-component",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderLabel({
        options: this.options,
        node,
      }),
    ];
  },

  renderText({ node }) {
    return this.options.renderLabel({
      options: this.options,
      node,
    });
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              tr.insertText(
                this.options.suggestion.char || "",
                pos,
                pos + node.nodeSize
              );

              return false;
            }
          });

          return isMention;
        }),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});