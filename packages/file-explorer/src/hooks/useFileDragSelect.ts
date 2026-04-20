import { useRef } from "react";
import { useSelectionContainer } from "@air/react-drag-to-select";
import { useKeyPress, useLatest } from "ahooks";
import { FileNode } from "../types";

export function useFileDragSelect(
  items: any[],
  selected: any[],
  setSelected: (items: any[]) => void,
  containerEl: HTMLElement | null,
) {
  const isDraggingRef = useRef(false);
  const dragStartSelectedRef = useRef<FileNode[]>([]);
  const selectedRef = useLatest(selected);
  const shiftPressed = useRef(false);

  useKeyPress(
    "shift",
    (e) => {
      shiftPressed.current = e.type === "keydown";
    },
    { events: ["keydown", "keyup"] },
  );

  const config = useSelectionContainer({
    eventsElement: containerEl,
    onSelectionStart: () => {
      isDraggingRef.current = true;
      dragStartSelectedRef.current = selectedRef.current || [];
    },
    onSelectionChange: (box) => {
      const elements =
        document.querySelectorAll<HTMLElement>(".file-selectable");
      const boxIds: string[] = [];

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isHit = !(
          box.left + box.width < rect.left ||
          box.left > rect.right ||
          box.top + box.height < rect.top ||
          box.top > rect.bottom
        );
        if (isHit && el.dataset.id) boxIds.push(el.dataset.id);
      });

      if (shiftPressed.current) {
        const baseSet = new Set(dragStartSelectedRef.current.map((f) => f.id));
        boxIds.forEach((id) =>
          baseSet.has(id) ? baseSet.delete(id) : baseSet.add(id),
        );
        setSelected(items.filter((f) => baseSet.has(f.id)));
      } else {
        setSelected(items.filter((f) => boxIds.includes(f.id)));
      }
    },
    onSelectionEnd: () =>
      setTimeout(() => {
        isDraggingRef.current = false;
      }),
    selectionProps: {
      style: {
        border: "1px solid var(--_fe-selected)",
        backgroundColor:
          "color-mix(in srgb, var(--_fe-selected) 22%, transparent)",
        borderRadius: "2px",
        zIndex: 9999,
        pointerEvents: "none",
      },
    },
  });

  return { ...config, isDraggingRef };
}
