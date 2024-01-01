"use client";
// imports
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNavBar = ({ isUserAuth }: { isUserAuth: boolean }) => {
  const [isNavOpen, setNavOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close nav when route changes
    if (isNavOpen) setNavOpen(false);
  }, [pathname]);

  const handleLinkClick = (href: string) => {
    if (pathname === href && isNavOpen) {
      setNavOpen(false);
    }
  };

  const NavItem = ({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon?: boolean;
  }) => (
    <li onClick={() => handleLinkClick(href)}>
      <Link
        href={href}
        className={`flex items-center w-full font-semibold ${
          icon ? "text-green-600" : ""
        }`}
      >
        {label}
        {icon && <ArrowRight className="ml-2 h-5 w-5" />}
      </Link>
    </li>
  );

  const Divider = () => <li className="my-3 h-px w-full bg-gray-300" />;

  return (
    <div className="sm:hidden">
      <Menu
        onClick={() => setNavOpen(!isNavOpen)}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {isNavOpen && (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {isUserAuth ? (
              <>
                <NavItem href="/dashboard" label="Dashboard" />
                <Divider />
                <NavItem href="/sign-out" label="Sign out" />
              </>
            ) : (
              <>
                <NavItem href="/sign-up" label="Get started" icon />
                <Divider />
                <NavItem href="/sign-in" label="Sign in" />
                <Divider />
                <NavItem href="/pricing" label="Pricing" />
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobileNavBar;
