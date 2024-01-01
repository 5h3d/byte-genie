"use client";
// imports
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";

// Set the workerSrc for PDF.js to load the PDF worker script.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}

/**
 * Renders a PDF document and provides controls for navigation, zoom, and rotation.
 * @param {PdfRendererProps} props - The properties for the component.
 */
const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  // State hooks for managing PDF view settings and properties.
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const isLoading = renderedScale !== scale;

  // Form validation schema for navigating to a specific page.
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!, {
        message: "Invalid page number",
      }),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  // React Hook Form setup for controlled form elements.
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  // Detects the container's width for responsive rendering of PDF pages.
  const { width, ref } = useResizeDetector();

  // Handles submission of the page number form.
  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  // Changes the current page, ensuring it stays within valid boundaries.
  const changePage = (offset: number) => {
    setCurrPage((prev) => {
      const newPage = Math.max(1, Math.min(numPages || 1, prev + offset));
      setValue("page", String(newPage));
      return newPage;
    });
  };

  // Predefined zoom levels for the PDF.
  const zoomLevels = [1, 1.5, 2, 2.5];
  const zoomDropdownItems = zoomLevels.map((level) => (
    <DropdownMenuItem key={level} onSelect={() => setScale(level)}>
      {level * 100}%
    </DropdownMenuItem>
  ));

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center ">
      {/* Header section with navigation and zoom controls */}
      <div className="h-14 w-full border-b border-zinc-200  flex items-center justify-between px-2">
        {/* PDF Navigation Controls */}
        <div className="flex items-center gap-1">
          {/* Previous Page Button */}
          <Button
            disabled={currPage <= 1}
            onClick={() => changePage(-1)}
            variant="ghost"
            aria-label="Previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Page Number Input */}
          <form
            onSubmit={handleSubmit(handlePageSubmit)}
            className="flex items-center gap-1"
          >
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </form>

          {/* Next Page Button */}
          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => changePage(1)}
            variant="ghost"
            aria-label="Next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom and Rotate Controls */}
        <div className="flex">
          <div className="hidden lg:flex space-x-2">
            {/* Zoom Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5" aria-label="Zoom" variant="ghost">
                  <Search className="h-4 w-4" />
                  {scale * 100}%
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>{zoomDropdownItems}</DropdownMenuContent>
            </DropdownMenu>

            {/* Rotate Button */}
            <Button
              onClick={() => setRotation((prev) => prev + 90)}
              variant="ghost"
              aria-label="Rotate 90 degrees"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Fullscreen Toggle Button */}
          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      {/* PDF Document Viewer */}
      <div className="w-full h-[calc(100vh-10rem)] hidden lg:block">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center h-full w-full items-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
              {/* Conditional rendering of Pages based on the loading state */}
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
