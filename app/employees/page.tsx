"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import {
  ShieldCheck,
  Building,
  Phone,
  Mail,
  UserCheck,
  Loader2,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  MapPin,
  Globe,
} from "lucide-react";

export default function EmployeesPage() {
  const { t } = useCrm();
  const [data, setData] = useState<any>({ users: [], branches: [] });
  const [loading, setLoading] = useState(true);

  // Add branch modal state
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    isHeadquarter: false,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const json = await res.json();
          if (!ignore) {
            setData(json);
          }
        }
      } catch (err) {
        console.error("Fetch employees error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "فشل إنشاء الفرع");
      }

      setFormData({
        name: "",
        code: "",
        city: "",
        country: "",
        address: "",
        phone: "",
        email: "",
        isHeadquarter: false,
      });
      setShowAddBranch(false);
      setRefreshKey((k) => k + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("amalon:branches-updated"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء إضافة الفرع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الفرع "${name}"؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/branches?id=${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "فشل حذف الفرع");
      }

      setRefreshKey((k) => k + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("amalon:branches-updated"));
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حذف الفرع");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-semibold">جاري تحميل بيانات الموظفين والفروع...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>{t("employees", "فريق العمل والفروع الدولية")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة الموظفين، الفروع الدولية، وإضافة وحذف الفروع وتوزيع الصلاحيات
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setShowAddBranch(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Branches Column */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>الفروع الدولية (Branches)</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {data.branches?.length || 0} فرع
            </span>
          </div>

          <div className="space-y-3">
            {(!data.branches || data.branches.length === 0) ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <Building className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">لا توجد فروع مسجلة حالياً</p>
                <p className="text-[11px] text-slate-400">اضغط على زر &quot;إضافة فرع جديد&quot; أعلاه لإنشاء فرع</p>
                <button
                  onClick={() => setShowAddBranch(true)}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فرع</span>
                </button>
              </div>
            ) : (
              data.branches.map((b: any) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{b.name}</span>
                        {b.isHeadquarter && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            المقر الرئيسي
                          </span>
                        )}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        رمز: {b.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
                      title="حذف الفرع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    {b.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {b.city} {b.country ? `• ${b.country}` : ""}
                      </span>
                    )}
                    {b.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {b.phone}
                      </span>
                    )}
                    {b.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {b.email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 font-medium">
                    <span>{b._count?.users || 0} موظف</span>
                    <span>•</span>
                    <span>{b._count?.students || 0} طالب مسجل</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Users Column */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>الموظفون والمستشارون</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {data.users?.length || 0} موظف
            </span>
          </div>

          <div className="space-y-3">
            {data.users?.map((u: any) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                  <span className="text-[11px] text-slate-400 block">{u.email}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
                    {u.role?.displayName || u.role?.name} • {u.branch ? u.branch.name.split("(")[0].trim() : "غير مرتبط بفرع"}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  نشط
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>إضافة فرع جديد</span>
              </h3>
              <button
                onClick={() => setShowAddBranch(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  اسم الفرع *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع الرياض، فرع الإسكندرية..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    رمز الفرع (Code)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: RUH-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    المدينة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الرياض"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    الدولة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: السعودية"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: +966 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  البريد الإلكتروني للفرع
                </label>
                <input
                  type="email"
                  placeholder="مثال: branch@amalon.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  placeholder="مثال: شارع الملك فهد، برج الفيصلية، الطابق 10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isHeadquarter"
                  checked={formData.isHeadquarter}
                  onChange={(e) => setFormData({ ...formData, isHeadquarter: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="isHeadquarter" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  تعيين هذا الفرع كمقر رئيسي للشركة (Headquarters)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ الفرع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

