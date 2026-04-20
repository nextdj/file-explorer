"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import React from "react";
import { cn } from "../lib";

interface TooltipProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip = ({
  children,
  trigger,
  content,
  side = "bottom",
  className,
}: TooltipProps) => {
  const anchor = children ?? trigger;
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!triggerRef.current) return;
    setPortalContainer(
      triggerRef.current.closest(".fe-theme") as HTMLElement | null,
    );
  }, []);

  if (!anchor) return null;

  return (
    <RadixTooltip.Provider delayDuration={250}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <span
            ref={triggerRef}
            className={cn("inline-flex shrink-0", className)}
          >
            {anchor}
          </span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal container={portalContainer ?? undefined}>
          <RadixTooltip.Content
            side={side}
            sideOffset={8}
            collisionPadding={8}
            className="z-9999 max-w-48 rounded-md bg-(--_fe-tooltip-bg) px-2 py-1 text-[11px] leading-none whitespace-nowrap text-(--_fe-tooltip-text) shadow-lg"
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
