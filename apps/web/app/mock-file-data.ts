import type { FileNode } from "@nextdj/file-explorer";

export interface StorageItem {
  id: string;
  name: string;
}

export type StorageResponseData = StorageItem[];

export type DemoFileRecord = FileNode & {
  storageId: string;
};

export interface DemoDatabase {
  storages: StorageResponseData;
  files: DemoFileRecord[];
}

export const DEMO_DB_KEY = "file-explorer-demo-db-v1";

export const DEMO_TOTAL_BYTES = 512 * 1024 * 1024;

export const createSeedDatabase = (): DemoDatabase => ({
  storages: [
    { id: "1", name: "Design Drive" },
    { id: "2", name: "Marketing Vault" },
    { id: "3", name: "Local Demo Space" },
  ],
  files: [
    {
      id: "folder_brand",
      storageId: "1",
      name: "Brand Assets",
      type: "folder",
      parentId: undefined,
      updatedAt: "2026-04-16T09:30:00.000Z",
      isHidden: false,
      tagColors: ["blue"],
    },
    {
      id: "folder_social",
      storageId: "1",
      name: "Social Media",
      type: "folder",
      parentId: undefined,
      updatedAt: "2026-04-15T08:10:00.000Z",
      isHidden: false,
      tagColors: ["green"],
    },
    {
      id: "folder_campaign",
      storageId: "1",
      name: "Spring Campaign",
      type: "folder",
      parentId: "folder_social",
      updatedAt: "2026-04-14T11:45:00.000Z",
      isHidden: false,
      tagColors: ["yellow"],
    },
    {
      id: "file_logo_png",
      storageId: "1",
      name: "logo-system.png",
      type: "file",
      parentId: "folder_brand",
      size: 2_458_122,
      extension: "png",
      updatedAt: "2026-04-12T09:15:00.000Z",
      isHidden: false,
      mediaType: "image",
      mimeType: "image/png",
      tagColors: ["blue"],
    },
    {
      id: "file_brand_pdf",
      storageId: "1",
      name: "brand-guidelines.pdf",
      type: "file",
      parentId: "folder_brand",
      size: 18_880_512,
      extension: "pdf",
      updatedAt: "2026-04-12T10:20:00.000Z",
      isHidden: false,
      mediaType: "file",
      mimeType: "application/pdf",
      tagColors: ["red"],
    },
    {
      id: "file_launch_mp4",
      storageId: "1",
      name: "launch-teaser.mp4",
      type: "file",
      parentId: "folder_campaign",
      size: 146_773_114,
      extension: "mp4",
      updatedAt: "2026-04-13T18:10:00.000Z",
      isHidden: false,
      mediaType: "video",
      mimeType: "video/mp4",
      tagColors: ["green"],
    },
    {
      id: "file_voice_m4a",
      storageId: "1",
      name: "voice-over-draft.m4a",
      type: "file",
      parentId: "folder_campaign",
      size: 12_510_294,
      extension: "m4a",
      updatedAt: "2026-04-13T18:40:00.000Z",
      isHidden: false,
      mediaType: "audio",
      mimeType: "audio/mp4",
      tagColors: ["gray"],
    },
    {
      id: "file_posts_csv",
      storageId: "1",
      name: "social-calendar.csv",
      type: "file",
      parentId: "folder_social",
      size: 45_120,
      extension: "csv",
      updatedAt: "2026-04-11T14:05:00.000Z",
      isHidden: false,
      mediaType: "file",
      mimeType: "text/csv",
      tagColors: ["yellow"],
    },
    {
      id: "folder_sales",
      storageId: "2",
      name: "Sales Collateral",
      type: "folder",
      parentId: undefined,
      updatedAt: "2026-04-10T08:00:00.000Z",
      isHidden: false,
      tagColors: ["red"],
    },
    {
      id: "file_pitch_pptx",
      storageId: "2",
      name: "enterprise-pitch.pptx",
      type: "file",
      parentId: "folder_sales",
      size: 25_428_000,
      extension: "pptx",
      updatedAt: "2026-04-10T09:00:00.000Z",
      isHidden: false,
      mediaType: "file",
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      tagColors: ["yellow"],
    },
    {
      id: "file_pricing_xlsx",
      storageId: "2",
      name: "pricing-model.xlsx",
      type: "file",
      parentId: "folder_sales",
      size: 1_202_111,
      extension: "xlsx",
      updatedAt: "2026-04-10T10:30:00.000Z",
      isHidden: false,
      mediaType: "file",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      tagColors: ["green"],
    },
    {
      id: "folder_team",
      storageId: "3",
      name: "Team Notes",
      type: "folder",
      parentId: undefined,
      updatedAt: "2026-04-09T07:30:00.000Z",
      isHidden: false,
      tagColors: ["gray"],
    },
    {
      id: "file_notes_md",
      storageId: "3",
      name: "retro-notes.md",
      type: "file",
      parentId: "folder_team",
      size: 9_240,
      extension: "md",
      updatedAt: "2026-04-09T07:45:00.000Z",
      isHidden: false,
      mediaType: "file",
      mimeType: "text/markdown",
      tagColors: ["blue"],
    },
  ],
});
