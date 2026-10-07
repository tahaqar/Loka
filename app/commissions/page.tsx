"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { Percent, DollarSign, Building, Loader2 } from "lucide-react";

export default function CommissionsPage() {
  const { t } = useCrm();
  const [data, setData] = useState<any>({ commissions: [], unreceivedTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommissions() {
      try {
        const res = await fetch("/api/commissions");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Fetch commissions error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCommissions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Percent className="w-6 h-6 text-indigo-600" />
          <span>{t("commissions", "عمولات الجامعات الشريكة")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          متابعة مستحقات أمالون من الرسوم الدراسية وعمولات القبولات الصادرة
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">إجمالي العمولات غير المحصلة</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            ${data.unreceivedTotal?.toLocaleString() || 0}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل العمولات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">رقم المرجع</th>
                  <th className="p-3.5 text-start font-semibold">الجامعة</th>
                  <th className="p-3.5 text-start font-semibold">الطالب والطلب</th>
                  <th className="p-3.5 text-start font-semibold">الرسوم المدفوعة</th>
                  <th className="p-3.5 text-start font-semibold">قيمة العمولة</th>
                  <th className="p-3.5 text-end font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.commissions?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{c.referenceNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {c.university?.nameAr}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {c.application?.student?.fullNameAr}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{c.application?.applicationCode}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      ${c.tuitionPaid?.toLocaleString()} {c.tuitionCurrency}
                    </td>
                    <td className="p-3.5 font-bold text-indigo-600">
                      ${c.commissionAmount?.toLocaleString()} {c.currency} ({c.commissionRate}%)
                    </td>
                    <td className="p-3.5 text-end">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {c.status}
                      </span>
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
