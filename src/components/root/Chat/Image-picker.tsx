import React, { useRef, useState } from "react";
import { Image } from "lucide-react";
import { uploadEditorAsset } from "src/redux/assetsSlice";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export type ImageData = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
};

type ImagePickerProps = {
  onUploaded?: (images: ImageData[]) => void;
};

export const ImagePicker: React.FC<ImagePickerProps> = ({ onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const images: ImageData[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        alert(`"${file.name}" exceeds ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }

      images.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });
    console.log("onUploaded", images);
    if (images.length && onUploaded) {
      onUploaded(images);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        className={`
          p-1 rounded cursor-pointer transition
          ${isDragging ? "bg-indigo-100" : ""}
          text-gray-400 hover:text-gray-600
        `}
        title="Upload image"
      >
        <Image className="h-5 w-5" />
      </div>
    </>
  );
};
