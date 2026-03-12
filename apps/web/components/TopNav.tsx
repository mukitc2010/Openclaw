"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function TopNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/projects/new", label: "New Project" },
  ];

  return (
    <nav className="top-nav" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`top-nav-link ${isActive(pathname, item.href) ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {pathname.startsWith("/projects/") && pathname !== "/projects/new" && (
        <span className="top-nav-current">Active Project</span>
      )}
    </nav>
  );
}
