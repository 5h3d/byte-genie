import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { User } from "lucide-react";

interface Props {
  email: string | undefined;
  name: string;
  imageUrl: string;
}

// AccountSettings component: displays user account settings in a dropdown menu.
const AccountSettings = ({ email, imageUrl, name }: Props) => {
  // Renders the user's profile image if an image URL is provided.
  const renderAvatarImage = () => (
    <div className="relative aspect-square h-full w-full">
      <Image
        src={imageUrl}
        alt="Profile picture"
        layout="fill"
        objectFit="cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  // Renders a fallback avatar icon if no image URL is provided.
  const renderAvatarFallback = () => (
    <AvatarFallback>
      <User className="h-4 w-4 text-zinc-900" />
    </AvatarFallback>
  );

  return (
    <DropdownMenu>
      {/* Trigger for the dropdown menu using a button containing the user's avatar */}
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full h-8 w-8 bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {imageUrl ? renderAvatarImage() : renderAvatarFallback()}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content containing user information and actions */}
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-0.5">
            {/* Conditionally render name and email if they exist */}
            {name && <p className="font-medium text-sm">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Exporting the component for use in other parts of the application.
export default AccountSettings;
