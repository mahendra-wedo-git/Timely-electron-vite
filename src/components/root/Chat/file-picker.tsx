import { useRef } from "react";
import { Plus } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export type FileData = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
};

type FilePickerProps = {
  onUploaded?: (files: FileData[]) => void;
};

export const FilePicker: React.FC<FilePickerProps> = ({ onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const validFiles: FileData[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      });
    }

    if (validFiles.length && onUploaded) {
      onUploaded(validFiles);
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.json,.zip,.rar,.ppt,.pptx,.odt,.ods"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        title="Attach file"
      >
        <Plus size={20} />
      </button>
    </>
  );
};
