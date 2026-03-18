"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Columns3,
  Users,
  FileText,
  Calendar,
  Image,
  MessageSquare,
  Wallet,
  UtensilsCrossed,
  Package,
  Gift,
  Heart,
  Vote,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Kanban", icon: Columns3 },
  { href: "/wall", label: "Üzenőfal", icon: MessageSquare },
  { href: "/expenses", label: "Kiadások", icon: Wallet },
  { href: "/meal-plan", label: "Étlap", icon: UtensilsCrossed },
  { href: "/polls", label: "Szavazás", icon: Vote },
  { href: "/anniversaries", label: "Dátumok", icon: Gift },
  { href: "/health", label: "Egészség", icon: Heart },
  { href: "/inventory", label: "Leltár", icon: Package },
  { href: "/calendar", label: "Naptár", icon: Calendar },
  { href: "/notes", label: "Jegyzetek", icon: FileText },
  { href: "/gallery", label: "Galéria", icon: Image },
  { href: "/persons", label: "Személyek", icon: Users },
];

export function AppNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/boards");
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2 gap-2">
        <nav className="flex items-center gap-0.5 flex-wrap">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}>
              <Icon className="h-4 w-4" />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
