// Imports
import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // Redirect to the authentication callback if the user is not authenticated or does not have an ID
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  // Redirect to the authentication callback if the user is not found in the database
  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  return <Dashboard />;
};

export default Page;
