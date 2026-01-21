import React, { useCallback, useState } from "react";
import { X, Download, ExternalLink, Calendar, Minus, Plus } from "lucide-react";
// import { format, parseISO } from "date-fns";
import { formatDateLabel, getFileURL } from "src/utils";
import { resolveAssetUrl } from "./imageComponent";
import { useParams } from "react-router-dom";
import { getEditorAssetSrc } from "src/utils/editor.helper";

interface ImageAttachment {
  id: string;
  asset: string;
  created_at: string;
  created_by: string;
  attributes?: {
    width?: string;
    height?: string;
    size?: number;
  };
}

interface MemberDetails {
  [key: string]: {
    id: string;
    display_name?: string;
    first_name?: string;
    avatar_url?: string;
  };
}

interface ChatImageListProps {
  images: ImageAttachment[];
  memberDetails: MemberDetails;
  workspaceSlug: string;
}

// Main Image List Component
export const ChatImageList: React.FC<ChatImageListProps> = ({
  images,
  memberDetails,
  workspaceSlug,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { workspace: currentWorkspaceSlug, project: currentProjectId } =
    useParams();

  const [zoom, setZoom] = useState(1);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;
  // Group images by date
  const groupedImages = images.reduce(
    (groups, image) => {
      const date = formatDateLabel(image.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(image);
      return groups;
    },
    {} as Record<string, ImageAttachment[]>
  );

  // Get member name
  const getMemberName = (userId: string): string => {
    const member = memberDetails[userId];
    return member?.display_name || member?.first_name || "Unknown User";
  };
  const handleDownload = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop() || "image.jpg";
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);
  const handleZoomIn = () =>
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const handleWheelZoom = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full bg-white h-full flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-500 text-sm">
            Photos shared in this chat will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Photos ({images.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All images shared in this conversation
          </p>
        </div>

        {/* Grouped Images */}
        {Object.entries(groupedImages).map(([date, dateImages]) => (
          <div key={date} className="mb-8">
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {dateImages.map((image) => {
                (window as any).__CURRENT_PROJECT_ID__ = currentProjectId;
                (window as any).__CURRENT_WORKSPACE_SLUG__ =
                  currentWorkspaceSlug;
                const imageUrl = getFileURL(image.asset);
                if (!imageUrl) {
                  return null;
                }
                const memberName = getMemberName(image.created_by);
                return (
                  <div
                    key={image.id}
                    className="group relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    {/* Image */}
                    <img
                      src={imageUrl}
                      alt={`Shared by ${memberName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-end">
                      <div className="w-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-xs font-medium truncate">
                          {memberName}
                        </p>
                        <p className="text-xs text-gray-300">
                          {formatDateLabel(image.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Size Badge */}
                    {image.attributes?.size && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {(image.attributes.size / 1024).toFixed(0)} KB
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <>
          {/* <ImageModal
            image={selectedImage}
            imageUrl={getFileURL(selectedImage.asset) || ""}
            onClose={() => setSelectedImage(null)}
            memberDetails={memberDetails}
          /> */}

          <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center select-none"
            onClick={() => setSelectedImage(null)}
            onWheel={handleWheelZoom}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </button>

            <div
              className="flex items-center justify-center max-h-[90%] max-w-[90%] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="preview"
                className="object-contain transition-transform duration-300 ease-in-out"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  cursor: zoom > 1 ? "move" : "default",
                }}
              />
            </div>

            <div className="absolute bottom-8 flex items-center gap-3 bg-black/70 px-4 py-2 rounded-lg border border-white/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoom <= MIN_ZOOM}
                className="text-white/70 hover:text-white disabled:opacity-40"
              >
                <Minus className="w-5 h-5" />
              </button>

              <span className="text-white text-sm w-14 text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoom >= MAX_ZOOM}
                className="text-white/70 hover:text-white disabled:opacity-40"
              >
                <Plus className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-white/30 mx-2" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(selectedImage, "_blank");
                }}
                className="text-white/70 hover:text-white"
              >
                <ExternalLink className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedImage);
                }}
                className="text-white/70 hover:text-white"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
