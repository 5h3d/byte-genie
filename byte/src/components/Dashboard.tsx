import UploadButton from "./UploadButton";
import MaxWidthWrapper from "./MaxWidthWrapper";
import FileList from "./FileList";

const Dashboard = () => {
  return (
    <MaxWidthWrapper>
      <main className="mx-auto max-w-7xl md:p-10">
        <div className="mt-8 flex flex-col items-start justify-between gap-4 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">Files</h1>
          <UploadButton />
        </div>

        <FileList />
      </main>
    </MaxWidthWrapper>
  );
};

export default Dashboard;
