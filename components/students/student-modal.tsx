"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Save, User, GraduationCap, Compass, Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: any; // If provided, modal is in edit mode
  branches?: any[];
  counselors?: any[];
  leadSources?: any[];
  countries?: any[];
}

export function StudentModal({
  isOpen,
  onClose,
  onSuccess,
  student,
  branches = [],
  counselors = [],
  leadSources = [],
  countries = [],
}: StudentModalProps) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "goals" | "crm">("personal");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullNameAr: "",
    fullNameEn: "",
    nationality: "سعودي",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    residenceCountry: "Saudi Arabia",
    passportNumber: "",
    birthDate: "",
    gender: "male",
    lastCertificate: "High School",
    gpa: "",
    previousMajor: "",
    languageLevel: "B1",
    ieltsToeflScore: "",
    desiredMajor: "Computer Science",
    desiredCountry: "Spain",
    targetLevel: "bachelor",
    budget: "8000",
    budgetCurrency: "USD",
    intake: "Fall 2026",
    branchId: "",
    counselorId: "",
    leadSourceId: "",
    status: "new",
    notes: "",
  });

  // Initialize form data when student prop changes
  useEffect(() => {
    if (student) {
      setFormData({
        fullNameAr: student.fullNameAr || "",
        fullNameEn: student.fullNameEn || "",
        nationality: student.nationality || "سعودي",
        phone: student.phone || "",
        whatsapp: student.whatsapp || student.phone || "",
        email: student.email || "",
        city: student.city || "",
        residenceCountry: student.residenceCountry || "Saudi Arabia",
        passportNumber: student.passportNumber || "",
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().slice(0, 10) : "",
        gender: student.gender || "male",
        lastCertificate: student.lastCertificate || "High School",
        gpa: student.gpa || "",
        previousMajor: student.previousMajor || "",
        languageLevel: student.languageLevel || "B1",
        ieltsToeflScore: student.ieltsToeflScore || "",
        desiredMajor: student.desiredMajor || "Computer Science",
        desiredCountry: student.desiredCountry || "Spain",
        targetLevel: student.targetLevel || "bachelor",
        budget: student.budget ? String(student.budget) : "8000",
        budgetCurrency: student.budgetCurrency || "USD",
        intake: student.intake || "Fall 2026",
        branchId: student.branchId || "",
        counselorId: student.counselorId || "",
        leadSourceId: student.leadSourceId || "",
        status: student.status || "new",
        notes: student.notes || "",
      });
    } else {
      setFormData({
        fullNameAr: "",
        fullNameEn: "",
        nationality: "سعودي",
        phone: "",
        whatsapp: "",
        email: "",
        city: "",
        residenceCountry: "Saudi Arabia",
        passportNumber: "",
        birthDate: "",
        gender: "male",
        lastCertificate: "High School",
        gpa: "",
        previousMajor: "",
        languageLevel: "B1",
        ieltsToeflScore: "",
        desiredMajor: "Computer Science",
        desiredCountry: "Spain",
        targetLevel: "bachelor",
        budget: "8000",
        budgetCurrency: "USD",
        intake: "Fall 2026",
        branchId: "",
        counselorId: "",
        leadSourceId: "",
        status: "new",
        notes: "",
      });
    }
    setErrors({});
    setActiveTab("personal");
  }, [student, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullNameAr.trim()) {
      errs.fullNameAr = "الاسم الكامل بالعربية مطلوب";
    }
    if (!formData.phone.trim()) {
      errs.phone = "رقم الهاتف مطلوب";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errs.email = "يرجى إدخال بريد إلكتروني صالح";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toastError("يرجى ملء جميع الحقول المطلوبة والتأكد من صحة البيانات");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
      };

      const url = student ? `/api/students/${student.id}` : "/api/students";
      const method = student ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء حفظ بيانات الطالب");
      }

      success(student ? "تم تحديث بيانات الطالب بنجاح" : "تم تسجيل الطالب الجديد بنجاح");
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{student ? `تعديل ملف الطالب: ${student.fullNameAr}` : "إضافة طالب جديد للنظام"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {student ? `الكود التعريفي: ${student.studentCode}` : "املأ بيانات الطالب الأساسية والأكاديمية والمتابعة"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          {[
            { id: "personal", label: "البيانات الشخصية", icon: User },
            { id: "academic", label: "الخلفية الأكاديمية", icon: GraduationCap },
            { id: "goals", label: "الأهداف الدراسية", icon: Compass },
            { id: "crm", label: "إدارة المتابعة (CRM)", icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition border-b-2 ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الاسم الكامل بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullNameAr}
                  onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                  placeholder="محمد أحمد علي"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.fullNameAr ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white`}
                />
                {errors.fullNameAr && <p className="text-[11px] text-rose-500">{errors.fullNameAr}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الاسم بالإنجليزية (مطابق للجواز)
                </label>
                <input
                  type="text"
                  value={formData.fullNameEn}
                  onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                  placeholder="Mohammed Ahmed Ali"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الجنسية
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="سعودي، مصري، عراقي..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  رقم الهاتف (مع الكود الدولي) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966501234567"
                  dir="ltr"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.phone ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  رقم الواتساب
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+966501234567"
                  dir="ltr"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  dir="ltr"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.email ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white`}
                />
                {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  رقم جواز السفر
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  placeholder="A12345678"
                  dir="ltr"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  بلد الإقامة
                </label>
                <input
                  type="text"
                  value={formData.residenceCountry}
                  onChange={(e) => setFormData({ ...formData, residenceCountry: e.target.value })}
                  placeholder="السعودية، الإمارات، مصر..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  المدينة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="الرياض، القاهرة، دبي..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الجنس
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Academic Background */}
          {activeTab === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  آخر مؤهل علمي
                </label>
                <select
                  value={formData.lastCertificate}
                  onChange={(e) => setFormData({ ...formData, lastCertificate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="High School">ثانوية عامة (High School)</option>
                  <option value="Bachelor">بكالوريوس (Bachelor)</option>
                  <option value="Master">ماجستير (Master)</option>
                  <option value="Diploma">دبلوم (Diploma)</option>
                  <option value="Other">أخرى</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  المعدل الدراسي / GPA
                </label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="3.8 / 4.0 أو 85%"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  التخصص السابق (إن وجد)
                </label>
                <input
                  type="text"
                  value={formData.previousMajor}
                  onChange={(e) => setFormData({ ...formData, previousMajor: e.target.value })}
                  placeholder="علمي، أدبي، إدارة أعمال..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  مستوى اللغة الإنجليزية
                </label>
                <select
                  value={formData.languageLevel}
                  onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="A1">مبتدئ (A1)</option>
                  <option value="A2">أساسي (A2)</option>
                  <option value="B1">متوسط (B1)</option>
                  <option value="B2">فوق المتوسط (B2)</option>
                  <option value="C1">متقدم (C1)</option>
                  <option value="Fluent">طلاقة كاملة (Native/Fluent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  درجة IELTS أو TOEFL (إن توفرت)
                </label>
                <input
                  type="text"
                  value={formData.ieltsToeflScore}
                  onChange={(e) => setFormData({ ...formData, ieltsToeflScore: e.target.value })}
                  placeholder="IELTS 6.5 / Duolingo 110"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Study Goals */}
          {activeTab === "goals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  التخصص المرغوب
                </label>
                <input
                  type="text"
                  value={formData.desiredMajor}
                  onChange={(e) => setFormData({ ...formData, desiredMajor: e.target.value })}
                  placeholder="هندسة برمجيات، طب بشري، إدارة..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الوجهة / الدولة المرغوبة
                </label>
                <input
                  type="text"
                  value={formData.desiredCountry}
                  onChange={(e) => setFormData({ ...formData, desiredCountry: e.target.value })}
                  placeholder="Spain, Germany, UK, Malta, Turkey..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  المرحلة الدراسية المطلوبة
                </label>
                <select
                  value={formData.targetLevel}
                  onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="bachelor">بكالوريوس (Bachelor)</option>
                  <option value="master">ماجستير (Master)</option>
                  <option value="phd">دكتوراه (PhD)</option>
                  <option value="language">دورة لغة (Language Course)</option>
                  <option value="foundation">سنة تحضيرية (Foundation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الميزانية السنوية التقديرية
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="8000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  عملة الميزانية
                </label>
                <select
                  value={formData.budgetCurrency}
                  onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="GBP">جنيه إسترليني (GBP)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  فصل الالتحاق المستهدف (Intake)
                </label>
                <input
                  type="text"
                  value={formData.intake}
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                  placeholder="Fall 2026, Spring 2027..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CRM Management */}
          {activeTab === "crm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  حالة الملف
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="new">جديد (New)</option>
                  <option value="active">نشط وقيد المتابعة (Active)</option>
                  <option value="accepted">حاصل على قبول (Accepted)</option>
                  <option value="visa_stage">مرحلة التأشيرة (Visa Stage)</option>
                  <option value="travelled">سافر للوجهة (Travelled)</option>
                  <option value="cancelled">ملغي (Cancelled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  المستشار الأكاديمي المسؤول
                </label>
                <select
                  value={formData.counselorId}
                  onChange={(e) => setFormData({ ...formData, counselorId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="">-- اختار المستشار --</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الفرع المسؤول
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="">-- اختار الفرع --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  مصدر استقطاب الطالب (Lead Source)
                </label>
                <select
                  value={formData.leadSourceId}
                  onChange={(e) => setFormData({ ...formData, leadSourceId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="">-- غير محدد --</option>
                  {leadSources.map((ls) => (
                    <option key={ls.id} value={ls.id}>
                      {ls.nameAr || ls.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ملاحظات وتوجيهات أولية
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي معلومات هامة عن رغبة الطالب، مواعيد التقديم، أو وضع التأشيرة..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{student ? "حفظ التعديلات" : "تسجيل الطالب"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
