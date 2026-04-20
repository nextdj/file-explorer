"use client";

import React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface ToggleButtonItem<T extends string> {
  value: T;
  label?: React.ReactNode;
  icon?: LucideIcon;
}

interface ToggleButtonProps<T extends string> {
  readonly items: readonly ToggleButtonItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  className?: string;
  itemClassName?: string;
  showSeparator?: boolean;
  variant?: "tabs" | "segmented";
}

export const ToggleButton = <T extends string>({
  items,
  value,
  defaultValue,
  onChange,
  className,
  itemClassName,
  variant = "tabs",
  showSeparator = true,
}: ToggleButtonProps<T>) => {
  const isTabs = variant === "tabs";

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      defaultValue={defaultValue}
      onValueChange={(val) => val && onChange?.(val as T)}
      className={cn(
        "relative inline-flex h-9 items-stretch transition-all",
        isTabs
          ? "border-(--_fe-border) bg-(--_fe-bg) rounded-full border"
          : "border-(--_fe-border) border-b bg-transparent",
        className, // External overrides still win here, including shape changes.
      )}
    >
      {items.map((item, index) => {
        const isSelected = value === item.value;

        return (
          <React.Fragment key={item.value}>
            <ToggleGroup.Item
              value={item.value}
              className={cn(
                "text-(--_fe-text-muted) relative flex flex-1 items-center justify-center px-0 text-sm transition-all outline-none",
                "data-[state=on]:text-(--_fe-selected)",
                "rounded-full hover:text-(--_fe-selected)",
                itemClassName,
              )}
            >
              {isTabs && isSelected && (
                <div
                  className={cn(
                    "bg-(--_fe-active) absolute z-0 transition-colors",
                    "inset-0",
                    "rounded-full",
                    itemClassName,
                  )}
                />
              )}
              <div className="relative z-10 flex items-center gap-1.5">
                {item.icon && <item.icon size={16} strokeWidth={2} />}
                {item.label && (
                  <div className="font-medium whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>

              {!isTabs && isSelected && (
                <div className="bg-(--_fe-selected) absolute right-0 bottom-0 left-0 h-1 rounded-t-full transition-colors" />
              )}
            </ToggleGroup.Item>

            {showSeparator && isTabs && index < items.length - 1 && (
              <div className="bg-(--_fe-border) h-4 w-px self-center transition-opacity" />
            )}
          </React.Fragment>
        );
      })}
    </ToggleGroup.Root>
  );
};
