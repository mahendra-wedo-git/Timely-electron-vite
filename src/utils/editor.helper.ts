// helpers

import { getFileURL } from "./file.helper";

type TEditorSrcArgs = {
  assetId: string;
  projectId?: string;
  workspaceSlug: string;
  isdelete?: boolean;
};

/**
 * @description generate the file source using assetId
 * @param {TEditorSrcArgs} args
 */
export const getEditorAssetSrc = (args: TEditorSrcArgs): string | undefined => {
  const { assetId, projectId, workspaceSlug, isdelete } = args;
  let url: string | undefined = "";
  if (projectId) {
    url = (`/api/assets/v2/workspaces/${workspaceSlug}/projects/${projectId}/${assetId}/`);
  } else {
    url = (`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`);
  }
  if (isdelete)
    return url
  return getFileURL(url);
};

export const getTextContent = (jsx: JSX.Element | React.ReactNode | null | undefined): string => {
  if (!jsx) return "";

  const div = document.createElement("div");
  div.innerHTML = jsx.toString();
  return div.textContent?.trim() ?? "";
};

export const isEditorEmpty = (description: string | undefined): boolean =>
  !description ||
  description === "<p></p>" ||
  description === `<p class="editor-paragraph-block"></p>` ||
  description.trim() === "";
