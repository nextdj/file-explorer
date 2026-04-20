import type {
  CategoryColor,
  FileExplorerData,
  FileNode,
} from "@nextdj/file-explorer";
import {
  createSeedDatabase,
  DEMO_DB_KEY,
  DEMO_TOTAL_BYTES,
  type DemoDatabase,
  type DemoFileRecord,
  type StorageResponseData,
  type StorageItem,
} from "./mock-file-data";

export type { StorageItem, StorageResponseData } from "./mock-file-data";

export interface FileResponseData extends FileExplorerData {}

type FileQueryType = "recent" | "trash" | "tag";

export interface CreateFolderPayload {
  storageId?: string;
  parentId?: string;
  name: string;
}

export interface CreateFolderResponseData {
  id: string;
  name: string;
  parentId?: string;
}

export interface RenameEntryPayload {
  id: string;
  name: string;
}

export interface DeleteEntriesPayload {
  ids: string[];
}

export interface TransferEntriesPayload {
  entryIds: string[];
  destinationId: string;
  destinationFolderId?: string;
}

export interface UploadedEntryPayload {
  name: string;
  size?: number;
  relativePath?: string;
  targetFolderId?: string;
}

export interface UpdateTagColorsPayload {
  id: string;
  colors: CategoryColor[];
}

interface GetFilesOptions {
  parentId?: string;
  type?: FileQueryType;
}

interface DemoStorageInfo {
  totalBytes?: number;
  availableBytes?: number;
}

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const inferMimeType = (extension: string) => {
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    json: "application/json",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return map[extension] ?? "application/octet-stream";
};

const inferMediaType = (extension: string): FileNode["mediaType"] => {
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension)) {
    return "image";
  }

  if (["mp4", "mov", "webm"].includes(extension)) {
    return "video";
  }

  if (["mp3", "m4a", "wav"].includes(extension)) {
    return "audio";
  }

  return "file";
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";


const readDatabase = (): DemoDatabase => {
  const fallback = createSeedDatabase();
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(DEMO_DB_KEY);
    if (!raw) {
      window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(fallback));
      return fallback;
    }

    const parsed = JSON.parse(raw) as DemoDatabase | null;
    if (!parsed?.storages || !parsed?.files) {
      window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(fallback));
      return fallback;
    }

    return parsed;
  } catch {
    window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeDatabase = (db: DemoDatabase) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
};

const getStorage = (db: DemoDatabase, storageId: string) =>
  db.storages.find((item) => item.id === storageId);

const getFolderRecord = (db: DemoDatabase, folderId?: string) =>
  folderId ? db.files.find((file) => file.id === folderId) : undefined;

const buildBreadcrumbs = (
  db: DemoDatabase,
  storageId: string,
  parentId?: string,
) => {
  const storage = getStorage(db, storageId);
  const root = {
    id: storageId,
    name: storage?.name ?? "Demo Storage",
  };

  if (!parentId) return [root];

  const chain: Array<{ id: string; name: string }> = [];
  let current = getFolderRecord(db, parentId);

  while (current) {
    chain.unshift({ id: current.id, name: current.name });
    current = current.parentId ? getFolderRecord(db, current.parentId) : undefined;
  }

  return [root, ...chain];
};

const listFiles = (
  db: DemoDatabase,
  storageId: string,
  parentId?: string,
) =>
  db.files
    .filter(
      (file) =>
        file.storageId === storageId &&
        (parentId === undefined
          ? file.parentId === undefined || file.parentId === storageId
          : (file.parentId ?? undefined) === parentId),
    )
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    })
    .map((file) => clone<FileNode>(file));

const buildFileResponse = (
  db: DemoDatabase,
  storageId: string,
  options: GetFilesOptions = {},
): FileResponseData => ({
  breadcrumbs: buildBreadcrumbs(db, storageId, options.parentId),
  files: listFiles(db, storageId, options.parentId),
});

const collectDescendantIds = (db: DemoDatabase, rootIds: string[]) => {
  const collected = new Set(rootIds);
  let changed = true;

  while (changed) {
    changed = false;
    db.files.forEach((file) => {
      if (file.parentId && collected.has(file.parentId) && !collected.has(file.id)) {
        collected.add(file.id);
        changed = true;
      }
    });
  }

  return collected;
};

