"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",   href: "/admin",              icon: LayoutDashboard },
  { label: "Products",    href: "/admin/products",      icon: Package },
  { label: "Add Product", href: "/admin/products/new",  icon: PlusCircle },
  { label: "Orders",      href: "/admin/orders",        icon: ShoppingBag },
  { label: "Messages",    href: "/admin/messages",      icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        className="fixed top-4 left-4 z-[60] md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#1C1917] border border-white/10 text-white/70 hover:text-white transition-all"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[45] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 z-[50] w-64 min-h-screen bg-[#1C1917] border-r border-white/5 flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <span className="text-white font-black text-sm">SH</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Shelbaya</p>
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 space-y-1 border-t border-white/5">
        <Link
          href="/home"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}


