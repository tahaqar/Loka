"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import { CheckSquare, Calendar, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

export default function TasksPage() {
  const { t } = useCrm();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok && isMounted) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Fetch tasks error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const toggleTask = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-600" />
          <span>{t("tasks", "المهام والمتابعات التشغيلية")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          قائمة المهام اليومية، مواعيد التقديم، والتنبيهات المجدولة لفريق العمل
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل المهام...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">لا توجد مهام معلقة</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id, task.status)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-700 hover:border-indigo-500"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <span className={`font-semibold text-slate-900 dark:text-white ${isCompleted ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {task.student ? `طالب: ${task.student.fullNameAr}` : "مهمة داخلية"} • مسؤول: {task.assignee?.name || "فريق العمل"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("ar-EG") : "بدون تاريخ"}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.priority === "urgent" ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
