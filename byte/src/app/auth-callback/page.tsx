"use client";

import { useRouter } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  // Initialize the Next.js router
  const router = useRouter();

  // Retrieve 'origin' query parameter from the URL
  const origin = router.origin;

  // Use the tRPC hook to handle the auth callback
  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      // On success, navigate to the origin page or the dashboard
      if (success) {
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    onError: (err) => {
      // Redirect to the sign-in page if unauthorized
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },
    retry: true, // Enable retry on failure
    retryDelay: 500,
  });

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
