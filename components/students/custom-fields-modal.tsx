"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Edit2, Check, Sparkles, ListFilter, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function CustomFieldsModal({ isOpen, onClose, onRefresh }: CustomFieldsModalProps) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"fields" | "lookups">("fields");

  // Custom Fields State
  const [fields, setFields] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [fieldForm, setFieldForm] = useState({
    name: "",
    labelAr: "",
    labelEn: "",
    type: "text",
    optionsText: "",
    isRequired: false,
  });

  // Lookups State
  const [selectedCategory, setSelectedCategory] = useState("student_status");
  const [lookupOptions, setLookupOptions] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [editingLookup, setEditingLookup] = useState<any | null>(null);
  const [lookupForm, setLookupForm] = useState({
    key: "",
    labelAr: "",
    labelEn: "",
    color: "#6366f1",
  });

  // Load fields
  const loadFields = useCallback(async () => {
    setLoadingFields(true);
    try {
      const res = await fetch("/api/students/custom-fields");
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields || []);
      }
    } catch {
      toastError("فشل تحميل الحقول المخصصة");
    } finally {
      setLoadingFields(false);
    }
  }, [toastError]);

  // Load lookups
  const loadLookups = useCallback(async (cat: string) => {
    setLoadingLookups(true);
    try {
      const res = await fetch(`/api/students/lookups?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setLookupOptions(data.options || []);
      }
    } catch {
      toastError("فشل تحميل خيارات القائمة");
    } finally {
      setLoadingLookups(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (isOpen) {
      loadFields();
      loadLookups(selectedCategory);
    }
  }, [isOpen, selectedCategory, loadFields, loadLookups]);

  if (!isOpen) return null;

  // Handle save custom field
  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldForm.labelAr.trim()) {
      toastError("تسمية الحقل بالعربية مطلوبة");
      return;
    }

    try {
      const optionsJson =
        fieldForm.type === "select" && fieldForm.optionsText
          ? fieldForm.optionsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : null;

      if (editingField) {
        const res = await fetch("/api/students/custom-fields", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingField.id,
            labelAr: fieldForm.labelAr,
            labelEn: fieldForm.labelEn || fieldForm.labelAr,
            type: fieldForm.type,
            optionsJson,
            isRequired: fieldForm.isRequired,
          }),
        });
        if (!res.ok) throw new Error("فشل تحديث الحقل");
        success("تم تحديث الحقل المخصص بنجاح");
      } else {
        const generatedName =
          fieldForm.name.trim() ||
          "cf_" + Date.now().toString(36);

        const res = await fetch("/api/students/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generatedName,
            labelAr: fieldForm.labelAr,
            labelEn: fieldForm.labelEn || fieldForm.labelAr,
            type: fieldForm.type,
            optionsJson,
            isRequired: fieldForm.isRequired,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل إضافة الحقل");
        success("تمت إضافة الحقل المخصص بنجاح");
      }

      setEditingField(null);
      setFieldForm({ name: "", labelAr: "", labelEn: "", type: "text", optionsText: "", isRequired: false });
      loadFields();
      onRefresh();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // Handle delete custom field
  const handleDeleteField = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحقل المخصص؟")) return;
    try {
      const res = await fetch(`/api/students/custom-fields?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الحقل");
      success("تم حذف الحقل المخصص");
      loadFields();
      onRefresh();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // Handle save lookup option
  const handleSaveLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupForm.labelAr.trim()) {
      toastError("التسمية بالعربية مطلوبة");
      return;
    }

    try {
      if (editingLookup) {
        const res = await fetch("/api/students/lookups", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingLookup.id,
            labelAr: lookupForm.labelAr,
            labelEn: lookupForm.labelEn || lookupForm.labelAr,
            color: lookupForm.color,
          }),
        });
        if (!res.ok) throw new Error("فشل تحديث الخيار");
        success("تم تحديث خيار القائمة بنجاح");
      } else {
        const generatedKey =
          lookupForm.key.trim() ||
          "opt_" + Date.now().toString(36);

        const res = await fetch("/api/students/lookups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: selectedCategory,
            key: generatedKey,
            labelAr: lookupForm.labelAr,
            labelEn: lookupForm.labelEn || lookupForm.labelAr,
            color: lookupForm.color,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل إضافة الخيار");
        success("تمت إضافة خيار القائمة بنجاح");
      }

      setEditingLookup(null);
      setLookupForm({ key: "", labelAr: "", labelEn: "", color: "#6366f1" });
      loadLookups(selectedCategory);
      onRefresh();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // Handle delete lookup option
  const handleDeleteLookup = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخيار من القائمة؟")) return;
    try {
      const res = await fetch(`/api/students/lookups?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الخيار");
      success("تم حذف الخيار بنجاح");
      loadLookups(selectedCategory);
      onRefresh();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>إدارة الحقول المخصصة والقوائم المنسدلة</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تحكم كامل في الحقول الإضافية للطالب وخيارات القوائم بدون كود ثابت
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("fields")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "fields"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>الحقول المخصصة للطلاب ({fields.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("lookups")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "lookups"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>إدارة القوائم المنسدلة (Lookups)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: Custom Fields */}
          {activeTab === "fields" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{editingField ? "تعديل الحقل المخصص" : "إضافة حقل مخصص جديد"}</span>
                  {editingField && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingField(null);
                        setFieldForm({ name: "", labelAr: "", labelEn: "", type: "text", optionsText: "", isRequired: false });
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </h3>

                <form onSubmit={handleSaveField} className="space-y-3">
                  {!editingField && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        اسم الحقل البرمجي (Key)
                      </label>
                      <input
                        type="text"
                        value={fieldForm.name}
                        onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                        placeholder="e.g. sponsorName, highSchoolScore"
                        dir="ltr"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      التسمية بالعربية <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fieldForm.labelAr}
                      onChange={(e) => setFieldForm({ ...fieldForm, labelAr: e.target.value })}
                      placeholder="اسم الكفيل أو ولي الأمر"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      التسمية بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={fieldForm.labelEn}
                      onChange={(e) => setFieldForm({ ...fieldForm, labelEn: e.target.value })}
                      placeholder="Sponsor Name"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      نوع الحقل
                    </label>
                    <select
                      value={fieldForm.type}
                      onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="text">نص عادي (Text)</option>
                      <option value="number">رقم (Number)</option>
                      <option value="date">تاريخ (Date)</option>
                      <option value="select">قائمة اختيار (Dropdown)</option>
                      <option value="checkbox">مربع تأكيد نعم/لا (Checkbox)</option>
                    </select>
                  </div>

                  {fieldForm.type === "select" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        خيارات القائمة (افصل بينها بفاصلة)
                      </label>
                      <input
                        type="text"
                        value={fieldForm.optionsText}
                        onChange={(e) => setFieldForm({ ...fieldForm, optionsText: e.target.value })}
                        placeholder="خيار 1, خيار 2, خيار 3"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={fieldForm.isRequired}
                      onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
                      className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      حقل إلزامي عند إضافة الطالب
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingField ? "تحديث الحقل" : "إضافة الحقل"}</span>
                  </button>
                </form>
              </div>

              {/* List Column */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  الحقول المخصصة المفعلة حالياً
                </h3>

                {loadingFields ? (
                  <div className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-1" />
                    <span className="text-xs">جاري التحميل...</span>
                  </div>
                ) : fields.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    لم تقم بإضافة أي حقول مخصصة بعد. أضف حقلك الأول من النموذج!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    {fields.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{f.labelAr}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                              {f.type}
                            </span>
                            {f.isRequired && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold">
                                إلزامي
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            المفتاح: {f.name} • {f.labelEn}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingField(f);
                              let opts = "";
                              if (f.optionsJson) {
                                try {
                                  opts = JSON.parse(f.optionsJson).join(", ");
                                } catch {
                                  opts = "";
                                }
                              }
                              setFieldForm({
                                name: f.name,
                                labelAr: f.labelAr,
                                labelEn: f.labelEn,
                                type: f.type,
                                optionsText: opts,
                                isRequired: f.isRequired,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(f.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Lookups */}
          {activeTab === "lookups" && (
            <div className="space-y-5">
              {/* Category Picker */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: "student_status", label: "حالات الطلاب (Student Status)" },
                  { id: "study_level", label: "المراحل الدراسية (Study Levels)" },
                  { id: "payment_method", label: "طرق السداد (Payment Methods)" },
                  { id: "task_priority", label: "أولويات المهام (Task Priorities)" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setEditingLookup(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{editingLookup ? "تعديل خيار القائمة" : "إضافة خيار جديد للقائمة"}</span>
                    {editingLookup && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLookup(null);
                          setLookupForm({ key: "", labelAr: "", labelEn: "", color: "#6366f1" });
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                  </h3>

                  <form onSubmit={handleSaveLookup} className="space-y-3">
                    {!editingLookup && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          المفتاح الإنجليزي (Key)
                        </label>
                        <input
                          type="text"
                          value={lookupForm.key}
                          onChange={(e) => setLookupForm({ ...lookupForm, key: e.target.value })}
                          placeholder="e.g. visa_interview, fast_track"
                          dir="ltr"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        التسمية بالعربية <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lookupForm.labelAr}
                        onChange={(e) => setLookupForm({ ...lookupForm, labelAr: e.target.value })}
                        placeholder="المقابلة الشخصية للسفارة"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        التسمية بالإنجليزية
                      </label>
                      <input
                        type="text"
                        value={lookupForm.labelEn}
                        onChange={(e) => setLookupForm({ ...lookupForm, labelEn: e.target.value })}
                        placeholder="Embassy Interview"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        لون الشارة (Badge Color)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={lookupForm.color}
                          onChange={(e) => setLookupForm({ ...lookupForm, color: e.target.value })}
                          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={lookupForm.color}
                          onChange={(e) => setLookupForm({ ...lookupForm, color: e.target.value })}
                          className="w-28 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingLookup ? "حفظ التعديل" : "إضافة الخيار"}</span>
                    </button>
                  </form>
                </div>

                {/* List Column */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    الخيارات المسجلة ({lookupOptions.length})
                  </h3>

                  {loadingLookups ? (
                    <div className="py-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-1" />
                      <span className="text-xs">جاري التحميل...</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                      {lookupOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs transition"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: opt.color || "#6366f1" }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {opt.labelAr}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {opt.key} • {opt.labelEn}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLookup(opt);
                                setLookupForm({
                                  key: opt.key,
                                  labelAr: opt.labelAr,
                                  labelEn: opt.labelEn,
                                  color: opt.color || "#6366f1",
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLookup(opt.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
