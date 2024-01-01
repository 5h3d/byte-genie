import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 *
 * @param inputs - An array of class values.
 * @returns A string of combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs an absolute URL from a given path.
 *
 * @param path - A string path to construct the URL from.
 * @returns An absolute URL as a string.
 */
export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

/**
 * Constructs metadata for a page.
 *
 * @param options - Options for constructing the metadata.
 * @returns Metadata object for a page.
 */
export function constructMetadata({
  title = "Byte - AI platform for document interactions",
  description = "Byte is software for making document interaction easy, faster, and reliable",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    icons,
    metadataBase: new URL("http://domain.com"),
    themeColor: "#FFF",
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
