import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Card = ({ children, className = "", title }: CardProps) => {
  return (
    <div
      className={cn(
        "border-(--_fe-border) rounded-lg border p-4",
        className,
      )}
    >
      {title && <h4 className="mb-3 text-[length:var(--_fe-font-lg)] font-semibold">{title}</h4>}
      {children}
    </div>
  );
};