const resolveTargetStorageAndParent = (
  db: DemoDatabase,
  targetFolderId?: string,
) => {
  if (!targetFolderId) {
    return {
      storageId: STORAGE_FALLBACK_ID,
      parentId: undefined as string | undefined,
    };
  }

  const storage = getStorage(db, targetFolderId);
  if (storage) {
    return {
      storageId: storage.id,
      parentId: undefined as string | undefined,
    };
  }

  const folder = getFolderRecord(db, targetFolderId);
  if (!folder) {
    return {
      storageId: STORAGE_FALLBACK_ID,
      parentId: undefined as string | undefined,
    };
  }

  return {
    storageId: folder.storageId,
    parentId: folder.id,
  };
};

const ensureFolderPath = (
  db: DemoDatabase,
  storageId: string,
  folderNames: string[],
  parentId?: string,
) => {
  let currentParentId = parentId;

  folderNames.forEach((folderName) => {
    const existing = db.files.find(
      (file) =>
        file.type === "folder" &&
        file.storageId === storageId &&
        file.parentId === currentParentId &&
        file.name === folderName,
    );

    if (existing) {
      currentParentId = existing.id;
      return;
    }

    const nextFolder: DemoFileRecord = {
      id: createId("folder"),
      storageId,
      parentId: currentParentId,
      name: folderName,
      type: "folder",
      updatedAt: new Date().toISOString(),
      isHidden: false,
    };

    db.files.unshift(nextFolder);
    currentParentId = nextFolder.id;
  });

  return currentParentId;
};

const STORAGE_FALLBACK_ID = "1";

const resolveDestination = (db: DemoDatabase, payload: TransferEntriesPayload) => {
  const storage = getStorage(db, payload.destinationId);
  if (storage) {
    return { storageId: storage.id, parentId: undefined as string | undefined };
  }

  const folderId = payload.destinationFolderId ?? payload.destinationId;
  const folder = getFolderRecord(db, folderId);
  if (!folder) {
    throw new Error("Destination folder could not be found in the demo dataset.");
  }

  return {
    storageId: folder.storageId,
    parentId: folder.id,
  };
};

const duplicateEntryTree = (
  db: DemoDatabase,
  entryId: string,
  targetStorageId: string,
  targetParentId?: string,
) => {
  const source = db.files.find((file) => file.id === entryId);
  if (!source) return;

  const nextId = createId(source.type === "folder" ? "folder" : "file");
  db.files.push({
    ...clone(source),
    id: nextId,
    storageId: targetStorageId,
    parentId: targetParentId,
    updatedAt: new Date().toISOString(),
    name: source.type === "folder" ? `${source.name} copy` : source.name,
  });

  const children = db.files.filter((file) => file.parentId === source.id);
  children.forEach((child) => {
    duplicateEntryTree(db, child.id, targetStorageId, nextId);
  });
};

export function getSeededStorages(): StorageResponseData {
  return clone(createSeedDatabase().storages);
}

export function getSeededFilesByPath(
  storageId: string,
  options: GetFilesOptions = {},
): FileResponseData {
  return buildFileResponse(createSeedDatabase(), storageId, options);
}

export async function getFilesByPath(
  storageId: string,
  options: GetFilesOptions = {},
): Promise<FileResponseData> {
  return buildFileResponse(readDatabase(), storageId, options);
}

export async function getStorages(): Promise<StorageResponseData> {
  return clone(readDatabase().storages);
}

export async function createFolderApi(
  payload: CreateFolderPayload,
): Promise<CreateFolderResponseData> {
  const { storageId, parentId, name } = payload;
  if (!storageId) {
    throw new Error("storageId is required");
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Folder name is required");
  }

  const db = readDatabase();
  const normalizedParentId =
    parentId === undefined || parentId === storageId ? undefined : parentId;
  const newFolder: DemoFileRecord = {
    id: createId("folder"),
    storageId,
    parentId: normalizedParentId,
    name: trimmedName,
    type: "folder",
    updatedAt: new Date().toISOString(),
    isHidden: false,
  };

  db.files.unshift(newFolder);
  writeDatabase(db);

  return {
    id: newFolder.id,
    name: newFolder.name,
    parentId: newFolder.parentId,
  };
}

