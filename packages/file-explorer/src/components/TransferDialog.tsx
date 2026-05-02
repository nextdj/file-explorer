"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Folder,
  FolderInput,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "./Button";
import { InlineNameInput } from "./InlineNameInput";
import {
  FileExplorerData,
  FileNode,
  TransferDataSource,
  TransferTarget,
} from "../types";
import { cn } from "../lib";
import type { LucideIcon } from "lucide-react";
import { useFileExplorerContext } from "../context";

interface TransferDialogProps {
  open: boolean;
  mode: "copy" | "move" | null;
  items: FileNode[];
  targets?: TransferTarget[];
  sources?: TransferDataSource[];
  loadFolder?: (
    source: TransferDataSource,
    target: TransferTarget,
  ) => Promise<FileExplorerData>;
  selectedTarget?: TransferTarget;
  onCreate?: (entry: {
    name: string;
    type: FileNode["type"];
    parentId?: string;
    source?: TransferDataSource;
  }) =>
    | {
        id: string;
        name: string;
        type: FileNode["type"];
        parentId?: string;
      }
    | void
    | Promise<{
        id: string;
        name: string;
        type: FileNode["type"];
        parentId?: string;
      } | void>;
  onSelectTarget: (target?: TransferTarget) => void;
  onClose: () => void;
  onConfirm: () => void;
}

interface LoadedFolderState {
  loaded: boolean;
  loading: boolean;
  items: TransferTarget[];
  error?: string;
}

const EMPTY_FOLDER_STATE: LoadedFolderState = {
  loaded: false,
  loading: false,
  items: [],
};

const mapFolders = (
  parent: TransferTarget,
  data: FileExplorerData,
): TransferTarget[] =>
  data.files
    .filter((file) => file.type === "folder")
    .map((file) => ({
      id: file.id,
      folderId: file.id,
      parentId: parent.id,
      name: file.name,
    }));

const getNodeKey = (target: TransferTarget) => target.folderId ?? target.id;

function renderTransferIcon(
  icon: TransferTarget["icon"] | TransferDataSource["icon"],
  className?: string,
) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon !== "function") return <>{icon}</>;

  const Icon = icon as LucideIcon;
  return <Icon size={18} className={className} />;
}

