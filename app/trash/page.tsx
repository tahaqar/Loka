"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { Trash2, RotateCcw, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

export default function TrashPage() {
  const { t } = useCrm();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTrash() {
      try {
        const res = await fetch("/api/trash");
        if (res.ok && isMounted) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error("Fetch trash error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTrash();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleRestore = async (id: string, entity: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, entity }),
      });
      if (res.ok) {
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Restore error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string, entity: string) => {
    if (!confirm("هل أنت متأكد من الحذف النهائي؟ لا يمكن استرجاع هذا السجل.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/trash?id=${id}&entity=${entity}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-rose-600" />
          <span>{t("trash", "سلة المحذوفات (Trash & Recovery)")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          استعادة السجلات المحذوفة أو الحذف النهائي للملفات والبيانات
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري فحص سلة المحذوفات...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">سلة المحذوفات فارغة</p>
            <p className="text-xs text-slate-400 mt-1">لا توجد أي سجلات محذوفة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">نوع السجل</th>
                  <th className="p-3.5 text-start font-semibold">تفاصيل العنصر</th>
                  <th className="p-3.5 text-start font-semibold">تاريخ الحذف</th>
                  <th className="p-3.5 text-end font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200">
                        {item.entity}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(item.deletedAt).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.id, item.entity)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id, item.entity)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
