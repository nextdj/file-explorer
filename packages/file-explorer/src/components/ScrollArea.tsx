"use client";

import React, { forwardRef } from "react";
import { cn } from "../lib";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, viewportClassName, children, ...props }, ref) => {
    return (
      <div className={cn("min-h-0 flex-1 overflow-hidden", className)}>
        <div
          ref={ref}
          className={cn("h-full w-full overflow-y-auto", viewportClassName)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
