// ImageComponentReadOnly.ts
import { Node } from "@tiptap/core";
import { getEditorAssetSrc } from "src/utils/editor.helper";


// Add this function at the top of the file
function resolveAssetUrl(assetId: string) {
  if (!assetId) return "";
  return getEditorAssetSrc({
    assetId,
    projectId: (window as any).__CURRENT_PROJECT_ID__,  
    workspaceSlug: (window as any).__CURRENT_WORKSPACE_SLUG__,
  }) ?? "";
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
      wrapper.style.margin = "4px";
      wrapper.style.borderRadius = "8px";
      wrapper.style.overflow = "hidden";
      wrapper.style.border = "1px solid #e5e7eb";

      const img = document.createElement("img");
      img.src = resolveAssetUrl(node.attrs.src); 
      img.style.width = node.attrs.width;
      img.style.height = node.attrs.height;
      img.style.objectFit = "cover";
      img.style.display = "block";

      wrapper.appendChild(img);
      return { dom: wrapper };
    };
  },
});
