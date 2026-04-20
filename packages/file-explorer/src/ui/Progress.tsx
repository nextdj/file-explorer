import { cn } from "../lib/utils";

interface ProgressProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}
// Lightweight progress indicator helper.
export const Progress = ({
  value,
  className,
  showLabel = true,
}: ProgressProps) => {
  return (
    <div className="flex w-full items-center py-2">
      <div className="bg-(--_fe-item-bg) relative h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-in-out",
            "bg-(--_fe-selected)",
            className,
          )}
          style={{ width: `${value}%` }}
        />
      </div>

      {showLabel && (
        <span className={cn("min-w-11 text-right font-mono text-xs")}>
          {value}%
        </span>
      )}
    </div>
  );
};