export async function renameEntryApi(payload: RenameEntryPayload): Promise<void> {
  const trimmedName = payload.name.trim();
  if (!trimmedName) {
    throw new Error("Name is required");
  }

  const db = readDatabase();
  const entry = db.files.find((file) => file.id === payload.id);
  if (!entry) {
    throw new Error("Entry could not be found in the demo dataset.");
  }

  entry.name = trimmedName;
  entry.updatedAt = new Date().toISOString();
  writeDatabase(db);
}

export async function updateTagColorsApi(
  payload: UpdateTagColorsPayload,
): Promise<void> {
  const db = readDatabase();
  const entry = db.files.find((file) => file.id === payload.id);

  if (!entry) {
    throw new Error("Entry could not be found in the demo dataset.");
  }

  entry.tagColors = payload.colors;
  entry.updatedAt = new Date().toISOString();
  writeDatabase(db);
}

export async function deleteEntriesApi(payload: DeleteEntriesPayload): Promise<void> {
  const db = readDatabase();
  const idsToDelete = collectDescendantIds(db, payload.ids);
  db.files = db.files.filter((file) => !idsToDelete.has(file.id));
  writeDatabase(db);
}

export async function moveEntriesApi(payload: TransferEntriesPayload): Promise<void> {
  const db = readDatabase();
  const { storageId, parentId } = resolveDestination(db, payload);

  const descendantsByRoot = payload.entryIds.map((entryId) => ({
    entryId,
    descendants: collectDescendantIds(db, [entryId]),
  }));

  descendantsByRoot.forEach(({ entryId, descendants }) => {
    const target = db.files.find((file) => file.id === entryId);
    if (!target) return;

    target.parentId = parentId;
    target.storageId = storageId;
    target.updatedAt = new Date().toISOString();

    db.files.forEach((file) => {
      if (file.id !== entryId && descendants.has(file.id)) {
        file.storageId = storageId;
        file.updatedAt = new Date().toISOString();
      }
    });
  });

  writeDatabase(db);
}

export async function copyEntriesApi(payload: TransferEntriesPayload): Promise<void> {
  const db = readDatabase();
  const { storageId, parentId } = resolveDestination(db, payload);
  payload.entryIds.forEach((entryId) => {
    duplicateEntryTree(db, entryId, storageId, parentId);
  });
  writeDatabase(db);
}

export function getStorageInfo(storageId: string): DemoStorageInfo {
  const db = readDatabase();
  const usedBytes = db.files
    .filter((file) => file.storageId === storageId && file.type === "file")
    .reduce((total, file) => total + (file.size ?? 0), 0);

  return {
    totalBytes: DEMO_TOTAL_BYTES,
    availableBytes: Math.max(DEMO_TOTAL_BYTES - usedBytes, 0),
  };
}

export async function addUploadedEntriesApi(
  payloads: UploadedEntryPayload[],
): Promise<void> {
  const db = readDatabase();

  payloads.forEach((payload) => {
    const { storageId, parentId } = resolveTargetStorageAndParent(
      db,
      payload.targetFolderId,
    );
    const relativePath = payload.relativePath || payload.name;
    const segments = relativePath.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1] || payload.name;
    const folderPath = segments.slice(0, -1);
    const finalParentId = ensureFolderPath(db, storageId, folderPath, parentId);
    const extension = getExtension(fileName);

    const nextFile: DemoFileRecord = {
      id: createId("file"),
      storageId,
      parentId: finalParentId,
      name: fileName,
      type: "file",
      size: payload.size ?? 0,
      extension,
      updatedAt: new Date().toISOString(),
      isHidden: false,
      mediaType: inferMediaType(extension),
      mimeType: inferMimeType(extension),
    };

    db.files.unshift(nextFile);
  });

  writeDatabase(db);
}
