import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import debounce from "lodash/debounce";
import { FileService } from "src/services/file.service";
import { TFileEntityInfo, TFileSignedURLResponse } from "src/types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";

// import { TAttachmentUploadStatus } from "../issue/issue-details/attachment.store";
// import { RootState } from "@/redux/store";

type CachedAsset = {
  assetId: string;
  timestamp: number;
  promise: Promise<TFileSignedURLResponse>;
};
export type TAttachmentUploadStatus = {
  id: string;
  name?: string;
  progress: number;
  size?: number;
  type?: string;
};

interface EditorAssetState {
  assetsUploadStatus: Record<string, TAttachmentUploadStatus>;
}

const initialState: EditorAssetState = {
  assetsUploadStatus: {},
};

const fileService = new FileService();
const uploadCache = new Map<string, CachedAsset>();
const CACHE_DURATION = 5000;
const createUploadKey = (blockId: string, tempId: string) =>
  `${blockId}:${tempId}`;

/* Debounced Progress Update          */

const debouncedProgressMap: Record<string, ReturnType<typeof debounce>> = {};

// const getDebouncedProgress = (blockId: string, dispatch: any) => {
//   if (!debouncedProgressMap[blockId]) {
//     debouncedProgressMap[blockId] = debounce((progress: number) => {
//       dispatch(updateProgress({ blockId, progress }));
//     }, 16);
//   }
//   return debouncedProgressMap[blockId];
// };
const getDebouncedProgress = (uploadKey: string, dispatch: any) => {
  if (!debouncedProgressMap[uploadKey]) {
    debouncedProgressMap[uploadKey] = debounce((progress: number) => {
      dispatch(updateProgress({ uploadKey, progress }));
    }, 16);
  }
  return debouncedProgressMap[uploadKey];
};

//Async Thunk

export const uploadEditorAsset = createAsyncThunk<
  TFileSignedURLResponse,
  {
    blockId: string;
    data: TFileEntityInfo;
    file: File;
    projectId?: string;
    workspaceSlug: string;
  }
>("editorAsset/uploadEditorAsset", async (args, { dispatch }) => {
  const { blockId, data, file, projectId, workspaceSlug } = args;

  const cacheKey = `${file.name}_${file.size}_${blockId}`;
  const now = Date.now();

  const cached = uploadCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log("🔄 Using cached upload for:", file.name);
    return cached.promise;
  }

  //   const tempId = uuidv4();

  //   dispatch(
  //     startUpload({
  //       blockId,
  //       payload: {
  //         id: tempId,
  //         name: file.name,
  //         progress: 0,
  //         size: file.size,
  //         type: file.type,
  //       },
  //     })
  //   );
  const tempId = uuidv4();
  const uploadKey = createUploadKey(blockId, tempId);

  dispatch(
    startUpload({
      uploadKey,
      payload: {
        id: tempId,
        name: file.name,
        progress: 0,
        size: file.size,
        type: file.type,
      },
    })
  );

  const uploadPromise = (async () => {
    try {
      //   const progressHandler = (e: any) => {
      //     const progress = Math.round((e.progress ?? 0) * 100);
      //     getDebouncedProgress(blockId, dispatch)(progress);
      //   };
      const progressHandler = (e: any) => {
        const progress = Math.round((e.progress ?? 0) * 100);
        getDebouncedProgress(uploadKey, dispatch)(progress);
      };
      const response = projectId
        ? await fileService.uploadProjectAsset(
            workspaceSlug,
            projectId,
            data,
            file,
            progressHandler
          )
        : await fileService.uploadWorkspaceAsset(
            workspaceSlug,
            data,
            file,
            progressHandler
          );
      return response;
    } finally {
      //   dispatch(finishUpload(blockId));
      dispatch(finishUpload(uploadKey));
    }
  })();

  uploadCache.set(cacheKey, {
    assetId: tempId,
    timestamp: now,
    promise: uploadPromise,
  });

  cleanupCache();

  return uploadPromise;
});

/* ---------------------------------- */
/* Slice                              */
/* ---------------------------------- */

const editorAssetSlice = createSlice({
  name: "editorAsset",
  initialState,
  //   reducers: {
  //     startUpload: (
  //       state,
  //       action: PayloadAction<{
  //         blockId: string;
  //         payload: TAttachmentUploadStatus;
  //       }>
  //     ) => {
  //       set(
  //         state.assetsUploadStatus,
  //         [action.payload.blockId],
  //         action.payload.payload
  //       );
  //     },

  //     updateProgress: (
  //       state,
  //       action: PayloadAction<{ blockId: string; progress: number }>
  //     ) => {
  //       set(
  //         state.assetsUploadStatus,
  //         [action.payload.blockId, "progress"],
  //         action.payload.progress
  //       );
  //     },

  //     finishUpload: (state, action: PayloadAction<string>) => {
  //       delete state.assetsUploadStatus[action.payload];
  //     },
  //   },
  reducers: {
    startUpload: (
      state,
      action: PayloadAction<{
        uploadKey: string;
        payload: TAttachmentUploadStatus;
      }>
    ) => {
      state.assetsUploadStatus[action.payload.uploadKey] =
        action.payload.payload;
    },

    updateProgress: (
      state,
      action: PayloadAction<{ uploadKey: string; progress: number }>
    ) => {
      if (state.assetsUploadStatus[action.payload.uploadKey]) {
        state.assetsUploadStatus[action.payload.uploadKey].progress =
          action.payload.progress;
      }
    },

    finishUpload: (state, action: PayloadAction<string>) => {
      delete state.assetsUploadStatus[action.payload];
    },
  },
});

// Cache Cleanup

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of uploadCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      uploadCache.delete(key);
    }
  }
};

// Selectors

export const selectAssetsUploadPercentage = (state: RootState) => {
  const percentages: Record<string, number> = {};
  Object.entries(state.editorAsset.assetsUploadStatus).forEach(
    ([blockId, asset]) => {
      percentages[blockId] = asset.progress;
    }
  );
  return percentages;
};

// export const selectAssetUploadStatusByBlockId =
//   (blockId: string) => (state: RootState) =>
//     state.editorAsset.assetsUploadStatus[blockId];

export const selectAssetUploadStatusByBlockId =
  (blockId: string) => (state: RootState) =>
    Object.entries(state.editorAsset.assetsUploadStatus)
      .filter(([key]) => key.startsWith(`${blockId}:`))
      .map(([, value]) => value);

export const selectUploadsByBlockId = (blockId: string) => (state: RootState) =>
  Object.entries(state.editorAsset.assetsUploadStatus)
    .filter(([key]) => key.startsWith(`${blockId}:`))
    .map(([, value]) => value);

export const selectUploadByKey = (uploadKey: string) => (state: RootState) =>
  state.editorAsset.assetsUploadStatus[uploadKey];

/* ---------------------------------- */
/* Exports                            */
/* ---------------------------------- */

export const { startUpload, updateProgress, finishUpload } =
  editorAssetSlice.actions;

export default editorAssetSlice.reducer;
