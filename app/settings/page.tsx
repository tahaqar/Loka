"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
  Layers,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { t } = useCrm();
  const [activeTab, setActiveTab] = useState("lookups");

  // Lookups state
  const [options, setOptions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("study_level");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newLabelAr, setNewLabelAr] = useState("");
  const [newLabelEn, setNewLabelEn] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Custom fields state
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState("Student");
  const [loadingFields, setLoadingFields] = useState(true);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabelAr, setNewFieldLabelAr] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");

  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Lookups
  useEffect(() => {
    let isMounted = true;
    async function loadLookups() {
      try {
        const res = await fetch(`/api/settings/lookups?category=${selectedCategory}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setOptions(data.options || []);
        }
      } catch (err) {
        console.error("Fetch lookups error:", err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    }
    loadLookups();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, refreshKey]);

  // Fetch Custom Fields
  useEffect(() => {
    let isMounted = true;
    async function loadFields() {
      try {
        const res = await fetch(`/api/settings/custom-fields?entity=${selectedEntity}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setCustomFields(data.fields || []);
        }
      } catch (err) {
        console.error("Fetch fields error:", err);
      } finally {
        if (isMounted) setLoadingFields(false);
      }
    }
    loadFields();
    return () => {
      isMounted = false;
    };
  }, [selectedEntity, refreshKey]);

  const handleCreateLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    try {
      const res = await fetch("/api/settings/lookups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          key: newKey,
          labelAr: newLabelAr,
          labelEn: newLabelEn || newLabelAr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create option");
      setNewKey("");
      setNewLabelAr("");
      setNewLabelEn("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setLookupError(err.message);
    }
  };

  const handleDeleteLookup = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخيار؟")) return;
    try {
      await fetch(`/api/settings/lookups?id=${id}`, { method: "DELETE" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Delete lookup error:", err);
    }
  };

  const handleCreateCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: selectedEntity,
          name: newFieldName,
          labelAr: newFieldLabelAr,
          type: newFieldType,
        }),
      });
      if (res.ok) {
        setNewFieldName("");
        setNewFieldLabelAr("");
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Create custom field error:", err);
    }
  };

  const handleDeleteCustomField = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحقل المخصص؟")) return;
    try {
      await fetch(`/api/settings/custom-fields?id=${id}`, { method: "DELETE" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Delete custom field error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>{t("settings", "إعدادات النظام والخيارات الحية")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          إدارة خيارات القوائم المنسدلة بدون أي كود ثابت، إضافة حقول مخصصة، وضبط المعاملات
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("lookups")}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "lookups"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>خيارات القوائم المنسدلة (Lookups)</span>
        </button>

        <button
          onClick={() => setActiveTab("customFields")}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "customFields"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الحقول المخصصة (Custom Fields)</span>
        </button>
      </div>

      {/* Tab 1: Lookups */}
      {activeTab === "lookups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              فئة الخيارات
            </h2>
            <div className="space-y-1.5">
              {[
                { id: "study_level", label: "المراحل الدراسية (Study Levels)" },
                { id: "student_status", label: "حالات الطلاب (Student Statuses)" },
                { id: "payment_method", label: "طرق السداد (Payment Methods)" },
                { id: "task_priority", label: "أولويات المهام (Task Priorities)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-start p-2.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Add new option form */}
            <form onSubmit={handleCreateLookup} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">إضافة خيار جديد</span>
              {lookupError && <p className="text-[11px] text-rose-500 font-semibold">{lookupError}</p>}
              <input
                type="text"
                required
                placeholder="المفتاح البرمجي (مثال: diploma)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="text"
                required
                placeholder="الاسم بالعربية (مثال: دبلوم متوسط)"
                value={newLabelAr}
                onChange={(e) => setNewLabelAr(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة الخيار</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              الخيارات المفعلة في النظام حالياً
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {options.map((opt) => (
                <div key={opt.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color || "#6366f1" }} />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{opt.labelAr}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{opt.key}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLookup(opt.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="حذف الخيار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Fields */}
      {activeTab === "customFields" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              الكيان المستهدف
            </h2>
            <div className="space-y-1.5">
              {["Student", "Application", "University"].map((ent) => (
                <button
                  key={ent}
                  onClick={() => setSelectedEntity(ent)}
                  className={`w-full text-start p-2.5 rounded-xl text-xs font-semibold transition ${
                    selectedEntity === ent
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {ent === "Student" ? "ملف الطالب (Student)" : ent === "Application" ? "طلب التقديم (Application)" : "الجامعة (University)"}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateCustomField} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">إضافة حقل مخصص جديد</span>
              <input
                type="text"
                required
                placeholder="اسم الحقل البرمجي (مثال: emergency_contact)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="text"
                required
                placeholder="التسمية بالعربية (مثال: جهة اتصال الطوارئ)"
                value={newFieldLabelAr}
                onChange={(e) => setNewFieldLabelAr(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                <option value="text">نص (Text)</option>
                <option value="number">رقم (Number)</option>
                <option value="date">تاريخ (Date)</option>
                <option value="checkbox">مربع اختيار (Checkbox)</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>حفظ الحقل المخصص</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              الحقول المخصصة المضافة إلى {selectedEntity}
            </h2>
            {customFields.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد حقول مخصصة مضافة لهذا الكيان</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {customFields.map((field) => (
                  <div key={field.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{field.labelAr}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{field.name} • نوع: {field.type}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="حذف الحقل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
