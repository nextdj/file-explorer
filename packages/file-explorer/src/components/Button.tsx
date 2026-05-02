"use client";

import React, { forwardRef } from "react";
import { Trash2, LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Tooltip } from "./Tooltip";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isDelete?: boolean;
  noHover?: boolean;
  tip?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon: Icon,
      variant = "primary",
      size = "md",
      isDelete,
      noHover,
      tip,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-(--_fe-primary-bg) text-(--_fe-primary-text) hover:bg-(--_fe-primary-hover)",
      secondary:
        "border border-(--_fe-border) bg-(--_fe-bg) text-(--_fe-text) hover:bg-(--_fe-hover)",
      danger:
        "border border-(--_fe-danger) text-(--_fe-danger) hover:bg-(--_fe-danger-soft)",
      ghost: " hover:bg-(--_fe-hover) hover:text-(--_fe-text)",
    };

    const noHoverVariants = {
      primary: "bg-(--_fe-primary-bg) text-(--_fe-primary-text)",
      secondary: "border border-(--_fe-border) bg-(--_fe-bg) text-(--_fe-text)",
      danger: "border border-(--_fe-danger) text-(--_fe-danger)",
      ghost: " ",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-[length:var(--_fe-font-xs)] gap-1.5",
      md: "h-9 px-4 text-[length:var(--_fe-font-sm)] gap-2",
      lg: "h-11 px-6 text-[length:var(--_fe-font-base)] gap-2.5",
    };

    const iconSizes = { sm: 14, md: 18, lg: 20 };

    const finalVariant = isDelete ? "danger" : variant;
    const FinalIcon = isDelete ? Trash2 : Icon;
    const hasChildren = React.Children.count(children) > 0;
    const buttonElement = (
      <button
        ref={ref}
        type={props.type ?? "button"}
        aria-label={props["aria-label"] ?? tip}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-lg leading-none whitespace-nowrap transition-colors",
          "focus:outline-none focus:ring-0 focus-visible:outline-none",
          "disabled:pointer-events-none  disabled:opacity-30 active:opacity-80",
          sizes[size],
          noHover ? noHoverVariants[finalVariant] : variants[finalVariant],
          !hasChildren && "aspect-square px-0",
          className,
        )}
        {...props}
      >
        {FinalIcon && <FinalIcon size={iconSizes[size]} className="shrink-0" />}
        {hasChildren && <span className="contents">{children}</span>}
      </button>
    );

    if (!tip) return buttonElement;

    return (
      <Tooltip content={tip}>
        <span className="inline-flex shrink-0">{buttonElement}</span>
      </Tooltip>
    );
  },
);

Button.displayName = "Button";
