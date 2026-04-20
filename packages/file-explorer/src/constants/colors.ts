import type { CategoryColor, FileCategoryColor } from "../types";

export const FILE_CATEGORY_COLORS = {
  red: { hex: "#ef4444", label: "Red", bgClass: "bg-red-500" },
  blue: { hex: "#3b82f6", label: "Blue", bgClass: "bg-blue-500" },
  green: { hex: "#22c55e", label: "Green", bgClass: "bg-green-500" },
  yellow: { hex: "#eab308", label: "Yellow", bgClass: "bg-yellow-500" },
  gray: { hex: "#6b7280", label: "Gray", bgClass: "bg-gray-500" },
} satisfies Record<CategoryColor, FileCategoryColor>;
