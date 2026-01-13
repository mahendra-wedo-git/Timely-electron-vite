import { ExternalLink, Minus, Plus, X, Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";import { cn } from "src/utils";
;

type Props = {
  image: {
    src: string;
    height: string;
    width: string;
    aspectRatio: number;
  };
  isOpen: boolean;
  toggleFullScreenMode: (val: boolean) => void;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.05;

export const ImageFullScreenAction: React.FC<Props> = ({
  image,
  isOpen: isFullScreenEnabled,
  toggleFullScreenMode,
}) => {
  const { src, width, aspectRatio } = image;

  const [magnification, setMagnification] = useState<number>(1);
  const [initialMagnification, setInitialMagnification] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const widthInNumber = useMemo(() => Number(width?.replace("px", "")), [width]);

  // Load image to get natural dimensions
  useEffect(() => {
    if (!isFullScreenEnabled || !src) return;
    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      // Fallback to stored dimensions if image fails to load
      const fallbackWidth = widthInNumber || 800;
      const fallbackHeight = fallbackWidth / aspectRatio;
      setNaturalDimensions({
        width: fallbackWidth,
        height: fallbackHeight,
      });
    };
    img.src = src;
  }, [isFullScreenEnabled, src, widthInNumber, aspectRatio]);

  const handleMagnification = (action: "increase" | "decrease") => {
    setMagnification((prev) => {
      let newMagnification = prev;
      if (action === "increase") newMagnification = Math.min(prev + ZOOM_SPEED, MAX_ZOOM);
      if (action === "decrease") newMagnification = Math.max(prev - ZOOM_SPEED, MIN_ZOOM);
      return newMagnification;
    });
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!imgRef.current) return;
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) setMagnification((prev) => Math.min(prev + ZOOM_SPEED, MAX_ZOOM));
        else setMagnification((prev) => Math.max(prev - ZOOM_SPEED, MIN_ZOOM));
      }
    },
    []
  );

  useEffect(() => {
    if (!isFullScreenEnabled) return;
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isFullScreenEnabled, handleWheel]);

  const setImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node || !isFullScreenEnabled) return;

      imgRef.current = node;

      // Use natural dimensions if available, otherwise fallback to stored dimensions
      const imageWidth = naturalDimensions?.width || widthInNumber || node.naturalWidth || 800;
      const imageHeight = naturalDimensions?.height || (imageWidth / aspectRatio) || node.naturalHeight || (imageWidth / aspectRatio);

      const viewportWidth = window.innerWidth * 0.9;
      const viewportHeight = window.innerHeight * 0.75;

      const widthRatio = viewportWidth / imageWidth;
      const heightRatio = viewportHeight / imageHeight;

      setInitialMagnification(Math.min(widthRatio, heightRatio, 1));
      setMagnification(1);

      node.style.left = "0px";
      node.style.top = "0px";
    },
    [isFullScreenEnabled, naturalDimensions, widthInNumber, aspectRatio]
  );

  const handleClose = useCallback(() => {
    if (isDragging) return;
    toggleFullScreenMode(false);
    setMagnification(1);
    setInitialMagnification(1);
    setNaturalDimensions(null);
  }, [isDragging, toggleFullScreenMode]);

  // Recalculate initial magnification when natural dimensions are loaded
  useEffect(() => {
    if (!isFullScreenEnabled || !naturalDimensions || !imgRef.current) return;
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
  }, [isFullScreenEnabled, naturalDimensions]);

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
    [isDragging, magnification]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (!isFullScreenEnabled) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isFullScreenEnabled, handleMouseMove, handleMouseUp]);

  const handleDownload = async () => {
    console.log("srcsrcsrcsrcsrc",src)
    try {
      const response = await fetch(src, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = src.split("/").pop() || "image.jpg";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Image download failed:", error);
    }
  };

  // Portal modal
  return (
    <>
      {isFullScreenEnabled &&
        ReactDOM.createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[9999] bg-black/90 grid place-items-center",
              { "cursor-grabbing": isDragging }
            )}
            ref={modalRef}
            onMouseDown={(e) => e.target === modalRef.current && handleClose()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-10 right-10 w-8 h-8 grid place-items-center"
            >
              <X className="w-8 h-8 text-white/60 hover:text-white transition-colors" />
            </button>

            <img
              ref={setImageRef}
              src={src}
              className="object-contain rounded-md shadow-lg"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (!naturalDimensions && img.naturalWidth && img.naturalHeight) {
                  setNaturalDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                }
              }}
              style={{
                width: naturalDimensions
                  ? `${naturalDimensions.width * initialMagnification * magnification}px`
                  : "100%",
                height: naturalDimensions
                  ? `${naturalDimensions.height * initialMagnification * magnification}px`
                  : "100%",
                maxWidth: "90vw",
                maxHeight: "90vh",
                transition: "width 0.2s ease, height 0.2s ease",
                position: "relative",
                left: "0px",
                top: "0px",
              }}
              onMouseDown={handleMouseDown}
            />
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 rounded-md border border-white/20 py-2 divide-x divide-white/20 bg-black">
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
                  onClick={() => window.open(src, "_blank")}
                  className="flex-shrink-0 w-8 h-8 grid place-items-center text-white/60 hover:text-white transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-shrink-0 w-8 h-8 grid place-items-center text-white/60 hover:text-white transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
