import { useMemo, useState } from "react";
import {
  CategoryColor,
  FileNode,
  FileSortDirection,
  FileSortField,
  FileViewMode,
} from "../types";
import { performSort } from "../lib";
import { FILE_CATEGORY_COLORS } from "../constants/colors";
import { getFileCategoryLabel } from "../lib/file-utils";

interface ExplorerStateOptions {
  defaultViewMode?: FileViewMode;
  viewMode?: FileViewMode;
  onViewModeChange?: (mode: FileViewMode) => void;
  defaultSortField?: FileSortField;
  defaultSortDirection?: FileSortDirection;
  sortField?: FileSortField;
  sortDirection?: FileSortDirection;
  onSortChange?: (field: FileSortField, direction: FileSortDirection) => void;
  sortAccessors?: Record<
    string,
    (file: FileNode) => string | number | Date | null | undefined
  >;
}

export function useExplorerState(
  files: FileNode[],
  locale?: string,
  options: ExplorerStateOptions = {},
) {
  const {
    defaultViewMode = "grid",
    viewMode,
    onViewModeChange,
    defaultSortField = "name",
    defaultSortDirection = "asc",
    sortField,
    sortDirection,
    onSortChange,
    sortAccessors = {},
  } = options;
  const [internalViewMode, setInternalViewMode] =
    useState<FileViewMode>(defaultViewMode);
  const [internalSortField, setInternalSortField] =
    useState<FileSortField>(defaultSortField);
  const [internalSortDirection, setInternalSortDirection] =
    useState<FileSortDirection>(defaultSortDirection);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedColors, setSelectedColors] = useState<CategoryColor[]>(
    Object.keys(FILE_CATEGORY_COLORS) as CategoryColor[],
  );

  const resolvedViewMode = viewMode ?? internalViewMode;
  const resolvedSortField = sortField ?? internalSortField;
  const resolvedSortDirection = sortDirection ?? internalSortDirection;

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
    if (resolvedSortField === "type") {
      return [...finalFilteredFiles].sort((a, b) => {
        const labelA = getFileCategoryLabel(a, locale);
        const labelB = getFileCategoryLabel(b, locale);
        const result = labelA.localeCompare(labelB, locale, {
          numeric: true,
          sensitivity: "accent",
        });

        return resolvedSortDirection === "asc" ? result : -result;
      });
    }

    const sortAccessor = sortAccessors[String(resolvedSortField)];
    const sortByField = (items: FileNode[]) => {
      if (sortAccessor) {
        return [...items].sort((a, b) => {
          const valueA = sortAccessor(a);
          const valueB = sortAccessor(b);

          if (valueA === valueB) return 0;
          if (valueA === null || valueA === undefined) return 1;
          if (valueB === null || valueB === undefined) return -1;

          if (typeof valueA === "string" && typeof valueB === "string") {
            const result = valueA.localeCompare(valueB, locale, {
              numeric: true,
              sensitivity: "accent",
            });

            return resolvedSortDirection === "asc" ? result : -result;
          }

          const normalizedA =
            valueA instanceof Date ? valueA.getTime() : valueA;
          const normalizedB =
            valueB instanceof Date ? valueB.getTime() : valueB;
          const result = normalizedA > normalizedB ? 1 : -1;

          return resolvedSortDirection === "asc" ? result : -result;
        });
      }

      return performSort(
        items,
        resolvedSortField as keyof FileNode,
        resolvedSortDirection,
      );
    };

    const folders = sortByField(
      finalFilteredFiles.filter((file) => file.type === "folder"),
    );
    const files = sortByField(
      finalFilteredFiles.filter((file) => file.type !== "folder"),
    );

    return [...folders, ...files];
  }, [
    finalFilteredFiles,
    locale,
    resolvedSortDirection,
    resolvedSortField,
    sortAccessors,
  ]);

  const applyViewMode = (nextViewMode: FileViewMode) => {
    if (viewMode === undefined) {
      setInternalViewMode(nextViewMode);
    }
    onViewModeChange?.(nextViewMode);
  };

  const applySort = (
    nextSortField: FileSortField,
    nextSortDirection: FileSortDirection,
  ) => {
    if (sortField === undefined) {
      setInternalSortField(nextSortField);
    }
    if (sortDirection === undefined) {
      setInternalSortDirection(nextSortDirection);
    }
    onSortChange?.(nextSortField, nextSortDirection);
  };

  const setSortField = (nextSortField: FileSortField) => {
    applySort(nextSortField, resolvedSortDirection);
  };

  const setSortDirection = (nextSortDirection: FileSortDirection) => {
    applySort(resolvedSortField, nextSortDirection);
  };

  return {
    files: sortedFiles,
    view: {
      mode: resolvedViewMode,
      setMode: applyViewMode,
    },
    sort: {
      field: resolvedSortField,
      direction: resolvedSortDirection,
      setField: setSortField,
      setDirection: setSortDirection,
      set: applySort,
    },
    filter: {
      showHidden,
      colors: selectedColors,
      setShowHidden,
      setColors: setSelectedColors,
    },
  };
}
