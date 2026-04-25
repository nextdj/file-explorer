"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

const ACTION_MENU_OPEN_EVENT = "fe:action-menu-open";

export interface ActionMenuConfig {
  label?: React.ReactNode;
  action?: string;
  icon?: any;
  className?: string;
  disabled?: boolean;
  separator?: boolean;
  isHeader?: boolean;
  checked?: boolean;
  isDelete?: boolean;
  render?: (helpers: { closeMenu: () => void }) => React.ReactNode;
  onSelect?: () => void | Promise<void>;
}

interface ActionMenuProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  onAction: (action: string) => void;
  items: ActionMenuConfig[];
  title?: string;
  align?: "start" | "center" | "end";
  mode?: "left-click" | "right-click";
}

export const ActionMenu = ({
  children,
  trigger,
  onAction,
  items,
  title,
  align = "start",
}: ActionMenuProps) => {
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);
  const triggerNode = trigger ?? children;

  React.useEffect(() => {
    if (!triggerRef.current) return;
    setPortalContainer(
      triggerRef.current.closest(".fe-theme") as HTMLElement | null,
    );
  }, []);

  React.useEffect(() => {
    const handleOtherMenuOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      if (detail?.id !== menuId) {
        setOpen(false);
      }
    };

    window.addEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
    return () => {
      window.removeEventListener(ACTION_MENU_OPEN_EVENT, handleOtherMenuOpen);
    };
  }, [menuId]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      window.dispatchEvent(
        new CustomEvent(ACTION_MENU_OPEN_EVENT, { detail: { id: menuId } }),
      );
    }
    setOpen(nextOpen);
  };

  const hasRenderableContent = (item: ActionMenuConfig) =>
    Boolean(item.render || item.isHeader || item.label || item.icon || item.action);

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <span
          ref={triggerRef}
          className="inline-flex cursor-pointer pointer-events-auto"
        >
          {triggerNode}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal container={portalContainer ?? undefined}>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          collisionPadding={16}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "z-9999 min-w-55 overflow-hidden rounded-xl border border-(--_fe-glass-border) p-1.25 text-(--_fe-text)",
            "shadow-(--_fe-shadow-soft)",
            "bg-(--_fe-bg)",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          {title && (
            <div className="mb-0.5 border-b border-(--_fe-border) px-3 py-1.5 select-none">
              <span className="text-(--_fe-text-sub) text-[10px] font-semibold leading-none tracking-[0.14em] uppercase">
                {title}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-px">
            {items.map((item, index) => {
              const showSeparator =
                item.separator &&
                items.slice(index + 1).some((nextItem) => hasRenderableContent(nextItem));

              return (
              <React.Fragment key={`${item.action}-${index}`}>
                {item.separator &&
                !item.render &&
                !item.isHeader &&
                !item.label &&
                !item.icon &&
                !item.action ? null : item.render ? (
                  <div
                    className={cn("px-0.5", item.className)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.render({ closeMenu: () => setOpen(false) })}
                  </div>
                ) : item.isHeader ? (
                  <div className="mt-0.5 px-3 py-0.5 select-none">
                    <span className="text-(--_fe-text-sub) text-[9px] font-semibold tracking-[0.12em] uppercase">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <DropdownMenu.Item
                    disabled={item.disabled}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (item.onSelect) {
                        void item.onSelect();
                        setOpen(false);
                        return;
                      }

                      if (item.action) {
                        onAction(item.action);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.75 text-[13px] outline-none",
                      item.isDelete
                        ? "text-red-500 focus:bg-red-500/10 focus:text-red-600 data-highlighted:bg-red-500/10 data-highlighted:text-red-600"
                        : "text-(--_fe-text-sub) hover:bg-(--_fe-hover) hover:text-(--_fe-text) focus:bg-(--_fe-hover) focus:text-(--_fe-text) data-highlighted:bg-(--_fe-hover)  data-highlighted:text-(--_fe-text)",
                      item.checked &&
                        "bg-(--_fe-active-soft) text-(--_fe-text)",
                      "data-disabled:pointer-events-none data-disabled:opacity-40",
                      item.className,
                    )}
                  >
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center">
                      {item.checked ? (
                        <Check
                          size={15}
                          strokeWidth={3}
                          className="text-(--_fe-text)"
                        />
                      ) : item.icon ? (
                        React.isValidElement(item.icon) ? (
                          item.icon
                        ) : (
                          (() => {
                            const Icon = item.icon;
                            return <Icon size={15} />;
                          })()
                        )
                      ) : null}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                  </DropdownMenu.Item>
                )}
                {showSeparator && (
                  <div className="bg-(--_fe-border) mx-2 my-0.75 h-px" />
                )}
              </React.Fragment>
            )})}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
