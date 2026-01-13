import { useEffect, useState } from "react";
import { ImageFullScreenAction } from "./full-screen";

export const ImageFullscreenProvider = () => {
  const [image, setImage] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      setImage(e.detail);
      setOpen(true);
    };

    window.addEventListener("open-image-fullscreen", handler);
    return () =>
      window.removeEventListener("open-image-fullscreen", handler);
  }, []);

  if (!image) return null;

  return (
    <ImageFullScreenAction
      image={image}
      isOpen={open}
      toggleFullScreenMode={setOpen}
    />
  );
};
