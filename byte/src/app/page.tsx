// Imports
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col justify-center items-center text-center text-dark">
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-[5vw]">
          Engage with documents like never
          before.
        </h1>
        <p className="mt-5 max-w-prose text-dark/75 sm:text-lg">
          Our platform offers an array of cutting-edge features designed to make
          your document interactions intuitive and insightful.
        </p>

        <Link
          className={buttonVariants({
            size: "lg",
            className: "mt-5 w-48 hover:bg-primary-800",
          })}
          href="/dashboard"
          target="_blank"
        >
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>
    </>
  );
}
