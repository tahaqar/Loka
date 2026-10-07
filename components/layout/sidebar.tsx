"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCrm } from "@/components/providers/crm-provider";
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  KanbanSquare,
  Globe2,
  Building,
  Building2,
  FolderArchive,
  Stamp,
  CreditCard,
  Percent,
  CheckSquare,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  History,
  Settings as SettingsIcon,
  Trash2,
  GraduationCap,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: { displayName: string; name: string };
  } | null;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export function Sidebar({ user, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const {
    direction,
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    selectedBranchId,
    setSelectedBranchId,
    t,
  } = useCrm();

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    let ignore = false;
    async function fetchBranches() {
      try {
        const res = await fetch("/api/branches");
        if (res.ok && !ignore) {
          const data = await res.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchBranches();

    const handleUpdated = () => {
      fetch("/api/branches")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setBranches(data.branches || []);
        })
        .catch(console.error);
    };

    window.addEventListener("amalon:branches-updated", handleUpdated);
    return () => {
      ignore = true;
      window.removeEventListener("amalon:branches-updated", handleUpdated);
    };
  }, []);

  const navItems = [
    { href: "/", label: t("dashboard", "لوحة التحكم"), icon: LayoutDashboard },
    { href: "/students", label: t("students", "الطلاب"), icon: Users },
    { href: "/applications", label: t("applications", "القبولات والتقديمات"), icon: FileCheck2 },
    { href: "/kanban", label: t("kanban", "لوحة كانبان"), icon: KanbanSquare },
    { href: "/countries", label: t("countries", "الدول والوجهات"), icon: Globe2 },
    { href: "/universities", label: t("universities", "الجامعات والشركاء"), icon: Building },
    { href: "/documents", label: t("documents", "إدارة المستندات"), icon: FolderArchive },
    { href: "/visa", label: t("visa", "ملفات التأشيرات"), icon: Stamp },
    { href: "/payments", label: t("payments", "المدفوعات والعقود"), icon: CreditCard },
    { href: "/commissions", label: t("commissions", "عمولات الجامعات"), icon: Percent },
    { href: "/tasks", label: t("tasks", "المهام والمتابعات"), icon: CheckSquare },
    { href: "/communications", label: t("communications", "التواصل والواتساب"), icon: MessageSquare },
    { href: "/reports", label: t("reports", "التقارير والإحصائيات"), icon: BarChart3 },
    { href: "/employees", label: t("employees", "الموظفون والفروع"), icon: ShieldCheck },
    { href: "/audit", label: t("audit_logs", "سجل العمليات"), icon: History },
    { href: "/settings", label: t("settings", "إعدادات النظام"), icon: SettingsIcon },
    { href: "/trash", label: t("trash", "سلة المحذوفات"), icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out border-e border-slate-800 ${
          direction === "rtl" ? "right-0" : "left-0"
        } ${
          isOpen
            ? "translate-x-0"
            : direction === "rtl"
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link href="/" prefetch={false} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-base text-white block">AMALON CRM</span>
              <span className="text-[10px] text-indigo-400 font-medium block">أمالون للتعليم الدولي</span>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Quick Controls: Branch + Theme + Language */}
        <div className="lg:hidden p-3 border-b border-slate-800 space-y-2 bg-slate-950/40 shrink-0">
          <div className="relative">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 text-xs rounded-xl ps-7 pe-6 py-2 font-medium appearance-none cursor-pointer"
            >
              <option value="all">🏢 {t("all_branches", "جميع الفروع")}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.name.split("(")[0].trim()}
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 absolute inset-y-0 start-2 my-auto text-slate-400 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 absolute inset-y-0 end-2 my-auto text-slate-400 pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-200 transition cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span>{theme === "dark" ? "النهاري" : "الليلي"}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-200 transition cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === "ar" ? "English" : "عربي"}</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/70 shrink-0">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-indigo-400 truncate">
                  {user.role?.displayName || user.role?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
