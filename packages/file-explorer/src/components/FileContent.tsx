"use client";

import { BreadcrumbItem, FileNode } from "../types";
import { useFileScene } from "../hooks";
import { bytesFormat, cn } from "../lib/utils";
import { FileListView } from "./FileListView";
import { FileGridView } from "./FileGridView";
import { ViewToolbar } from "./ViewToolbar";
import { useFileExplorerContext } from "../context";
import { ActionMenu } from "./ActionMenu";
import { Button } from "./Button";
import { ScrollArea } from "./ScrollArea";
import { Check, ChevronDown, ChevronLeft, FolderOpen } from "lucide-react";
import { PrimaryToolbar } from "./PrimaryToolbar";
import { TransferDialog } from "./TransferDialog";

interface FileContentProps {
  files: FileNode[];
  breadcrumbs?: BreadcrumbItem[];
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-14">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="bg-(--_fe-item-bg-soft) text-(--_fe-text-muted) mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
          <FolderOpen size={28} strokeWidth={1.8} />
        </div>
        <h3 className="text-(--_fe-selected) text-[length:var(--_fe-font-base)] font-semibold">
          {title}
        </h3>
        <p className="text-(--_fe-text-muted) mt-2 text-[length:var(--_fe-font-sm)] leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}

function Breadcrumbs({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
}) {
  if (items.length === 0) return null;

  const current = items.at(-1)!;
  const isRoot = items.length <= 1;
  const parent = items.at(-2);

  const menuItems = [...items].reverse().map((item) => {
    const isCurrent = item.id === current.id;

    return {
      action: item.id,
      icon: (
        <ChevronLeft
          size={14}
          className={cn(
            "rotate-180",
            isCurrent ? "text-(--_fe-text)" : "text-(--_fe-text-muted)",
          )}
        />
      ),
      label: (
        <div className="flex w-full items-center justify-between gap-8">
          <span className={cn(isCurrent && "text-(--_fe-text) font-bold")}>
            {item.name}
          </span>
          {isCurrent && (
            <Check size={16} className="text-(--_fe-text) shrink-0" />
          )}
        </div>
      ),
    };
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        icon={ChevronLeft}
        variant="secondary"
        size="sm"
        className={cn(
          "  hover:bg-(--_fe-hover-soft) flex size-6 items-center justify-center rounded-full border-(--_fe-text-muted)/50",
          isRoot &&
            "bg-(--_fe-active-subtle) text-(--_fe-text-muted) hover:bg-(--_fe-active-subtle)",
        )}
        disabled={isRoot}
        onClick={() => parent && onNavigate?.(parent)}
      />

      <ActionMenu
        mode="left-click"
        items={menuItems}
        onAction={(id) => {
          const item = items.find((crumb) => crumb.id === id);
          if (item) onNavigate?.(item);
        }}
        trigger={
          <Button
            variant="ghost"
            // Inline the header breadcrumb control here because it is only used
            // by FileContent and does not need its own component file.
            className={cn("h-8 px-0 py-0", isRoot && "pointer-events-none")}
          >
            <div className="flex h-8 flex-nowrap items-center gap-3 px-2">
              <span className="text-(--_fe-text) text-[length:var(--_fe-font-lg)] leading-none font-bold">
                {current.name}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-(--_fe-text-muted) shrink-0 transition-transform group-data-[state=open]:rotate-180",
                  isRoot && "opacity-0",
                )}
              />
            </div>
          </Button>
        }
      />
    </div>
  );
}

