import {
  X,
  Plus,
  Minus,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  Fragment,
} from "react";
import ReactDOM from "react-dom";
import { cn, getAssetIdFromUrl } from "src/utils";
import { resolveAssetUrl } from "./imageComponent";

export type Image = {
  id?: string | number;
  src: string;
  alt?: string;
};

type ImageGridProps = {
  images: Image[];
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.05;

export const ChatImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [magnification, setMagnification] = useState<number>(1);
  const [initialMagnification, setInitialMagnification] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  if (!images?.length) return null;

  const visibleImages = images.slice(0, 4);
  const remainingCount = images.length - visibleImages.length;

  const currentImage = activeIndex !== null ? images[activeIndex] : null;

  const openModalAt = (index: number) => {
    setActiveIndex(index);
    setMagnification(1);
    setInitialMagnification(1);
    setNaturalDimensions(null);
  };

  const closeModal = useCallback(() => {
    if (isDragging) return;
    setActiveIndex(null);
    setMagnification(1);
    setInitialMagnification(1);
    setNaturalDimensions(null);
  }, [isDragging]);

  const navigateImage = (direction: "prev" | "next") => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      const newIndex =
        direction === "prev"
          ? Math.max(prev - 1, 0)
          : Math.min(prev + 1, images.length - 1);
      // Reset zoom and position when changing images
      setMagnification(1);
      setNaturalDimensions(null);
      if (imgRef.current) {
        imgRef.current.style.left = "0px";
        imgRef.current.style.top = "0px";
      }
      return newIndex;
    });
  };

  // Load image to get natural dimensions
  useEffect(() => {
    if (activeIndex === null || !currentImage) return;
    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      setNaturalDimensions({
        width: 800,
        height: 600,
      });
    };
    img.src = resolveAssetUrl(currentImage.src);
  }, [activeIndex, currentImage]);

  const handleMagnification = (action: "increase" | "decrease") => {
    setMagnification((prev) => {
      let newMagnification = prev;
      if (action === "increase")
        newMagnification = Math.min(prev + ZOOM_SPEED, MAX_ZOOM);
      if (action === "decrease")
        newMagnification = Math.max(prev - ZOOM_SPEED, MIN_ZOOM);
      return newMagnification;
    });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!imgRef.current) return;
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0)
        setMagnification((prev) => Math.min(prev + ZOOM_SPEED, MAX_ZOOM));
      else setMagnification((prev) => Math.max(prev - ZOOM_SPEED, MIN_ZOOM));
    }
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex, handleWheel]);

  const setImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node || activeIndex === null) return;

      imgRef.current = node;

      const imageWidth = naturalDimensions?.width || node.naturalWidth || 800;
      const imageHeight =
        naturalDimensions?.height || node.naturalHeight || 600;

      const viewportWidth = window.innerWidth * 0.9;
      const viewportHeight = window.innerHeight * 0.75;

      const widthRatio = viewportWidth / imageWidth;
      const heightRatio = viewportHeight / imageHeight;

      setInitialMagnification(Math.min(widthRatio, heightRatio, 1));
      setMagnification(1);

      node.style.left = "0px";
      node.style.top = "0px";
    },
    [activeIndex, naturalDimensions],
  );

  useEffect(() => {
    if (activeIndex === null || !naturalDimensions || !imgRef.current) return;

    const viewportWidth = window.innerWidth * 0.9;
    const viewportHeight = window.innerHeight * 0.75;
    const { width: imageWidth, height: imageHeight } = naturalDimensions;

    const widthRatio = viewportWidth / imageWidth;
    const heightRatio = viewportHeight / imageHeight;

    setInitialMagnification(Math.min(widthRatio, heightRatio, 1));
    setMagnification(1);

    if (imgRef.current) {
      imgRef.current.style.left = "0px";
      imgRef.current.style.top = "0px";
    }
  }, [activeIndex, naturalDimensions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imgRef.current) return;

    const imgWidth = imgRef.current.offsetWidth * magnification;
    const imgHeight = imgRef.current.offsetHeight * magnification;

    if (imgWidth > window.innerWidth || imgHeight > window.innerHeight) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragOffset.current = {
        x: parseInt(imgRef.current.style.left || "0"),
        y: parseInt(imgRef.current.style.top || "0"),
      };
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !imgRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      imgRef.current.style.left = `${dragOffset.current.x + dx / magnification}px`;
      imgRef.current.style.top = `${dragOffset.current.y + dy / magnification}px`;
    },
    [isDragging, magnification],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (activeIndex === null) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeIndex, handleMouseMove, handleMouseUp]);

  const handleDownload = async () => {
    if (!currentImage) return;
    console.log("currentImagecurrentImage", currentImage);
    const resolvedSrc = resolveAssetUrl(currentImage.src) || currentImage.src;
    if (!resolvedSrc) return;
    try {
      const response = await fetch(resolvedSrc, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentImage.src.split("/").pop() || "image.jpg";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Image download failed:", error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft" && activeIndex > 0) navigateImage("prev");
      if (e.key === "ArrowRight" && activeIndex < images.length - 1)
        navigateImage("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, closeModal]);

  return (
    <Fragment>
      <div
        className={cn(
          "grid gap-1.5 rounded-lg overflow-hidden",
          images.length === 1 && "grid-cols-1 max-w-xs",
          images.length === 2 && "grid-cols-2 max-w-md",
          images.length >= 3 && "grid-cols-2 max-w-md",
        )}
      >
        {visibleImages.map((image, index) => {
          const isCountTile = index === 3 && remainingCount > 0;
          return (
            <button
              key={image.id ?? index}
              type="button"
              className={cn(
                "relative w-full max-w-[200px] aspect-square overflow-hidden bg-gray-100 rounded-sm",
                images.length === 3 && index === 0 && "row-span-2",
                isCountTile && "cursor-pointer",
              )}
              onClick={() => openModalAt(index)}
            >
              <img
                src={resolveAssetUrl(image.src) || image.src}
                alt={image.alt ?? "attachment"}
                className={cn(
                  "size-full object-cover",
                  isCountTile && "blur-[1px] scale-105",
                )}
              />
              {isCountTile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="px-2 py-1 text-lg font-semibold text-white rounded-full bg-black/60">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeIndex !== null &&
        currentImage &&
        ReactDOM.createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[9999] bg-black/90 grid place-items-center",
              {
                "cursor-grabbing": isDragging,
              },
            )}
            ref={modalRef}
            onMouseDown={(e) => e.target === modalRef.current && closeModal()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-10 right-10 w-8 h-8 grid place-items-center z-10"
            >
              <X className="w-8 h-8 text-white/60 hover:text-white transition-colors" />
            </button>

            {/* Navigation buttons */}
            {activeIndex > 0 && (
              <button
                type="button"
                onClick={() => navigateImage("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center bg-black/60 rounded-full hover:bg-black/80 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {activeIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => navigateImage("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center bg-black/60 rounded-full hover:bg-black/80 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Main image */}
            <img
              ref={setImageRef}
              src={resolveAssetUrl(currentImage.src) || currentImage.src}
              alt={currentImage.alt ?? "attachment"}
              className="object-contain rounded-md shadow-lg"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (
                  !naturalDimensions &&
                  img.naturalWidth &&
                  img.naturalHeight
                ) {
                  setNaturalDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                }
              }}
              style={{
                width: naturalDimensions
                  ? `${naturalDimensions.width * initialMagnification * magnification}px`
                  : "auto",
                height: naturalDimensions
                  ? `${naturalDimensions.height * initialMagnification * magnification}px`
                  : "auto",
                maxWidth: "90vw",
                maxHeight: "90vh",
                transition: "width 0.2s ease, height 0.2s ease",
                position: "relative",
                left: "0px",
                top: "0px",
              }}
              onMouseDown={handleMouseDown}
            />

            {/* Controls bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 rounded-md border border-white/20 py-2 divide-x divide-white/20 bg-black">
              {/* Image counter */}
              <div className="px-3 text-sm text-white/80">
                {activeIndex + 1} / {images.length}
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 px-2">
                <button
                  type="button"
                  onClick={() => handleMagnification("decrease")}
                  className="w-6 h-6 grid place-items-center text-white/60 hover:text-white disabled:text-white/30 transition-colors duration-200"
                  disabled={magnification <= MIN_ZOOM}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="text-sm w-12 text-center text-white">
                  {Math.round(100 * magnification)}%
                </span>

                <button
                  type="button"
                  onClick={() => handleMagnification("increase")}
                  className="w-6 h-6 grid place-items-center text-white/60 hover:text-white disabled:text-white/30 transition-colors duration-200"
                  disabled={magnification >= MAX_ZOOM}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* External link & Download buttons */}
              <div className="flex items-center gap-1 px-2">
                <button
                  type="button"
                  onClick={() => window.open(currentImage.src, "_blank")}
                  className="flex-shrink-0 w-8 h-8 grid place-items-center text-white/60 hover:text-white transition-colors duration-200"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-shrink-0 w-8 h-8 grid place-items-center text-white/60 hover:text-white transition-colors duration-200"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Fragment>
  );
};
