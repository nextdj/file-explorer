import { useState, useEffect, useCallback, useRef } from "react";
import { useSelections } from "ahooks";

export function useFileSelector<T extends { id: string }>(
  items: T[],
  resetKey?: string,
  allowMultiSelect = true,
) {
  const selections = useSelections(items);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const selectionsRef = useRef(selections);

  selectionsRef.current = selections;

  // Handle Cmd/Ctrl + A selection.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        if (!allowMultiSelect) return;
        const isInput =
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement;
        if (!isInput) {
          e.preventDefault();
          selections.selectAll();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allowMultiSelect, selections]);

  useEffect(() => {
    selectionsRef.current.unSelectAll();
    setLastIndex(null);
  }, [resetKey]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, item: T, index: number) => {
      e.stopPropagation();
      if (!allowMultiSelect) {
        selections.unSelectAll();
        selections.select(item);
      } else if (e.shiftKey && lastIndex !== null) {
        const start = Math.min(lastIndex, index);
        const end = Math.max(lastIndex, index);
        items.slice(start, end + 1).forEach((i) => selections.select(i));
      } else if (e.metaKey || e.ctrlKey) {
        selections.toggle(item);
      } else {
        selections.unSelectAll();
        selections.select(item);
      }
      setLastIndex(index);
    },
    [allowMultiSelect, items, lastIndex, selections],
  );

  return { ...selections, handleItemClick };
}
