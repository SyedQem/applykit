"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: Route;
  label: string;
};

function isActivePath(pathname: string, href: Route) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition duration-200",
        "hover:bg-slate-200/70 hover:text-slate-900",
        active && "bg-slate-900 text-white shadow-sm"
      )}
    >
      {label}
    </Link>
  );
}
