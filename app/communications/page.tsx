"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { MessageSquare, Phone, Copy, Check, Loader2 } from "lucide-react";

export default function CommunicationsPage() {
  const { t } = useCrm();
  const [data, setData] = useState<any>({ templates: [], communications: [] });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadComms() {
      try {
        const res = await fetch("/api/communications");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Fetch comms error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComms();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          <span>{t("communications", "قوالب رسائل واتساب وسجل التواصل")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          قوالب الرسائل المعتمدة الجاهزة مع المتغيرات الديناميكية وسجل المحادثات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.templates?.map((tpl: any) => (
          <div
            key={tpl.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{tpl.nameAr}</span>
              <button
                onClick={() => handleCopy(tpl.id, tpl.contentAr)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 text-[11px] font-semibold"
              >
                {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === tpl.id ? "تم النسخ" : "نسخ النص"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {tpl.contentAr}
            </p>

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>المتغيرات المدعومة:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{tpl.variables}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
