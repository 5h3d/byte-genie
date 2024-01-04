"use client";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { File, Ghost, Loader2, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

const FileList = () => {
  const { toast } = useToast();

  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const utils = trpc.useContext();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
      toast({
        title: "Success ✅",
        description: "File deleted successfully",
        variant: "default",
      });
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      setCurrentlyDeletingFile(null);
    },
    onError() {
      toast({
        title: "Error",
        description: "Error deleting files",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteFile({ id });
  };

  if (isLoading) {
    return <Skeleton height={100} className="my-2" count={1} />;
  }

  if (!files) {
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <Ghost className="h-8 w-8 text-zinc-800" />
        <p>Error</p>
      </div>
    );
  }
  if (files.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <Ghost className="h-8 w-8 text-zinc-800" />
        <p>Upload a File.</p>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
      {files
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((file) => (
          <li
            key={file.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
          >
            <Link
              href={`/dashboard/${file.id}`}
              className="flex flex-col gap-2 pt-6 px-6 w-full space-x-6"
            >
              <div className="flex-1 truncate">
                <h3 className="truncate text-lg font-medium text-zinc-900 flex gap-2 hover:text-primary">
                  <File />
                  {file.name}
                </h3>
              </div>
            </Link>

            <div className="px-6 mt-4 flex py-2 gap-6 text-xs text-zinc-500">
              <div className="flex items-center gap-2 w-full flex-[1]">
                Date Added: {format(new Date(file.createdAt), "MMM yyyy")}
              </div>
              <Button
                onClick={() => handleDelete(file.id)}
                size="sm"
                variant="destructive"
              >
                {currentlyDeletingFile === file.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default FileList;
