"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";
type Theme = "light" | "dark";

interface CrmContextType {
  language: Language;
  direction: "rtl" | "ltr";
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, defaultText?: string) => string;
  selectedBranchId: string; // 'all' or branch id
  setSelectedBranchId: (id: string) => void;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    students: "الطلاب",
    applications: "القبولات والتقديمات",
    kanban: "لوحة كانبان (Kanban)",
    countries: "الدول والوجهات",
    universities: "الجامعات والشركاء",
    documents: "إدارة المستندات",
    visa: "ملفات التأشيرات",
    payments: "المدفوعات والعقود",
    commissions: "عمولات الجامعات",
    tasks: "المهام والمتابعات",
    communications: "سجل التواصل والرسائل",
    templates: "قوالب الواتساب",
    reports: "التقارير والإحصائيات",
    employees: "الموظفون والفروع",
    audit_logs: "سجل العمليات (Audit)",
    settings: "إعدادات النظام",

    // Common actions & UI
    search: "بحث...",
    filter: "تصفية",
    export: "تصدير",
    import: "استيراد",
    add_new: "إضافة جديد",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    view: "عرض التفاصيل",
    actions: "الإجراءات",
    status: "الحالة",
    date: "التاريخ",
    notes: "ملاحظات",
    logout: "تسجيل الخروج",
    all_branches: "جميع الفروع",
    notifications: "التنبيهات",
    welcome: "مرحباً",
    profile: "الملف الشخصي",
    today_tasks: "مهام اليوم",
    embassy_appointments: "مواعيد السفارة القادمة",
    unreceived_commissions: "عمولات جامعية غير محصلة",

    // Statuses
    new: "جديد",
    active: "نشط",
    submitted: "تم التقديم",
    in_progress: "قيد المتابعة",
    conditional_acceptance: "قبول مشروط",
    final_acceptance: "قبول نهائي",
    visa_stage: "مرحلة التأشيرة",
    travelled: "سافر",
    arrived: "وصل للوجهة",
    cancelled: "ملغي",
    completed: "مكتمل",
    pending: "قيد الانتظار",
    urgent: "عاجل",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    students: "Students",
    applications: "Applications",
    kanban: "Kanban Board",
    countries: "Study Destinations",
    universities: "Universities & Partners",
    documents: "Document Vault",
    visa: "Visa Cases",
    payments: "Payments & Contracts",
    commissions: "University Commissions",
    tasks: "Tasks & Follow-ups",
    communications: "Communications Log",
    templates: "WhatsApp Templates",
    reports: "Analytics & Reports",
    employees: "Staff & Branches",
    audit_logs: "Audit Trail",
    settings: "Settings",

    // Common actions & UI
    search: "Search...",
    filter: "Filter",
    export: "Export",
    import: "Import",
    add_new: "Add New",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View Details",
    actions: "Actions",
    status: "Status",
    date: "Date",
    notes: "Notes",
    logout: "Sign Out",
    all_branches: "All Branches",
    notifications: "Notifications",
    welcome: "Welcome",
    profile: "Profile",
    today_tasks: "Today's Tasks",
    embassy_appointments: "Upcoming Embassy Appointments",
    unreceived_commissions: "Pending Commissions",

    // Statuses
    new: "New",
    active: "Active",
    submitted: "Submitted",
    in_progress: "In Progress",
    conditional_acceptance: "Conditional Offer",
    final_acceptance: "Final Offer",
    visa_stage: "Visa Stage",
    travelled: "Travelled",
    arrived: "Arrived",
    cancelled: "Cancelled",
    completed: "Completed",
    pending: "Pending",
    urgent: "Urgent",
  },
};

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("amalon_crm_lang") as Language) || "ar";
    }
    return "ar";
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("amalon_crm_theme") as Theme) || "light";
    }
    return "light";
  });
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("amalon_crm_branch") || "all";
    }
    return "all";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [language, theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("amalon_crm_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const toggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setThemeState(nextTheme);
    localStorage.setItem("amalon_crm_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSetSelectedBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    localStorage.setItem("amalon_crm_branch", branchId);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language][key] || defaultText || key;
  };

  return (
    <CrmContext.Provider
      value={{
        language,
        direction: language === "ar" ? "rtl" : "ltr",
        toggleLanguage,
        setLanguage,
        theme,
        toggleTheme,
        t,
        selectedBranchId,
        setSelectedBranchId: handleSetSelectedBranch,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }
  return context;
}
