// ImageComponentReadOnly.ts
import { Node } from "@tiptap/core";
import { getEditorAssetSrc } from "src/utils/editor.helper";

// Add this function at the top of the file
export function resolveAssetUrl(assetId: string) {
  if (!assetId) return "";
  return (
    getEditorAssetSrc({
      assetId,
      projectId: (window as any).__CURRENT_PROJECT_ID__,
      workspaceSlug: (window as any).__CURRENT_WORKSPACE_SLUG__,
    }) ?? ""
  );
}

// Then define your Node
export const ImageComponentReadOnly = Node.create({
  name: "imageComponent",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "129px" },
      height: { default: "129px" },
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
      wrapper.style.cursor = "pointer";

      const img = document.createElement("img");

      const resolvedSrc = resolveAssetUrl(node.attrs.src);

      img.src = resolvedSrc;
      img.style.width = node.attrs.width;
      img.style.height = node.attrs.height;
      img.style.objectFit = "cover";
      img.style.display = "block";

      img.onclick = () => {
        window.dispatchEvent(
          new CustomEvent("open-image-fullscreen", {
            detail: {
              src: resolvedSrc, 
              width: node.attrs.width,
              height: node.attrs.height,
              aspectRatio: Number(node.attrs.aspectratio),
            },
          })
        );
      };

      wrapper.appendChild(img);
      return { dom: wrapper };
    };
  },
});
