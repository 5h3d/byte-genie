"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { useToast } from "./ui/use-toast";
import FileList from "./FileList";

const Dashboard = () => {
  const { toast } = useToast();
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);

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
  });

  const handleDelete = (id: string) => {
    deleteFile({ id });
  };

  return (
    <MaxWidthWrapper>
      <main className="mx-auto max-w-7xl md:p-10">
        <div className="mt-8 flex flex-col items-start justify-between gap-4 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">Files</h1>
          <UploadButton />
        </div>

        <FileList
          files={files || []}
          isLoading={isLoading}
          onDelete={handleDelete}
          currentlyDeletingFile={currentlyDeletingFile}
        />
      </main>
    </MaxWidthWrapper>
  );
};

export default Dashboard;
