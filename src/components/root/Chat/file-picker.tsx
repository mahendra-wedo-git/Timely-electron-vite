import { useRef } from "react";
import { Plus } from "lucide-react";
import { uploadEditorAsset } from "src/redux/assetsSlice";
import { useAppDispatch } from "src/redux/hooks";

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
  currentChatId?: string;
  workspaceSlug: string;
};

export const FilePicker: React.FC<FilePickerProps> = ({
  onUploaded,
  currentChatId,
  workspaceSlug,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const validFiles: FileData[] = [];
    const failedFiles: string[] = []; // To track files that couldn't be uploaded

    // Validate and prepare files for upload
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(
          `"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`
        );
        failedFiles.push(file.name);
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

    if (validFiles.length === 0 || !currentChatId) return; // If no valid files, exit early

    try {
      // Upload all valid files concurrently
      const uploadPromises = validFiles.map(async (file) => {
        try {
          // Dispatch uploadEditorAsset and await the resolved result
          const result = await dispatch(
            uploadEditorAsset({
              blockId: currentChatId,
              workspaceSlug,
              data: {
                entity_identifier: currentChatId,
                entity_type: "CHAT_ATTACHMENT",
              },
              file: file.file,
            })
          ).unwrap(); // .unwrap() gets the fulfilled action's payload

          const asset_id = result.asset_id; // Access the asset_id from the result
          console.log("asset_id:", asset_id);

          // Return file data after successful upload
          return {
            id: asset_id,
            name: file.name,
            type: file.type,
            size: file.size,
          };
        } catch (err) {
          console.error(`Failed to upload file: ${file.name}`, err);
          failedFiles.push(file.name); // Track files that failed to upload
          return null; // Return null if upload fails
        }
      });

      // Wait for all uploads to finish
      const uploadedFiles = await Promise.all(uploadPromises);
      console.log("uploadedFiles", uploadedFiles);

      // Filter out any null values (failed uploads)
      const successfulFiles = uploadedFiles.filter(Boolean) as FileData[];
      console.log("successfulFiles", successfulFiles);

      if (onUploaded) {
        onUploaded(successfulFiles);
      }

      if (failedFiles.length > 0) {
        alert(
          `The following files failed to upload: ${failedFiles.join(", ")}`
        );
      }
    } catch (err) {
      console.error("Error during file upload process:", err);
      alert("An error occurred while uploading files. Please try again.");
    } finally {
      e.target.value = "";
    }
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
