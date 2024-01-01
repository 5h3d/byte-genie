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

const AccountSettings = ({ email, imageUrl, name }: Props) => {
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

  const renderAvatarFallback = () => (
    <AvatarFallback>
      <User className="h-4 w-4 text-zinc-900" />
    </AvatarFallback>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full h-8 w-8 bg-slate-400">
          <Avatar className="relative w-8 h-8">
            {imageUrl ? renderAvatarImage() : renderAvatarFallback()}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-0.5">
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
          <Link href="/dashboard">
           Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSettings;
