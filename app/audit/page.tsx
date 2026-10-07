"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { History, Shield, Clock, Loader2 } from "lucide-react";

export default function AuditPage() {
  const { t } = useCrm();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const res = await fetch("/api/audit");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Fetch audit error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" />
          <span>{t("audit_logs", "سجل العمليات والتدقيق (Audit Trail)")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          تسجيل غير قابل للتعديل لجميع العمليات (الإنشاء، التعديل، الحذف، وتغيير الحالات)
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل سجل التدقيق...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">المستخدم</th>
                  <th className="p-3.5 text-start font-semibold">نوع العملية</th>
                  <th className="p-3.5 text-start font-semibold">الكيان (Entity)</th>
                  <th className="p-3.5 text-start font-semibold">التفاصيل والتغييرات</th>
                  <th className="p-3.5 text-end font-semibold">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {log.userName || "System"}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {log.entity}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {log.details || log.newValue || log.entityId || "تم التنفيذ"}
                    </td>
                    <td className="p-3.5 text-end text-slate-400">
                      {new Date(log.createdAt).toLocaleString("ar-EG")}
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
