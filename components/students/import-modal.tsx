"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setLoading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setParsedRows(data);
      } catch (err: any) {
        toastError("فشل قراءة ملف Excel: " + err.message);
        setParsedRows([]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(selected);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "الاسم بالعربية": "محمد عبد الله الشهري",
        "الاسم بالإنجليزية": "Mohammed Abdullah Al-Shehri",
        "الهاتف": "+966551234567",
        "البريد الإلكتروني": "m.shehri@example.com",
        "الجنسية": "سعودي",
        "رقم الجواز": "A98765432",
        "الدولة المستهدفة": "Spain",
        "التخصص المطلوب": "Artificial Intelligence",
        "المرحلة": "bachelor",
        "الميزانية": "9000",
        "الحالة": "new",
        "الملاحظات": "طالب مهتم بدراسة الذكاء الاصطناعي في مدريد",
      },
      {
        "الاسم بالعربية": "فاطمة أحمد العلي",
        "الاسم بالإنجليزية": "Fatima Ahmed Al-Ali",
        "الهاتف": "+971509876543",
        "البريد الإلكتروني": "fatima.ali@example.com",
        "الجنسية": "إماراتي",
        "رقم الجواز": "B12349876",
        "الدولة المستهدفة": "Germany",
        "التخصص المطلوب": "Biomedical Engineering",
        "المرحلة": "master",
        "الميزانية": "12000",
        "الحالة": "new",
        "الملاحظات": "حاصلة على بكالوريوس هندسة طبية",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نموذج استيراد الطلاب");
    XLSX.writeFile(wb, "amalon_students_import_template.xlsx");
  };

  const handleStartImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل استيراد الطلاب");
      }

      setImportResult({
        importedCount: data.importedCount,
        skippedCount: data.skippedCount,
        errors: data.errors || [],
      });

      success(`تم استيراد ${data.importedCount} طالب بنجاح!`);
      onSuccess();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                استيراد الطلاب من ملف Excel أو CSV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ارفع جدول البيانات لاستيراد عدة طلاب دفعة واحدة وإنشاء ملفاتهم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Download Sample Template Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div>
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 block">
                هل تحتاج إلى نموذج جاهز لتعبئته؟
              </span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                قم بتنزيل النموذج الإرشادي الذي يحتوي على الأعمدة المتوافقة تماماً مع النظام.
              </span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النموذج (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto text-indigo-600 dark:text-indigo-400 mb-3 opacity-80" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                اضغط لاختيار ملف أو اسحب الملف هنا
              </h3>
              <p className="text-xs text-slate-400 mt-1">يدعم صيغ Excel (.xlsx, .xls) و ملفات CSV</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{file.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} صف تم التعرف عليه
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] transition font-bold"
                >
                  تغيير الملف
                </button>
              </div>

              {/* Data Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      معاينة البيانات قبل الاستيراد (أول 5 صفوف):
                    </span>
                    <span className="text-slate-400">إجمالي {parsedRows.length} طالب</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-56">
                    <table className="w-full text-right text-[11px] border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">الاسم</th>
                          <th className="p-2.5">الهاتف</th>
                          <th className="p-2.5">البريد</th>
                          <th className="p-2.5">الدولة</th>
                          <th className="p-2.5">التخصص</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                              {row.fullNameAr || row["الاسم بالعربية"] || row["الاسم"] || "-"}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300" dir="ltr">
                              {row.phone || row["الهاتف"] || row["رقم الهاتف"] || "-"}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300" dir="ltr">
                              {row.email || row["البريد الإلكتروني"] || "-"}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">
                              {row.desiredCountry || row["الدولة المستهدفة"] || row["الدولة"] || "-"}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">
                              {row.desiredMajor || row["التخصص المطلوب"] || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Results Box */}
              {importResult && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم استيراد {importResult.importedCount} طالب بنجاح!</span>
                  </div>
                  {importResult.skippedCount > 0 && (
                    <div className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>تم تخطي {importResult.skippedCount} طالب (مكرر أو بيانات ناقصة)</span>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[11px] text-slate-500">
                      <span className="font-bold">التفاصيل:</span>
                      {importResult.errors.slice(0, 4).map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
          {parsedRows.length > 0 && !importResult && (
            <button
              type="button"
              onClick={handleStartImport}
              disabled={importing || loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>بدء الاستيراد ({parsedRows.length} طالب)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
