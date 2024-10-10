"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "~/providers/authStoreProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const navItems = [
  { href: "/", label: "Home", auth: false },
  { href: "/features", label: "Features", auth: false },
  { href: "/pricing", label: "Pricing", auth: false },
  { href: "/docs", label: "Docs", auth: false },
  { href: "/dashboard", label: "Dashboard", auth: true },
];

const isItemVisible = (
  item: (typeof navItems)[number],
  isAuthenticated: boolean
) => {
  if (!item.auth) return true;
  return isAuthenticated;
};

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.session?.user);
  const login = useAuthStore((state) => state.login);

  return (
    <nav className="border-b bg-background/50 backdrop-blur-lg fixed top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/">Oliver</Link>
          <div className="space-x-4 hidden md:flex">
            {navItems
              .filter((item) => isItemVisible(item, !!user))
              .map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  isActive={pathname === item.href}
                >
                  {item.label}
                </NavItem>
              ))}
            {user ? (
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <Button onClick={() => login(pathname)}>Sign in</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
};
function NavItem({ href, children, isActive }: NavItemProps) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className={isActive ? "bg-accent/80" : "bg-accent/20"}
      >
        {children}
      </Button>
    </Link>
  );
}
