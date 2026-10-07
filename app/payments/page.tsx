"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import { CreditCard, DollarSign, TrendingUp, CheckCircle2, Clock, Loader2, ExternalLink } from "lucide-react";

export default function PaymentsPage() {
  const { t } = useCrm();
  const [data, setData] = useState<any>({ payments: [], contracts: [], totalCollected: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Fetch payments error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-indigo-600" />
          <span>{t("payments", "المدفوعات وسندات القبض والعقود")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          التدقيق المالي، الدفعات المحصلة، والمبالغ المتبقية على الطلاب
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">إجمالي المحصل الفعلي</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              ${data.totalCollected?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">إجمالي المتبقي للتحصيل</span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              ${data.totalRemaining?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل سندات القبض...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">رقم الإيصال</th>
                  <th className="p-3.5 text-start font-semibold">اسم الطالب</th>
                  <th className="p-3.5 text-start font-semibold">المبلغ المسدد</th>
                  <th className="p-3.5 text-start font-semibold">تاريخ الدفع</th>
                  <th className="p-3.5 text-start font-semibold">طريقة السداد</th>
                  <th className="p-3.5 text-start font-semibold">المستلم</th>
                  <th className="p-3.5 text-end font-semibold">الملف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{p.receiptNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {p.student?.fullNameAr}
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 text-sm">
                      ${p.amount?.toLocaleString()} {p.currency}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(p.paymentDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{p.receiver?.name?.split("(")[0]?.trim()}</td>
                    <td className="p-3.5 text-end">
                      <Link
                        href={`/students/${p.student?.id}?tab=payments`}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>عرض</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
