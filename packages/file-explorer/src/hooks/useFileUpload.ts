import { useCallback } from "react";

export const useFileUpload = () => {
  const upload = useCallback(
    (mode: "file" | "folder", onSelected: (files: FileList) => void) => {
      // Create a hidden input element.
      const input = document.createElement("input");
      input.type = "file";
      input.style.display = "none";

      // Configure the input based on the selection mode.
      if (mode === "folder") {
        // Enable folder selection.
        input.webkitdirectory = true;
        // Some browsers still look for this attribute.
        input.setAttribute("directory", "");
      } else {
        // Allow selecting multiple files at once.
        input.multiple = true;
      }

      // Listen for selection completion.
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          onSelected(files);
        }
        // Remove the temporary node to avoid leaks.
        document.body.removeChild(input);
      };

      // Trigger the native file picker.
      document.body.appendChild(input);
      input.click();
    },
    [],
  );

  return { upload };
};
