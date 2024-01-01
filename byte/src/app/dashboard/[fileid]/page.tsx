import React from "react";
import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import CsvRenderer from "@/components/CsvRenderer";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import DynamicContentRenderer from "@/components/DynamicContentRenderer";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params;
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();

  const isPdf = file.name.endsWith(".pdf");
  const isCsv = file.name.endsWith(".csv");

  console.log("file", file);

  return (
    <MaxWidthWrapper>
      <div className="flex-1 justify-between flex flex-col max-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          <div className="flex-1 xl:flex ">
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
              {isPdf && <PdfRenderer url={file.url} />}
              {isCsv && <CsvRenderer url={file.url} />}
            </div>
          </div>
          <div className="shrink-0 flex-[1.5] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
            <DynamicContentRenderer url={file.url} fileId={file.id}/>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default Page;