function TransferTreeNode({
  node,
  level,
  selectedTarget,
  expandedIds,
  loadedFolders,
  createParentKey,
  createName,
  createSelectKey,
  creatingFolder,
  onCreateNameChange,
  onCreateSubmit,
  onCreateCancel,
  onSelectTarget,
  onToggleFolder,
}: {
  node: TransferTarget;
  level: number;
  selectedTarget?: TransferTarget;
  expandedIds: Set<string>;
  loadedFolders: Record<string, LoadedFolderState>;
  createParentKey?: string;
  createName: string;
  createSelectKey: number;
  creatingFolder: boolean;
  onCreateNameChange: (name: string) => void;
  onCreateSubmit: () => void;
  onCreateCancel: () => void;
  onSelectTarget: (target?: TransferTarget) => void;
  onToggleFolder: (target: TransferTarget) => void;
}) {
  const nodeKey = getNodeKey(node);
  const state = loadedFolders[nodeKey] ?? EMPTY_FOLDER_STATE;
  const isExpanded = expandedIds.has(nodeKey);
  const isSelected = selectedTarget?.id === node.id;
  const showCreateInput = createParentKey === nodeKey;
  const customIcon = renderTransferIcon(
    node.icon,
    isExpanded ? "text-amber-500" : "text-(--_fe-text-sub)",
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelectTarget(node);
          onToggleFolder(node);
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors",
          isSelected
            ? "bg-(--_fe-hover) text-(--_fe-selected)"
            : "text-(--_fe-text) hover:bg-(--_fe-hover)",
        )}
        style={{ paddingLeft: `${16 + level * 28}px` }}
      >
        <span className="relative h-5 w-5 shrink-0">
          {customIcon ? (
            customIcon
          ) : (
            <>
              <Folder
                size={20}
                className={cn(
                  "absolute inset-0",
                  isExpanded ? "hidden" : "text-amber-400",
                )}
              />
              <FolderOpen
                size={20}
                className={cn(
                  "absolute inset-0",
                  isExpanded ? "text-amber-500" : "hidden",
                )}
              />
            </>
          )}
        </span>
        <span className="truncate text-[length:var(--_fe-font-sm)]">
          {node.name}
        </span>
        {state.loading ? (
          <Loader2
            size={14}
            className="ml-auto shrink-0 animate-spin text-(--_fe-text-sub)"
          />
        ) : null}
      </button>

      {state.error && isExpanded ? (
        <div
          className="px-4 py-2 text-[length:var(--_fe-font-sm)] text-(--_fe-text-muted)"
          style={{ paddingLeft: `${56 + level * 28}px` }}
        >
          {state.error}
        </div>
      ) : null}

      {showCreateInput ? (
        <div style={{ paddingLeft: `${16 + (level + 1) * 28}px` }}>
          <div className="mb-1 flex items-center gap-3 rounded-2xl px-4 py-2.5">
            <FolderOpen size={20} className="shrink-0 text-amber-500" />
            <InlineNameInput
              value={createName}
              onChange={onCreateNameChange}
              onSubmit={onCreateSubmit}
              onCancel={onCreateCancel}
              busy={creatingFolder}
              selectKey={createSelectKey}
              className="max-w-sm"
            />
            {creatingFolder ? (
              <Loader2
                size={14}
                className="shrink-0 animate-spin text-(--_fe-text-sub)"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isExpanded &&
        state.items.map((child) => (
          <TransferTreeNode
            key={child.id}
            node={child}
            level={level + 1}
            selectedTarget={selectedTarget}
            expandedIds={expandedIds}
            loadedFolders={loadedFolders}
            createParentKey={createParentKey}
            createName={createName}
            createSelectKey={createSelectKey}
            creatingFolder={creatingFolder}
            onCreateNameChange={onCreateNameChange}
            onCreateSubmit={onCreateSubmit}
            onCreateCancel={onCreateCancel}
            onSelectTarget={onSelectTarget}
            onToggleFolder={onToggleFolder}
          />
        ))}
    </div>
  );
}

export function TransferDialog({
  open,
  mode,
  items,
  targets = [],
  sources,
  loadFolder,
  selectedTarget,
  onCreate,
  onSelectTarget,
  onClose,
  onConfirm,
}: TransferDialogProps) {
  const { t } = useFileExplorerContext();
  const normalizedSources = useMemo<TransferDataSource[]>(
    () =>
      sources && sources.length > 0
        ? sources
        : [{ id: "all", name: t("transfer.allLocations"), list: targets }],
    [sources, t, targets],
  );

  const [activeSourceId, setActiveSourceId] = useState(
    normalizedSources[0]?.id ?? "",
  );
  const [sourceLists, setSourceLists] = useState<
    Record<string, TransferTarget[]>
  >({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadedFolders, setLoadedFolders] = useState<
    Record<string, LoadedFolderState>
  >({});
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [createSelectKey, setCreateSelectKey] = useState(0);

  useEffect(() => {
    setSourceLists(
      Object.fromEntries(
        normalizedSources.map((source) => [source.id, source.list]),
      ) as Record<string, TransferTarget[]>,
    );
  }, [normalizedSources]);

  useEffect(() => {
    if (!open) {
      setExpandedIds(new Set());
      setLoadedFolders({});
      setCreateName("");
      setCreating(false);
      setCreatingFolder(false);
      setCreateSelectKey(0);
      return;
    }

    setActiveSourceId((prev) =>
      normalizedSources.some((source) => source.id === prev)
        ? prev
        : (normalizedSources[0]?.id ?? ""),
    );
  }, [open, normalizedSources]);

  const activeSource =
    normalizedSources.find((source) => source.id === activeSourceId) ??
    normalizedSources[0];
  const implicitRootTarget =
    activeSource?.list.length === 1 ? activeSource.list[0] : undefined;
  const rootItems = sourceLists[activeSource?.id] ?? [];
  const createParentKey =
    creating && selectedTarget ? getNodeKey(selectedTarget) : undefined;
  const showRootCreateInput = creating && !selectedTarget;
  const ActionIcon = mode === "copy" ? Copy : FolderInput;
  const title =
    items.length === 1
      ? t(
          mode === "copy"
            ? "transfer.copyTitleSingle"
            : "transfer.moveTitleSingle",
          { name: items[0]?.name ?? t("transfer.content") },
        )
      : t(
          mode === "copy"
            ? "transfer.copyTitleMulti"
            : "transfer.moveTitleMulti",
          { count: items.length },
        );
  const canCreateFolder = Boolean(onCreate) && Boolean(activeSource);

  const ensureLoaded = async (
    source: TransferDataSource,
    target: TransferTarget,
  ) => {
    if (!loadFolder) return;

    const nodeKey = getNodeKey(target);
    const current = loadedFolders[nodeKey];
    if (current?.loaded || current?.loading) return;

    setLoadedFolders((prev) => ({
      ...prev,
      [nodeKey]: { ...(prev[nodeKey] ?? EMPTY_FOLDER_STATE), loading: true },
    }));

    try {
      const data = await loadFolder(source, target);
      setLoadedFolders((prev) => ({
        ...prev,
        [nodeKey]: {
          loaded: true,
          loading: false,
          items: mapFolders(target, data),
        },
      }));
    } catch (error) {
      setLoadedFolders((prev) => ({
        ...prev,
        [nodeKey]: {
          loaded: false,
          loading: false,
          items: [],
          error:
            error instanceof Error ? error.message : t("transfer.loadFailed"),
        },
      }));
    }
  };

  useEffect(() => {
    if (!open || !activeSource || !implicitRootTarget) return;

    const currentItems = sourceLists[activeSource.id];
    const alreadyHydrated =
      currentItems &&
      !(
        currentItems.length === 1 &&
        currentItems[0]?.id === implicitRootTarget.id
      );
    if (alreadyHydrated) return;

    void (async () => {
      if (!loadFolder) return;

      const data = await loadFolder(activeSource, implicitRootTarget);
      setSourceLists((prev) => ({
        ...prev,
        [activeSource.id]: mapFolders(implicitRootTarget, data),
      }));
    })();
  }, [open, activeSource, implicitRootTarget, loadFolder, sourceLists]);

  const handleToggleFolder = (target: TransferTarget) => {
    const nodeKey = getNodeKey(target);

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });

    void ensureLoaded(activeSource, target);
  };

  const handleSourceChange = (sourceId: string) => {
    setActiveSourceId(sourceId);
    setExpandedIds(new Set());
    setLoadedFolders({});
    setCreateName("");
    setCreating(false);
    setCreatingFolder(false);
    setCreateSelectKey(0);
    onSelectTarget(undefined);
  };

  const handleCreateFolder = async () => {
    if (!activeSource || !onCreate) return;

    const name = createName.trim();
    if (!name) {
      setCreating(false);
      setCreateName("");
      return;
    }

    setCreatingFolder(true);

    let newFolder: TransferTarget | undefined;
    const parentTarget = selectedTarget ?? implicitRootTarget;
    const parentId =
      parentTarget?.folderId ??
      (parentTarget && parentTarget.id !== activeSource.id
        ? parentTarget.id
        : undefined);
    try {
      const created = await onCreate({
        name,
        type: "folder",
        parentId,
        source: activeSource,
      });
      if (created?.id) {
        newFolder = {
          id: created.id,
          folderId: created.id,
          parentId: created.parentId,
          name: created.name,
        };
      }
    } catch (error) {
      setCreateSelectKey((prev) => prev + 1);
      return;
    } finally {
      setCreatingFolder(false);
    }

    if (!newFolder?.id) {
      return;
    }

    if (selectedTarget ?? implicitRootTarget) {
      const parent = selectedTarget ?? implicitRootTarget!;
      const nodeKey = getNodeKey(parent);
      setLoadedFolders((prev) => ({
        ...prev,
        [nodeKey]: {
          ...(prev[nodeKey] ?? EMPTY_FOLDER_STATE),
          loaded: true,
          loading: false,
          items: [
            newFolder,
            ...((prev[nodeKey]?.items ?? []) as TransferTarget[]),
          ],
        },
      }));
      setExpandedIds((prev) => new Set(prev).add(nodeKey));
      if (!selectedTarget && implicitRootTarget) {
        setSourceLists((prev) => ({
          ...prev,
          [activeSource.id]: [newFolder, ...(prev[activeSource.id] ?? [])],
        }));
      }
    } else {
      setSourceLists((prev) => ({
        ...prev,
        [activeSource.id]: [newFolder, ...(prev[activeSource.id] ?? [])],
      }));
    }

    setCreateName("");
    setCreating(false);
    onSelectTarget(newFolder);
  };

  if (!open || !mode || !activeSource) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-(--_fe-border) bg-(--_fe-bg) shadow-2xl">
        <div className="flex items-start justify-between px-8 pt-7">
          <div className="min-w-0">
            <h3 className="max-w-155 truncate text-[length:var(--_fe-font-xl)] leading-tight font-medium text-(--_fe-selected)">
              {title}
            </h3>
          </div>

          <Button
            icon={X}
            variant="ghost"
            tip={t("action.close")}
            onClick={onClose}
          />
        </div>

        <div className="mt-5 border-b border-(--_fe-border-soft) px-8">
          <div className="flex items-end gap-8">
            {normalizedSources.map((source) => {
              const isActive = source.id === activeSourceId;
              const sourceIcon = renderTransferIcon(
                source.icon,
                isActive ? "text-(--_fe-selected)" : "text-(--_fe-text-sub)",
              );

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => handleSourceChange(source.id)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2 pb-3 text-[length:var(--_fe-font-base)] transition-colors",
                    isActive
                      ? "text-(--_fe-selected)"
                      : "text-(--_fe-text-sub) hover:text-(--_fe-text)",
                  )}
                >
                  {sourceIcon}
                  <span>{source.name}</span>
                  <span
                    className={cn(
                      "absolute right-0 bottom-0 left-0 h-1 rounded-full bg-(--_fe-text) transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col px-8  pb-0">
          <div className="h-85 overflow-y-auto  ">
            <div className="py-4">
              {creating ? (
                showRootCreateInput ? (
                  <div className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-2.5">
                    <FolderOpen size={20} className="shrink-0 text-amber-500" />
                    <InlineNameInput
                      value={createName}
                      onChange={setCreateName}
                      onSubmit={() => void handleCreateFolder()}
                      onCancel={() => {
                        if (creatingFolder) return;
                        setCreating(false);
                        setCreateName("");
                        setCreateSelectKey(0);
                      }}
                      busy={creatingFolder}
                      selectKey={createSelectKey}
                      className="max-w-sm"
                    />
                    {creatingFolder ? (
                      <Loader2
                        size={14}
                        className="shrink-0 animate-spin text-(--_fe-text-sub)"
                      />
                    ) : null}
                  </div>
                ) : null
              ) : null}

              {rootItems.length > 0 ? (
                rootItems.map((target) => (
                  <TransferTreeNode
                    key={target.id}
                    node={target}
                    level={0}
                    selectedTarget={selectedTarget}
                    expandedIds={expandedIds}
                    loadedFolders={loadedFolders}
                    createParentKey={createParentKey}
                    createName={createName}
                    createSelectKey={createSelectKey}
                    creatingFolder={creatingFolder}
                    onCreateNameChange={setCreateName}
                    onCreateSubmit={() => void handleCreateFolder()}
                    onCreateCancel={() => {
                      if (creatingFolder) return;
                      setCreating(false);
                      setCreateName("");
                    }}
                    onSelectTarget={onSelectTarget}
                    onToggleFolder={handleToggleFolder}
                  />
                ))
              ) : (
                <div className="px-4 py-8 text-[length:var(--_fe-font-sm)] text-(--_fe-text-muted)">
                  {t("transfer.empty")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-(--_fe-border-soft) px-8 py-5">
          <Button
            icon={FolderPlus}
            variant="secondary"
            disabled={!canCreateFolder}
            onClick={() => {
              setCreateName(t("transfer.newFolderDefault"));
              setCreating(true);
              setCreateSelectKey(0);
            }}
          >
            {t("action.createFolder")}
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              {t("action.cancel")}
            </Button>
            <Button
              icon={ActionIcon}
              variant="primary"
              disabled={!selectedTarget || creatingFolder}
              onClick={onConfirm}
            >
              {mode === "copy" ? t("transfer.copy") : t("transfer.move")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
