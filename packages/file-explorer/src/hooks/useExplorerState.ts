import { useMemo, useState } from "react";
import { CategoryColor, FileNode } from "../types";
import { performSort } from "../lib";
import { FILE_CATEGORY_COLORS } from "../constants/colors";
import { getFileCategoryLabel } from "../lib/file-utils";

export function useExplorerState(files: FileNode[], locale?: string) {
  const [viewMode, setViewMode] = useState("grid");
  const [sortField, setSortField] = useState<keyof FileNode>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showHidden, setShowHidden] = useState(false);
  const [selectedColors, setSelectedColors] = useState<CategoryColor[]>(
    Object.keys(FILE_CATEGORY_COLORS) as CategoryColor[],
  );

  // Apply the base hidden-file filter first.
  const baseFilteredFiles = useMemo(() => {
    if (showHidden) return files;
    return files.filter((f) => !f.isHidden);
  }, [files, showHidden]);

  const finalFilteredFiles = useMemo(() => {
    const allColorKeys = Object.keys(FILE_CATEGORY_COLORS);

    if (selectedColors.length === allColorKeys.length) return baseFilteredFiles;

    return baseFilteredFiles.filter((f) => {
      if (!f.tagColors || f.tagColors.length === 0) {
        return false;
      }

      return f.tagColors.some((color) => selectedColors.includes(color));
    });
  }, [baseFilteredFiles, selectedColors]);

  const sortedFiles = useMemo(() => {
    if (sortField === "type") {
      return [...finalFilteredFiles].sort((a, b) => {
        const labelA = getFileCategoryLabel(a, locale);
        const labelB = getFileCategoryLabel(b, locale);
        const result = labelA.localeCompare(labelB, locale, {
          numeric: true,
          sensitivity: "accent",
        });

        return sortDirection === "asc" ? result : -result;
      });
    }

    const sortByField = (items: FileNode[]) =>
      performSort(items, sortField, sortDirection);

    const folders = sortByField(
      finalFilteredFiles.filter((file) => file.type === "folder"),
    );
    const files = sortByField(
      finalFilteredFiles.filter((file) => file.type !== "folder"),
    );

    return [...folders, ...files];
  }, [finalFilteredFiles, locale, sortField, sortDirection]);

  return {
    files: sortedFiles,
    view: {
      mode: viewMode,
      setMode: setViewMode,
    },
    sort: {
      field: sortField,
      direction: sortDirection,
      setField: setSortField,
      setDirection: setSortDirection,
    },
    filter: {
      showHidden,
      colors: selectedColors,
      setShowHidden,
      setColors: setSelectedColors,
    },
  };
}