export default function FileContent({
  files,
  breadcrumbs = [],
}: FileContentProps) {
  // Use the backend breadcrumb tail as the source of truth for the active folder.
  const currentFolderId = breadcrumbs.at(-1)?.id ?? "";
  const {
    explorer,
    selection,
    actions,
    listProps,
    finalDisplayFiles,
    DragSelection,
    isDraggingRef,
    scrollRef,
  } = useFileScene(files, currentFolderId);
  const {
    t,
    onNavigateBreadcrumb,
    toolbarStyle,
    storageInfo,
    showBreadcrumbs,
    showToolbar,
    features,
    viewControls,
    transferTargets = [],
    dataSource,
    loadDataSourceFolder,
    onCreate,
  } = useFileExplorerContext();
  const selectedCount = selection.selected.length;

  const headerMeta =
    selectedCount > 0
      ? t("status.selectedCount", { count: selectedCount })
      : storageInfo &&
          (storageInfo.totalBytes !== undefined ||
            storageInfo.availableBytes !== undefined)
        ? [
            storageInfo.totalBytes !== undefined
              ? t("status.totalCapacity", {
                  value: bytesFormat(storageInfo.totalBytes),
                })
              : null,
            storageInfo.availableBytes !== undefined
              ? t("status.availableCapacity", {
                  value: bytesFormat(storageInfo.availableBytes),
                })
              : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : "";

  const hasBreadcrumbs = showBreadcrumbs && breadcrumbs.length > 0;
  const hasDisplayMenu =
    viewControls.showDisplayButton &&
    (viewControls.showSortOptions ||
      viewControls.showSortDirectionOptions ||
      viewControls.showHiddenFileOptions ||
      (features.tagFilter && viewControls.showTagFilterOption));
  const hasRightControls = hasDisplayMenu || viewControls.showViewToggleButton;
  const hasHeaderControls = hasBreadcrumbs || showToolbar || hasRightControls;
  const showHeaderMeta = hasHeaderControls && Boolean(headerMeta);
  const showHeader = hasHeaderControls || showHeaderMeta;

  const headerShellClass = cn(
    "pointer-events-none absolute top-0 left-0 z-30",
    toolbarStyle === "floating" ? "right-6 pt-4" : "right-0",
  );

  const headerBarClass = cn(
    "relative   pt-3 pb-3",
    toolbarStyle === "floating" && "rounded-3xl shadow-(--_fe-shadow-floating)",
    toolbarStyle === "transparent" && "",
  );

  const headerSurfaceClass = cn(
    "pointer-events-none absolute inset-0",
    toolbarStyle === "floating" &&
      "overflow-hidden rounded-3xl border border-(--_fe-glass-border) bg-(--_fe-glass-bg) backdrop-blur-md",
    toolbarStyle === "transparent" &&
      "border-b border-(--_fe-glass-border) bg-(--_fe-glass-bg-strong) backdrop-blur-md",
  );

  const scrollViewportClass = cn(
    showHeader && (toolbarStyle === "default" ? "pt-0" : "pt-32"),
    showHeader && toolbarStyle === "floating" && "pt-36",
  );

  const scrollAreaClass = cn(
    showHeader &&
      toolbarStyle === "default" &&
      (showHeaderMeta ? "mt-25" : "mt-25"),
  );

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      onClick={(e) => {
        const isMenu = (e.target as HTMLElement).closest(
          "[data-radix-menu-content]",
        );
        if (!isDraggingRef.current && !isMenu) selection.unSelectAll();
      }}
    >
      <DragSelection />
      {showHeader ? (
        <div className={headerShellClass}>
          <div className={headerBarClass}>
            <div className={headerSurfaceClass} />
            {/* Keep the header inline so the layout is readable in one file. */}
            <div
              className={cn(
                "pointer-events-auto relative flex flex-col",
                showHeaderMeta && "gap-3",
              )}
            >
              {hasHeaderControls ? (
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
                  <div className="min-w-0">
                    {hasBreadcrumbs ? (
                      <Breadcrumbs
                        items={breadcrumbs}
                        onNavigate={onNavigateBreadcrumb}
                      />
                    ) : null}
                  </div>

                  <div className="flex justify-center">
                    {showToolbar ? (
                      <PrimaryToolbar
                        onAction={actions.dispatch}
                        selected={selection.selected}
                      />
                    ) : null}
                  </div>

                  <div className="flex min-w-0 justify-end">
                    {hasRightControls ? (
                      <div className="flex items-center justify-center">
                        <ViewToolbar
                          explorer={explorer}
                          selection={selection}
                          onBatchAction={actions.dispatch}
                          onAction={actions.dispatch}
                          showCreateAction={false}
                          showSelectionActions={false}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {showHeaderMeta ? (
                <div className="text-(--_fe-text-muted) text-[length:var(--_fe-font-sm)]">
                  {headerMeta}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ScrollArea
        ref={scrollRef}
        className={scrollAreaClass}
        viewportClassName={scrollViewportClass}
      >
        <div>
          {finalDisplayFiles.length > 0 ? (
            explorer.view.mode === "grid" ? (
              <FileGridView items={finalDisplayFiles} {...listProps} />
            ) : (
              <FileListView items={finalDisplayFiles} {...listProps} />
            )
          ) : (
            <EmptyState
              title={t("empty.title")}
              description={t("empty.description")}
            />
          )}
        </div>
      </ScrollArea>

      <TransferDialog
        open={actions.transferState.open}
        mode={actions.transferState.mode}
        items={actions.transferState.items}
        targets={transferTargets}
        sources={dataSource}
        loadFolder={loadDataSourceFolder}
        selectedTarget={actions.transferState.target}
        onCreate={onCreate}
        onSelectTarget={actions.setTransferTarget}
        onClose={actions.closeTransfer}
        onConfirm={actions.confirmTransfer}
      />
    </div>
  );
}
