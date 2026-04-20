import { FILE_CATEGORY_COLORS } from "../constants/colors";
import type { CategoryColor } from "../types";
import { cn } from "../lib/utils";

interface ColorTagsProps {
  colors: CategoryColor[];
  size?: number; // diameter of each dot in px
  className?: string;
}

export const ColorTags = ({ colors, size = 10, className }: ColorTagsProps) => {
  if (colors.length === 0) return null;

  // Deduplicate, resolve config, and cap at 3 dots
  const uniqueColors = Array.from(new Set(colors))
    .map((color) => ({ name: color, config: FILE_CATEGORY_COLORS[color] }))
    .slice(0, 3);

  const count = uniqueColors.length;
  // Each dot overlaps the previous by half its diameter
  const overlapAmount = size / 2.5;
  // Total width shrinks as dots stack; single dot needs no extra space
  const containerWidth =
    count === 1 ? size : size + (count - 1) * overlapAmount;

  return (
    <div
      className={cn("relative flex h-full items-center", className)}
      style={{ width: `${containerWidth}px`, height: `${size}px` }}
    >
      {uniqueColors.map((item, index) => (
        <div
          key={item.name}
          className={cn(
            "absolute rounded-full transition-transform",
            item.config.bgClass,
            // Subtle ring + shadow to separate overlapping dots
            "ring-[1px] ring-(--_fe-glass-border) [box-shadow:0_1px_2px_color-mix(in_srgb,var(--_fe-selected)_15%,transparent)]",
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${index * overlapAmount}px`,
            zIndex: index + 1, // Later dots render on top
          }}
        />
      ))}
    </div>
  );
};
