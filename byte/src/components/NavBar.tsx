// imports
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import MobileNavBar from "./MobileNavBar";
import AccountSettings from "./AccountSettings";
import React, { useMemo } from "react";

const NavBar = () => {
  const { getUser } = getKindeServerSession();
  const user = useMemo(() => getUser(), [getUser]);

  const renderUnauthenticatedLinks = () => (
    <>
      <LoginLink className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Sign in
      </LoginLink>
      <RegisterLink className={buttonVariants({ size: "sm" })}>
        Get started <ArrowRight className="ml-1.5 h-5 w-5" />
      </RegisterLink>
    </>
  );

  const renderAuthenticatedLinks = () => (
    <>
      <Link
        href="/dashboard"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Dashboard
      </Link>
      <AccountSettings
        name={
          !user.given_name || !user.family_name
            ? "Your Account"
            : `${user.given_name} ${user.family_name}`
        }
        email={user.email ?? ""}
        imageUrl={user.picture ?? ""}
      />
    </>
  );

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-20 w-full border-b border-red-200 backdrop-blur-lg transition-all text-dark">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            Byte
          </Link>

          <MobileNavBar isUserAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex">
            {user ? renderAuthenticatedLinks() : renderUnauthenticatedLinks()}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
