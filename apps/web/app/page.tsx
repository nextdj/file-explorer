import { headers } from "next/headers";
import { getSeededStorages } from "./file-service";
import { FileList } from "./FileList";
import type { FileExplorerLocale } from "@nextdj/file-explorer";

interface PageProps {
  searchParams?: {
    parentId?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const requestHeaders = headers();
  const initialStorages = getSeededStorages();

  return (
    <div className="px-6">
      <FileList initialData={null} initialStorages={initialStorages} />
    </div>
  );
}
