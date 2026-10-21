"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  Hospital,
  Shield,
  Activity,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Doctor, Patient, PaginatedResponse } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Doctors",
      href: "/doctors",
      icon: Stethoscope,
      active: pathname.startsWith("/doctors"),
    },
    {
      label: "Patients",
      href: "/patients",
      icon: Users,
      active: pathname.startsWith("/patients"),
    },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--canvas)] text-[var(--ink)]">
      {/* Desktop Sidebar (ink background) - Sticky viewport height so user/logout is always visible */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--ink)] text-slate-100 border-r border-slate-800 shrink-0 select-none sticky top-0 h-screen">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-semibold text-base leading-tight tracking-tight text-white">
              Doctor Tracker
            </div>
            <div className="text-[11px] text-slate-400 tracking-wide uppercase font-medium">
              Ward Console
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const handleMouseEnter = () => {
              if (item.href === "/doctors") {
                queryClient.prefetchQuery({
                  queryKey: [
                    "doctors",
                    {
                      page: 1,
                      limit: 20,
                      sort: "-createdAt",
                    },
                  ],
                  queryFn: () =>
                    apiClient<PaginatedResponse<Doctor>>("/api/v1/doctors?page=1&limit=20&sort=-createdAt"),
                  staleTime: 30_000,
                });
              } else if (item.href === "/patients") {
                queryClient.prefetchQuery({
                  queryKey: [
                    "patients",
                    {
                      page: 1,
                      limit: 20,
                      sort: "-createdAt",
                    },
                  ],
                  queryFn: () =>
                    apiClient<PaginatedResponse<Patient>>("/api/v1/patients?page=1&limit=20&sort=-createdAt"),
                  staleTime: 30_000,
                });
              }
            };

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={handleMouseEnter}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-[var(--teal-soft)]/15 text-teal-300 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
                aria-current={item.active ? "page" : undefined}
              >
                {item.active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-400 rounded-r-md" />
                )}
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-teal-400" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center text-xs font-semibold text-teal-300 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate">
                  {user?.name || "Ward Admin"}
                </div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-400 inline" />
                  {user?.role || "admin"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 h-8 w-8"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--line)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden h-9 w-9 border-[var(--line)]"
                  >
                    <Menu className="w-5 h-5 text-[var(--ink)]" />
                  </Button>
                }
              />
              <SheetContent
                side="left"
                className="w-64 bg-[var(--ink)] text-slate-100 p-0 border-r border-slate-800"
              >
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                  <Activity className="w-5 h-5 text-teal-400" />
                  <div className="font-heading font-semibold text-base text-white">
                    Doctor Tracker
                  </div>
                </div>
                <div className="py-6 px-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                          item.active
                            ? "bg-[var(--teal-soft)]/15 text-teal-300 font-semibold"
                            : "text-slate-300 hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-slate-800 mt-auto">
                  <Button
                    variant="destructive"
                    className="w-full text-xs"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 text-xs text-[var(--muted-text)] font-medium">
              <Hospital className="w-4 h-4 text-[var(--teal)]" />
              <span>Ward Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-[var(--ink)]">
              {user?.name || "Admin"}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar (< 768) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--surface)] border-t border-[var(--line)] flex items-center justify-around z-30 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors ${
                  item.active
                    ? "text-[var(--teal)] font-semibold"
                    : "text-[var(--muted-text)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
