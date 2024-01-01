"use client";
//imports
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2, Plus } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

/**
 * UploadDropzone component for handling file uploads.
 * Provides a drag-and-drop interface for file upload and visual feedback.
 */
const UploadDropzone = () => {
  const router = useRouter();

  // State hooks to manage file upload status and progress
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { startUpload } = useUploadThing("fileUploader");

  // Mutation hook from trpc to handle file upload polling
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      // Redirecting to the dashboard with the new file ID upon upload success
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  // Function to simulate upload progress
  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval); 
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };
  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsFileUploading(true);
        const progressInterval = startSimulatedProgress();

        const res = await startUpload(acceptedFile);
        if (!res) {
          toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
          return;
        }

        const [fileResponse] = res;
        const key = fileResponse?.key;
        if (!key) {
          toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
          return;
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Initiating file status polling
        startPolling({ key });
        toast({
          title: "Success",
          description: "File uploaded successfully",
          variant: "default",
        });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">Upload documents up to 32MB</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isFileUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

/**
 * UploadButton component that triggers a dialog containing the UploadDropzone.
 * Allows users to initiate the file upload process.
 */
const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className=" h-5" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
