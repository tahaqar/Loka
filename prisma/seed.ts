import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Amalon CRM database seeding...");

  // 1. Branches
  const cairoHq = await prisma.branch.upsert({
    where: { code: "CAI-HQ" },
    update: {},
    create: {
      code: "CAI-HQ",
      name: "Cairo Headquarters (المقر الرئيسي - القاهرة)",
      city: "Cairo",
      country: "Egypt",
      address: "Nasr City, Abbas El Akkad St., Tower 12, Floor 4",
      phone: "+20 100 234 5678",
      email: "cairo@amalon.com",
      isHeadquarter: true,
      isActive: true,
    },
  });

  const istanbulBranch = await prisma.branch.upsert({
    where: { code: "IST-01" },
    update: {},
    create: {
      code: "IST-01",
      name: "Istanbul Branch (فرع إسطنبول)",
      city: "Istanbul",
      country: "Turkey",
      address: "Sisli, Mecidiyekoy Plaza, Istanbul",
      phone: "+90 530 111 2233",
      email: "istanbul@amalon.com",
      isHeadquarter: false,
      isActive: true,
    },
  });

  const dubaiBranch = await prisma.branch.upsert({
    where: { code: "DXB-01" },
    update: {},
    create: {
      code: "DXB-01",
      name: "Dubai Branch (فرع دبي)",
      city: "Dubai",
      country: "UAE",
      address: "Business Bay, Iris Bay Tower, Office 802",
      phone: "+971 50 888 9900",
      email: "dubai@amalon.com",
      isHeadquarter: false,
      isActive: true,
    },
  });

  const baghdadBranch = await prisma.branch.upsert({
    where: { code: "BGD-01" },
    update: {},
    create: {
      code: "BGD-01",
      name: "Baghdad Branch (فرع بغداد)",
      city: "Baghdad",
      country: "Iraq",
      address: "Al-Mansour, 14th Ramadan Street",
      phone: "+964 770 123 4567",
      email: "baghdad@amalon.com",
      isHeadquarter: false,
      isActive: true,
    },
  });

  // 2. Roles
  const rolesData = [
    { name: "admin", displayName: "مدير النظام (Admin)", description: "Full system administration access", isSystem: true },
    { name: "manager", displayName: "مدير فرع (Branch Manager)", description: "Branch management and operational reports", isSystem: true },
    { name: "admission_officer", displayName: "مسؤول قبولات (Admission Officer)", description: "Application processing and university admissions", isSystem: true },
    { name: "visa_officer", displayName: "مسؤول تأشيرات (Visa Officer)", description: "Embassy files, visa appointments, and tracking", isSystem: true },
    { name: "accountant", displayName: "محاسب مالي (Accountant)", description: "Payments, installments, contracts, and commissions", isSystem: true },
    { name: "counselor", displayName: "مستشار طلابي (Student Counselor)", description: "Handles assigned students, leads, and follow-ups", isSystem: true },
  ];

  const rolesMap = new Map();
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: r,
    });
    rolesMap.set(r.name, role);
  }

  // 3. Permissions
  const modules = [
    "students",
    "applications",
    "documents",
    "visa",
    "payments",
    "commissions",
    "countries",
    "universities",
    "tasks",
    "communications",
    "reports",
    "users",
    "settings",
  ];
  const actions = ["view", "create", "edit", "delete", "export"];

  const adminRole = rolesMap.get("admin");

  for (const mod of modules) {
    for (const action of actions) {
      const permName = `${mod}:${action}`;
      const perm = await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: {
          name: permName,
          module: mod,
          action,
          description: `Permission to ${action} ${mod}`,
        },
      });

      // Give admin all permissions
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 4. Users (Admin + Staff)
  const passwordHash = await bcrypt.hash("Admin123456!", 10);
  const counselorPass = await bcrypt.hash("Counselor123!", 10);
  const visaPass = await bcrypt.hash("Visa123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@amalon.com" },
    update: {},
    create: {
      name: "Ahmed Al-Amalon (مدير النظام)",
      email: "admin@amalon.com",
      passwordHash,
      phone: "+20 100 000 0001",
      roleId: adminRole.id,
      branchId: cairoHq.id,
      isActive: true,
    },
  });

  const counselorUser = await prisma.user.upsert({
    where: { email: "counselor@amalon.com" },
    update: {},
    create: {
      name: "Sarah Ahmed (مستشارة القبول)",
      email: "counselor@amalon.com",
      passwordHash: counselorPass,
      phone: "+20 100 000 0002",
      roleId: rolesMap.get("counselor").id,
      branchId: cairoHq.id,
      isActive: true,
    },
  });

  const visaUser = await prisma.user.upsert({
    where: { email: "visa@amalon.com" },
    update: {},
    create: {
      name: "Omar Khaled (مسؤول التأشيرات)",
      email: "visa@amalon.com",
      passwordHash: visaPass,
      phone: "+20 100 000 0003",
      roleId: rolesMap.get("visa_officer").id,
      branchId: cairoHq.id,
      isActive: true,
    },
  });

  // 5. 11 Countries
  const countriesData = [
    {
      code: "ES",
      nameAr: "إسبانيا",
      nameEn: "Spain",
      flagEmoji: "🇪🇸",
      currencyCode: "EUR",
      visaRequirements: "مطلوب كشف حساب بنكي (حوالي 8000 يورو)، فيش جنائي ممهر ومترجم للإسبانية، شهادة طبية، قبول جامعي رسمي، تأمين صحي شامل من شركة إسبانية معتمدة (مثل Sanitas). موعد في BLS International.",
      admissionRequirements: "شهادة الثانوية العامة موثقة من الخارجية والعدل + تعديل الشهادة (Homologation) + اجتياز اختبار PCE / Selectividad إن لزم لبعض الجامعات الحكومية.",
      languageRequirements: "للدراسة بالإنجليزية: IELTS 6.0 أو B2. للدراسة بالإسبانية: DELE/SIELE B2.",
      checklistNotes: "يجب تقديم ملف الفيزا قبل 60-90 يوماً من موعد بدء الدراسة.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "MT",
      nameAr: "مالطا",
      nameEn: "Malta",
      flagEmoji: "🇲🇹",
      currencyCode: "EUR",
      visaRequirements: "فيزا شنغن طالب مالطية عبر VFS Global. متطلبات: كشف حساب بنكي لـ 6 أشهر، إيصال دفع الرسوم الدراسية كاملاً أو جزئياً، حجز سكن معتمد، تأمين سفر يغطي 30 ألف يورو.",
      admissionRequirements: "شهادة الثانوية العامة أو البكالوريوس مع كشف الدرجات مترجمة للإنجليزية.",
      languageRequirements: "شهادة إجادة لغة إنجليزية IELTS 5.5 أو اختبار قبول من المعهد/الجامعة الشريكة.",
      checklistNotes: "وجهة ممتازة لكورسات اللغة الإنجليزية والجامعات البريطانية في مالطا.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "DE",
      nameAr: "ألمانيا",
      nameEn: "Germany",
      flagEmoji: "🇩🇪",
      currencyCode: "EUR",
      visaRequirements: "حساب بنكي مغلق (Blocked Account / Sperrkonto) بقيمة 11,904 يورو سنوياً عبر Coracle أو Expatrio، تأمين صحي، قبول جامعي أو خطاب دعوة سنة تحضيرية (Studienkolleg).",
      admissionRequirements: "شهادة الثانوية العامة مؤهلة حسب قاعدة بيانات Anabin، وفي حال عدم التأهيل المباشر يلزم دراسة سنة تحضيرية (Studienkolleg) واختبار FSP.",
      languageRequirements: "للبرامج الألمانية: Goethe / Telc / TestDaF B2/C1. للبرامج الإنجليزية: IELTS 6.5.",
      checklistNotes: "مواعيد السفارة الألمانية تتطلب الحجز المبكر عبر قائمة الانتظار.",
      responsibleStaff: "Omar Khaled",
    },
    {
      code: "GB",
      nameAr: "المملكة المتحدة",
      nameEn: "United Kingdom",
      flagEmoji: "🇬🇧",
      currencyCode: "GBP",
      visaRequirements: "Student Visa (CAS Letter من الجامعة)، كشف حساب بنكي يغطي الرسوم المتبقية + 9,207 إلى 12,006 جنيه إسترليني للمعيشة لمدة 28 يوماً متتالية، فحص السل (TB Test).",
      admissionRequirements: "شهادة الثانوية العامة / البكالوريوس بتقدير جيد، خطابين توصية، خطاب الغرض من الدراسة (Personal Statement)، سيرة ذاتية.",
      languageRequirements: "IELTS for UKVI بدرجة 6.0 إلى 6.5 مع عدم انخفاض أي قسم عن 5.5.",
      checklistNotes: "إصدار الـ CAS يتطلب دفع الوديعة (Deposit) للجامعة.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "TR",
      nameAr: "تركيا",
      nameEn: "Turkey",
      flagEmoji: "🇹🇷",
      currencyCode: "TRY",
      visaRequirements: "فيزا طالب إلكترونية أو عبر Gateway Management (VFS تركيا). كشف حساب بنكي بسيط، قبول نهائي، إيصال السداد، عقد إيجار أو حجز فندقي مبدئي.",
      admissionRequirements: "قبول فوري في الجامعات الخاصة الشريكة (بهتشه شهير، ميديبول، ألتن باش، أيدن، استينيا) بدون اختبارات قدرات أو يوس.",
      languageRequirements: "IELTS أو توفل أو اجتياز اختبار المعافاة اللغوية للجامعة (English Proficiency Exam).",
      checklistNotes: "عمولات سريعة وإجراءات قبول خلال 48 ساعة للجامعات الخاصة الشريكة.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "RU",
      nameAr: "روسيا",
      nameEn: "Russia",
      flagEmoji: "🇷🇺",
      currencyCode: "RUB",
      visaRequirements: "دعوة إلكترونية رسمية من وزارة الداخلية الروسية (MVD Invitation)، شهادة خلو من الإيدز (HIV Test)، فحص طبي معتمد، ترجمة الوثائق للروسية وتصديق القنصلية.",
      admissionRequirements: "شهادة الثانوية العامة مترجمة ومصدقة للروسية.",
      languageRequirements: "لا تشترط لغة مسبقة؛ يدرس الطالب سنة تحضيرية للغة الروسية (Podfak). البرامج الإنجليزية تتطلب مقابلة بسيطة.",
      checklistNotes: "دعوة وزارة الداخلية تستغرق عادة من 30 إلى 45 يوماً.",
      responsibleStaff: "Omar Khaled",
    },
    {
      code: "UA",
      nameAr: "أوكرانيا",
      nameEn: "Ukraine",
      flagEmoji: "🇺🇦",
      currencyCode: "USD",
      visaRequirements: "دعوة دراسية صادرة من المركز الأوكراني للتعليم الدولي، تأمين صحي، كشف حساب.",
      admissionRequirements: "شهادة الثانوية العامة مترجمة ومصدقة.",
      languageRequirements: "سنة تحضيرية أو برامج باللغة الإنجليزية.",
      checklistNotes: "برامج دراسة أونلاين وتحويلات متوفرة للجامعات المعتمدة.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "BY",
      nameAr: "بيلاروسيا",
      nameEn: "Belarus",
      flagEmoji: "🇧🇾",
      currencyCode: "USD",
      visaRequirements: "دعوة دراسية معتمدة من إدارة الهجرة في بيلاروسيا، فيزا عند الوصول في مطار مينسك أو من السفارة، فحص طبي شامل، شهادة خلو من الإيدز.",
      admissionRequirements: "الشهادة الثانوية مع كشف الدرجات مترجمة للروسية ومصدقة.",
      languageRequirements: "سنة لغة تحضيرية في مينسك قبل بدء التخصص الجامعي.",
      checklistNotes: "وجهة مفضلة لدراسة الطب وطب الأسنان والهندسة بتكاليف اقتصادية.",
      responsibleStaff: "Omar Khaled",
    },
    {
      code: "CY",
      nameAr: "قبرص",
      nameEn: "Cyprus",
      flagEmoji: "🇨🇾",
      currencyCode: "EUR",
      visaRequirements: "فيزا طالب عبر قنصلية قبرص أو موافقة الهجرة القبرصية المسبقة، كشف حساب بنكي، كشف جنائي، شهادة صحية (دم وأشعة صدرية).",
      admissionRequirements: "شهادة الثانوية أو البكالوريوس مع كشف الدرجات.",
      languageRequirements: "لغة إنجليزية IELTS 5.5 أو اختبار قبول جامعي مجاني.",
      checklistNotes: "تشمل جامعات قبرص الشمالية (CIU, EMU) وقبرص الأوروبية (EUC, Nicosia).",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "MY",
      nameAr: "ماليزيا",
      nameEn: "Malaysia",
      flagEmoji: "🇲🇾",
      currencyCode: "USD",
      visaRequirements: "تأشيرة الطالب المعتمدة عبر منظمة EMGS (Education Malaysia Global Services) بنسبة إنجاز 100% لإصدار الـ VAL (Visa Approval Letter).",
      admissionRequirements: "شهادة الثانوية العامة بتقدير جيد، جواز سفر صالح لأكثر من 18 شهراً.",
      languageRequirements: "IELTS 5.0 - 6.0 أو دراسة دورة لغة إنجليزية في الجامعة التابعة.",
      checklistNotes: "تعد ماليزيا من أسهل الوجهات في إجراءات التأشيرة عبر منصة EMGS الحكومية.",
      responsibleStaff: "Sarah Ahmed",
    },
    {
      code: "EG",
      nameAr: "مصر",
      nameEn: "Egypt",
      flagEmoji: "🇪🇬",
      currencyCode: "USD",
      visaRequirements: "إقامة طالب عبر مصلحة الجوازات بعد القبول في منصة ادرس في مصر (Wafeden) أو الجامعات الدولية الخاصة.",
      admissionRequirements: "شهادة الثانوية العامة مصدقة من الخارجية والسفارة المصرية، معادلة المجلس الأعلى للجامعات.",
      languageRequirements: "حسب لغة البرنامج؛ متوفر باللغتين العربية والإنجليزية.",
      checklistNotes: "مركز إقليمي للطلاب الوافدين من الخليج والسودان والعراق وليبيا والأردن.",
      responsibleStaff: "Sarah Ahmed",
    },
  ];

  const countriesMap = new Map();
  for (const c of countriesData) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    countriesMap.set(c.code, country);
  }

  // 6. 14 Kanban Stages
  const kanbanStagesData = [
    { order: 1, slug: "new_applications", nameAr: "طلبات جديدة", nameEn: "New Applications", color: "#3b82f6", isDefault: true },
    { order: 2, slug: "documents_required", nameAr: "مستندات مطلوبة", nameEn: "Documents Required", color: "#f59e0b" },
    { order: 3, slug: "documents_complete", nameAr: "اكتمال المستندات", nameEn: "Documents Complete", color: "#10b981" },
    { order: 4, slug: "ready_to_submit", nameAr: "جاهز للتقديم", nameEn: "Ready to Submit", color: "#06b6d4" },
    { order: 5, slug: "submitted", nameAr: "تم التقديم", nameEn: "Submitted", color: "#6366f1" },
    { order: 6, slug: "awaiting_acceptance", nameAr: "بانتظار القبول", nameEn: "Awaiting Acceptance", color: "#8b5cf6" },
    { order: 7, slug: "conditional_acceptance", nameAr: "قبول مشروط", nameEn: "Conditional Acceptance", color: "#ec4899" },
    { order: 8, slug: "final_acceptance", nameAr: "قبول نهائي", nameEn: "Final Acceptance", color: "#14b8a6" },
    { order: 9, slug: "visa_file", nameAr: "ملف التأشيرة", nameEn: "Visa File", color: "#eab308" },
    { order: 10, slug: "embassy_appointment", nameAr: "موعد السفارة", nameEn: "Embassy Appointment", color: "#f97316" },
    { order: 11, slug: "awaiting_visa", nameAr: "بانتظار التأشيرة", nameEn: "Awaiting Visa", color: "#a855f7" },
    { order: 12, slug: "visa_issued", nameAr: "صدور التأشيرة", nameEn: "Visa Issued", color: "#22c55e" },
    { order: 13, slug: "ready_to_travel", nameAr: "جاهز للسفر", nameEn: "Ready to Travel", color: "#0ea5e9" },
    { order: 14, slug: "student_arrived", nameAr: "وصول الطالب", nameEn: "Student Arrived", color: "#15803d", isTerminal: true },
  ];

  const stagesMap = new Map();
  for (const s of kanbanStagesData) {
    const stage = await prisma.kanbanStage.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    stagesMap.set(s.slug, stage);
  }

  // 7. Currencies
  const currenciesData = [
    { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$", isBase: true, rateToBase: 1.0 },
    { code: "EUR", nameAr: "يورو أوروبي", nameEn: "Euro", symbol: "€", isBase: false, rateToBase: 1.08 },
    { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbol: "£", isBase: false, rateToBase: 1.28 },
    { code: "TRY", nameAr: "ليرة تركية", nameEn: "Turkish Lira", symbol: "₺", isBase: false, rateToBase: 0.029 },
    { code: "RUB", nameAr: "روبل روسي", nameEn: "Russian Ruble", symbol: "₽", isBase: false, rateToBase: 0.011 },
    { code: "HUF", nameAr: "فورنت مجري", nameEn: "Hungarian Forint", symbol: "Ft", isBase: false, rateToBase: 0.0027 },
    { code: "IQD", nameAr: "دينار عراقي", nameEn: "Iraqi Dinar", symbol: "ع.د", isBase: false, rateToBase: 0.00076 },
  ];

  const currenciesMap = new Map();
  for (const curr of currenciesData) {
    const c = await prisma.currency.upsert({
      where: { code: curr.code },
      update: curr,
      create: curr,
    });
    currenciesMap.set(curr.code, c);
  }

  // 8. Lead Sources
  const leadSourcesData = [
    { code: "instagram", nameAr: "إنستغرام (Instagram)", nameEn: "Instagram", color: "#e1306c" },
    { code: "facebook", nameAr: "فيسبوك (Facebook)", nameEn: "Facebook", color: "#1877f2" },
    { code: "tiktok", nameAr: "تيك توك (TikTok)", nameEn: "TikTok", color: "#000000" },
    { code: "whatsapp_direct", nameAr: "واتساب مباشر (WhatsApp)", nameEn: "WhatsApp Direct", color: "#25d366" },
    { code: "referral_friend", nameAr: "توصية من صديق / طالب سابق", nameEn: "Student Referral", color: "#10b981" },
    { code: "website", nameAr: "الموقع الإلكتروني (Website)", nameEn: "Website", color: "#6366f1" },
    { code: "education_fair", nameAr: "معرض تعليمي (Education Fair)", nameEn: "Education Fair", color: "#f59e0b" },
    { code: "partner_agent", nameAr: "وكيل فرعي شريك (Partner Agent)", nameEn: "Sub-Agent", color: "#8b5cf6" },
  ];

  const leadSourcesMap = new Map();
  for (const src of leadSourcesData) {
    const s = await prisma.leadSource.upsert({
      where: { code: src.code },
      update: src,
      create: src,
    });
    leadSourcesMap.set(src.code, s);
  }

  // 9. Document Types
  const documentTypesData = [
    // Personal
    { code: "passport", nameAr: "جواز السفر", nameEn: "Passport", category: "personal", isRequired: true },
    { code: "personal_photo", nameAr: "صورة شخصية (خلفية بيضاء)", nameEn: "Personal Photo", category: "personal", isRequired: true },
    { code: "national_id", nameAr: "بطاقة الهوية الوطنية", nameEn: "National ID", category: "personal", isRequired: false },
    { code: "birth_cert", nameAr: "شهادة الميلاد", nameEn: "Birth Certificate", category: "personal", isRequired: false },

    // Academic
    { code: "high_school_cert", nameAr: "شهادة الثانوية العامة", nameEn: "High School Certificate", category: "academic", isRequired: true },
    { code: "high_school_trans", nameAr: "كشف درجات الثانوية", nameEn: "High School Transcript", category: "academic", isRequired: true },
    { code: "bachelor_degree", nameAr: "شهادة البكالوريوس", nameEn: "Bachelor Degree", category: "academic", isRequired: false },
    { code: "bachelor_trans", nameAr: "كشف درجات البكالوريوس", nameEn: "Bachelor Transcript", category: "academic", isRequired: false },
    { code: "motivation_letter", nameAr: "خطاب الغرض من الدراسة (SOP)", nameEn: "Motivation Letter", category: "academic", isRequired: false },
    { code: "recommendation_letter", nameAr: "خطاب توصية أكاديمي", nameEn: "Recommendation Letter", category: "academic", isRequired: false },
    { code: "cv_resume", nameAr: "السيرة الذاتية (CV)", nameEn: "CV / Resume", category: "academic", isRequired: false },

    // Language
    { code: "ielts_toefl", nameAr: "شهادة آيلتس / توفل", nameEn: "IELTS / TOEFL Certificate", category: "language", isRequired: false },
    { code: "german_cert", nameAr: "شهادة لغة ألمانية (Goethe/Telc)", nameEn: "German Language Certificate", category: "language", isRequired: false },
    { code: "spanish_cert", nameAr: "شهادة لغة إسبانية (DELE/SIELE)", nameEn: "Spanish Language Certificate", category: "language", isRequired: false },

    // Visa
    { code: "bank_statement", nameAr: "كشف حساب بنكي (Bank Statement)", nameEn: "Bank Statement", category: "visa", isRequired: true },
    { code: "health_insurance", nameAr: "وثيقة تأمين صحي دولي", nameEn: "Health Insurance", category: "visa", isRequired: true },
    { code: "criminal_record", nameAr: "فيش جنائي / حسن سيرة وسلوك", nameEn: "Criminal Record Check", category: "visa", isRequired: true },
    { code: "acceptance_letter", nameAr: "خطاب القبول الجامعي الرسمي", nameEn: "University Acceptance Letter", category: "visa", isRequired: true },
    { code: "accommodation_proof", nameAr: "إثبات حجز السكن", nameEn: "Accommodation Proof", category: "visa", isRequired: false },
    { code: "flight_reservation", nameAr: "حجز طيران مبدئي", nameEn: "Flight Reservation", category: "visa", isRequired: false },
  ];

  const docTypesMap = new Map();
  for (const dt of documentTypesData) {
    const doc = await prisma.documentType.upsert({
      where: { code: dt.code },
      update: dt,
      create: dt,
    });
    docTypesMap.set(dt.code, doc);
  }

  // 10. Message Templates (WhatsApp / Email)
  const templatesData = [
    {
      code: "welcome_lead",
      nameAr: "رسالة ترحيبية بطالب جديد",
      nameEn: "Welcome New Student",
      channel: "whatsapp",
      variables: "{student_name}, {counselor_name}, {branch_name}",
      contentAr: "أهلاً بك يا {student_name} في شركة أمالون للدراسة بالخارج! 🎓 معكم المستشار {counselor_name} من {branch_name}. يسعدنا مرافقتك في رحلتك الجامعية. هل يمكننا مراجعة الوجهات المفضلة لديك والتخصص المطلوب؟",
      contentEn: "Welcome {student_name} to Amalon International Education! 🎓 This is your counselor {counselor_name} from {branch_name}. We look forward to guiding your university journey.",
    },
    {
      code: "doc_request",
      nameAr: "طلب استكمال المستندات الناقصة",
      nameEn: "Missing Documents Request",
      channel: "whatsapp",
      variables: "{student_name}, {university_name}, {missing_docs}",
      contentAr: "مرحباً {student_name}، نتمنى لك يوماً سعيداً! لمتابعة ملف تقديمك إلى {university_name}، نرجو منك التكرم بإرسال المستندات التالية في أقرب وقت: {missing_docs}. شكراً لتعاونكم معنا.",
      contentEn: "Dear {student_name}, to proceed with your application to {university_name}, kindly send the following documents: {missing_docs}.",
    },
    {
      code: "acceptance_congrats",
      nameAr: "تهنئة بصدور القبول الجامعي",
      nameEn: "Acceptance Congratulations",
      channel: "whatsapp",
      variables: "{student_name}, {university_name}, {major_name}, {country_name}",
      contentAr: "ألف مبارك يا {student_name}! 🥳🎉 يسر فريق أمالون إبلاغك بصدور قبولك الجامعي في جامعة {university_name} لدراسة تخصص {major_name} في {country_name}! سنبدأ الآن فوراً بتجهيز ملف التأشيرة الخاص بك.",
      contentEn: "Congratulations {student_name}! 🥳🎉 Amalon team is delighted to announce your admission offer at {university_name} for {major_name} in {country_name}!",
    },
    {
      code: "embassy_reminder",
      nameAr: "تذكير بموعد مقابلة السفارة",
      nameEn: "Embassy Appointment Reminder",
      channel: "whatsapp",
      variables: "{student_name}, {embassy_name}, {appointment_date}, {appointment_time}",
      contentAr: "تذكير هام يا {student_name}: موعد مقابلتك لدى {embassy_name} سيكون بتاريخ {appointment_date} الساعة {appointment_time}. نرجو تجهيز أصول الوثائق وجواز السفر والحضور قبل الموعد بنصف ساعة.",
      contentEn: "Reminder for {student_name}: Your embassy appointment at {embassy_name} is scheduled on {appointment_date} at {appointment_time}.",
    },
    {
      code: "payment_receipt",
      nameAr: "تأكيد استلام دفعة مالية",
      nameEn: "Payment Received Confirmation",
      channel: "whatsapp",
      variables: "{student_name}, {amount}, {currency}, {receipt_number}, {remaining}",
      contentAr: "عزيزي {student_name}، تم استلام دفعة بقيمة {amount} {currency} بنجاح تحت إيصال رقم {receipt_number}. المبلغ المتبقي: {remaining} {currency}. تجدون سند القبض الرسمي مرفقاً.",
      contentEn: "Dear {student_name}, payment of {amount} {currency} has been received under receipt #{receipt_number}. Remaining: {remaining} {currency}.",
    },
  ];

  for (const tpl of templatesData) {
    await prisma.messageTemplate.upsert({
      where: { code: tpl.code },
      update: tpl,
      create: tpl,
    });
  }

  // 11. Universities and Programs
  const spain = countriesMap.get("ES");
  const germany = countriesMap.get("DE");
  const turkey = countriesMap.get("TR");
  const malta = countriesMap.get("MT");
  const uk = countriesMap.get("GB");
  const malaysia = countriesMap.get("MY");

  const uc3m = await prisma.university.upsert({
    where: { id: "uni-uc3m-spain" },
    update: {},
    create: {
      id: "uni-uc3m-spain",
      nameAr: "جامعة كارلوس الثالث في مدريد",
      nameEn: "Universidad Carlos III de Madrid (UC3M)",
      countryId: spain.id,
      city: "Madrid",
      type: "university",
      website: "https://www.uc3m.es",
      contactPerson: "Elena Martinez",
      contactEmail: "international@uc3m.es",
      contactPhone: "+34 91 624 9500",
      responsibleStaff: "Sarah Ahmed",
      commissionType: "percentage",
      commissionValue: 15.0,
      commissionCurrency: "EUR",
      contractStatus: "active",
      contractStartDate: new Date("2024-01-01"),
      contractEndDate: new Date("2027-12-31"),
    },
  });

  const tum = await prisma.university.upsert({
    where: { id: "uni-tum-germany" },
    update: {},
    create: {
      id: "uni-tum-germany",
      nameAr: "جامعة ميونخ التقنية",
      nameEn: "Technical University of Munich (TUM)",
      countryId: germany.id,
      city: "Munich",
      type: "university",
      website: "https://www.tum.de",
      contactPerson: "Dr. Klaus Weber",
      contactEmail: "studium@tum.de",
      contactPhone: "+49 89 289 01",
      responsibleStaff: "Omar Khaled",
      commissionType: "fixed",
      commissionValue: 500.0,
      commissionCurrency: "EUR",
      contractStatus: "active",
      contractStartDate: new Date("2024-06-01"),
      contractEndDate: new Date("2026-12-31"),
    },
  });

  const bahcesehir = await prisma.university.upsert({
    where: { id: "uni-bau-turkey" },
    update: {},
    create: {
      id: "uni-bau-turkey",
      nameAr: "جامعة بهتشه شهير",
      nameEn: "Bahçeşehir University (BAU)",
      countryId: turkey.id,
      city: "Istanbul",
      type: "university",
      website: "https://bau.edu.tr",
      contactPerson: "Burak Yilmaz",
      contactEmail: "int-admissions@bau.edu.tr",
      contactPhone: "+90 212 381 0000",
      responsibleStaff: "Sarah Ahmed",
      commissionType: "percentage",
      commissionValue: 20.0,
      commissionCurrency: "USD",
      contractStatus: "active",
      contractStartDate: new Date("2024-01-01"),
      contractEndDate: new Date("2028-01-01"),
    },
  });

  const medipol = await prisma.university.upsert({
    where: { id: "uni-medipol-turkey" },
    update: {},
    create: {
      id: "uni-medipol-turkey",
      nameAr: "جامعة إسطنبول ميدي بول",
      nameEn: "Istanbul Medipol University",
      countryId: turkey.id,
      city: "Istanbul",
      type: "university",
      website: "https://medipol.edu.tr",
      contactPerson: "Canan Demir",
      contactEmail: "international@medipol.edu.tr",
      contactPhone: "+90 216 681 5000",
      responsibleStaff: "Sarah Ahmed",
      commissionType: "percentage",
      commissionValue: 25.0,
      commissionCurrency: "USD",
      contractStatus: "active",
      contractStartDate: new Date("2024-01-01"),
      contractEndDate: new Date("2027-12-31"),
    },
  });

  // Programs
  await prisma.program.upsert({
    where: { id: "prog-uc3m-cs" },
    update: {},
    create: {
      id: "prog-uc3m-cs",
      universityId: uc3m.id,
      nameAr: "بكالوريوس علوم الحاسوب (باللغة الإنجليزية)",
      nameEn: "Bachelor in Computer Science and Engineering",
      level: "bachelor",
      faculty: "School of Engineering",
      durationYears: 4,
      language: "English",
      tuitionFee: 6800,
      currency: "EUR",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog-uc3m-biz" },
    update: {},
    create: {
      id: "prog-uc3m-biz",
      universityId: uc3m.id,
      nameAr: "ماجستير إدارة الأعمال الدولية",
      nameEn: "Master in International Business Administration",
      level: "master",
      faculty: "School of Social Sciences",
      durationYears: 1.5,
      language: "English",
      tuitionFee: 9500,
      currency: "EUR",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog-bau-ai" },
    update: {},
    create: {
      id: "prog-bau-ai",
      universityId: bahcesehir.id,
      nameAr: "بكالوريوس هندسة الذكاء الاصطناعي",
      nameEn: "B.Sc. Artificial Intelligence Engineering",
      level: "bachelor",
      faculty: "Faculty of Engineering & Natural Sciences",
      durationYears: 4,
      language: "English",
      tuitionFee: 7900,
      currency: "USD",
    },
  });

  await prisma.program.upsert({
    where: { id: "prog-medipol-med" },
    update: {},
    create: {
      id: "prog-medipol-med",
      universityId: medipol.id,
      nameAr: "دكتور في الطب البشري (عام)",
      nameEn: "Doctor of General Medicine (M.D.)",
      level: "bachelor",
      faculty: "International School of Medicine",
      durationYears: 6,
      language: "English",
      tuitionFee: 28000,
      currency: "USD",
    },
  });

  // 12. Demo Students with Multiple Applications
  const demoStudent1 = await prisma.student.upsert({
    where: { studentCode: "AML-2026-001" },
    update: {},
    create: {
      studentCode: "AML-2026-001",
      fullNameAr: "زياد طارق المنصوري",
      fullNameEn: "Zeyad Tariq Al-Mansouri",
      nationality: "Egyptian",
      birthDate: new Date("2004-05-14"),
      gender: "male",
      phone: "+201012345678",
      whatsapp: "+201012345678",
      email: "zeyad.mansouri@gmail.com",
      city: "Cairo",
      residenceCountry: "Egypt",
      passportNumberEnc: "A28479102",
      passportExpiry: new Date("2030-08-20"),
      lastCertificate: "High School (General Secondary)",
      gpa: "94.5%",
      previousMajor: "Scientific Section (علمي رياضة)",
      languageLevel: "B2",
      ieltsToeflScore: "IELTS 6.5",
      desiredMajor: "Computer Science & AI",
      desiredCountry: "Spain",
      budget: 8000,
      budgetCurrency: "EUR",
      intake: "Fall 2026",
      targetLevel: "bachelor",
      branchId: cairoHq.id,
      counselorId: counselorUser.id,
      leadSourceId: leadSourcesMap.get("instagram").id,
      status: "active",
      notes: "الطالب متميز وحاصل على آيلتس 6.5، يفضل الدراسة في مدريد بإسبانيا أو إسطنبول.",
    },
  });

  const demoStudent2 = await prisma.student.upsert({
    where: { studentCode: "AML-2026-002" },
    update: {},
    create: {
      studentCode: "AML-2026-002",
      fullNameAr: "مريم عبد الله الراوي",
      fullNameEn: "Maryam Abdullah Al-Rawi",
      nationality: "Iraqi",
      birthDate: new Date("2003-11-20"),
      gender: "female",
      phone: "+9647701122334",
      whatsapp: "+9647701122334",
      email: "maryam.rawi@gmail.com",
      city: "Baghdad",
      residenceCountry: "Iraq",
      passportNumberEnc: "B91028374",
      passportExpiry: new Date("2029-03-15"),
      lastCertificate: "High School",
      gpa: "98.2%",
      previousMajor: "Scientific Section (علمي أحيائي)",
      languageLevel: "B2",
      ieltsToeflScore: "IELTS 7.0",
      desiredMajor: "Medicine / Human Health",
      desiredCountry: "Turkey",
      budget: 25000,
      budgetCurrency: "USD",
      intake: "Fall 2026",
      targetLevel: "bachelor",
      branchId: baghdadBranch.id,
      counselorId: counselorUser.id,
      leadSourceId: leadSourcesMap.get("referral_friend").id,
      status: "accepted",
      notes: "تم استخراج القبول المبدئي في جامعة ميدي بول وجاري إيداع الدفعة الأولى.",
    },
  });

  const demoStudent3 = await prisma.student.upsert({
    where: { studentCode: "AML-2026-003" },
    update: {},
    create: {
      studentCode: "AML-2026-003",
      fullNameAr: "حمزة سامي الكردي",
      fullNameEn: "Hamza Sami Al-Kurdi",
      nationality: "Syrian",
      birthDate: new Date("2001-08-05"),
      gender: "male",
      phone: "+905351234567",
      whatsapp: "+905351234567",
      email: "hamza.kurdi@gmail.com",
      city: "Istanbul",
      residenceCountry: "Turkey",
      passportNumberEnc: "N00481928",
      passportExpiry: new Date("2027-11-10"),
      lastCertificate: "Bachelor in Engineering",
      gpa: "3.4 / 4.0",
      previousMajor: "Mechanical Engineering",
      languageLevel: "C1",
      ieltsToeflScore: "TOEFL iBT 95",
      desiredMajor: "Renewable Energy & Robotics",
      desiredCountry: "Germany",
      budget: 12000,
      budgetCurrency: "EUR",
      intake: "Winter 2026/2027",
      targetLevel: "master",
      branchId: istanbulBranch.id,
      counselorId: counselorUser.id,
      leadSourceId: leadSourcesMap.get("website").id,
      status: "visa_stage",
      notes: "تم فتح الحساب البنكي المغلق (Blocked Account) وبانتظار موعد مقابلة السفارة الألمانية.",
    },
  });

  // Multiple Applications for Student 1 (Spain & Turkey)
  const app1 = await prisma.application.upsert({
    where: { applicationCode: "APP-2026-001" },
    update: {},
    create: {
      applicationCode: "APP-2026-001",
      studentId: demoStudent1.id,
      countryId: spain.id,
      universityId: uc3m.id,
      programId: "prog-uc3m-cs",
      level: "bachelor",
      intake: "Fall 2026",
      stageId: stagesMap.get("conditional_acceptance").id,
      status: "accepted",
      tuitionFee: 6800,
      tuitionCurrency: "EUR",
      applicationFee: 100,
      offerType: "conditional",
      offerExpiry: new Date("2026-11-30"),
      responsibleUserId: counselorUser.id,
      notes: "صدر القبول المشروط بشرط إرسال ترجمة محلفة لشهادة الثانوية العامة.",
    },
  });

  const app2 = await prisma.application.upsert({
    where: { applicationCode: "APP-2026-002" },
    update: {},
    create: {
      applicationCode: "APP-2026-002",
      studentId: demoStudent1.id,
      countryId: turkey.id,
      universityId: bahcesehir.id,
      programId: "prog-bau-ai",
      level: "bachelor",
      intake: "Fall 2026",
      stageId: stagesMap.get("final_acceptance").id,
      status: "accepted",
      tuitionFee: 7900,
      tuitionCurrency: "USD",
      applicationFee: 0,
      offerType: "final",
      offerExpiry: new Date("2026-12-15"),
      responsibleUserId: counselorUser.id,
      notes: "صدر القبول النهائي مع منحة جزئية 30% من الجامعة الشريكة.",
    },
  });

  // Application for Student 2
  const app3 = await prisma.application.upsert({
    where: { applicationCode: "APP-2026-003" },
    update: {},
    create: {
      applicationCode: "APP-2026-003",
      studentId: demoStudent2.id,
      countryId: turkey.id,
      universityId: medipol.id,
      programId: "prog-medipol-med",
      level: "bachelor",
      intake: "Fall 2026",
      stageId: stagesMap.get("final_acceptance").id,
      status: "accepted",
      tuitionFee: 28000,
      tuitionCurrency: "USD",
      applicationFee: 150,
      offerType: "final",
      responsibleUserId: counselorUser.id,
      notes: "تم حجز المقعد الطبي في جامعة ميدي بول.",
    },
  });

  // Application for Student 3 (Germany)
  const app4 = await prisma.application.upsert({
    where: { applicationCode: "APP-2026-004" },
    update: {},
    create: {
      applicationCode: "APP-2026-004",
      studentId: demoStudent3.id,
      countryId: germany.id,
      universityId: tum.id,
      customMajor: "Master in Robotics and Cognition",
      level: "master",
      intake: "Winter 2026",
      stageId: stagesMap.get("embassy_appointment").id,
      status: "in_progress",
      tuitionFee: 1000,
      tuitionCurrency: "EUR",
      responsibleUserId: visaUser.id,
      notes: "موعد السفارة الألمانية محجوز وتم تجهيز ملف الـ Blocked Account بالكامل.",
    },
  });

  // Documents for Student 1
  await prisma.studentDocument.createMany({
    data: [
      {
        studentId: demoStudent1.id,
        documentTypeId: docTypesMap.get("passport").id,
        title: "جواز سفر زياد المنصوري",
        fileUrl: "/uploads/demo/passport-zeyad.pdf",
        fileName: "passport-zeyad.pdf",
        fileSize: 1024 * 650,
        fileMimeType: "application/pdf",
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: counselorUser.name,
        version: 1,
      },
      {
        studentId: demoStudent1.id,
        documentTypeId: docTypesMap.get("high_school_cert").id,
        title: "شهادة الثانوية العامة - مصر",
        fileUrl: "/uploads/demo/high-school-zeyad.pdf",
        fileName: "high-school-zeyad.pdf",
        fileSize: 1024 * 850,
        fileMimeType: "application/pdf",
        status: "in_translation",
        version: 1,
      },
      {
        studentId: demoStudent1.id,
        documentTypeId: docTypesMap.get("ielts_toefl").id,
        title: "شهادة آيلتس 6.5 (Academic)",
        fileUrl: "/uploads/demo/ielts-zeyad.pdf",
        fileName: "ielts-zeyad.pdf",
        fileSize: 1024 * 420,
        fileMimeType: "application/pdf",
        status: "verified",
        verifiedAt: new Date(),
        verifiedBy: counselorUser.name,
        version: 1,
      },
      {
        studentId: demoStudent1.id,
        documentTypeId: docTypesMap.get("bank_statement").id,
        title: "كشف حساب بنكي - بنك مصر",
        fileUrl: "/uploads/demo/bank-statement-zeyad.pdf",
        fileName: "bank-statement-zeyad.pdf",
        fileSize: 1024 * 1200,
        fileMimeType: "application/pdf",
        status: "waiting_for_student",
        version: 1,
      },
    ],
  });

  // Visa Case for Student 3 (Germany)
  const visaCase3 = await prisma.visaCase.upsert({
    where: { caseNumber: "VISA-2026-003" },
    update: {},
    create: {
      caseNumber: "VISA-2026-003",
      studentId: demoStudent3.id,
      countryId: germany.id,
      applicationId: app4.id,
      responsibleOfficerId: visaUser.id,
      status: "appointment_booked",
      embassyLocation: "German Embassy Cairo / VFS",
      appointmentDate: new Date("2026-10-25T09:30:00Z"),
      studyStartDate: new Date("2026-12-01"),
      notes: "تم تأكيد موعد المقابلة يوم 25 أكتوبر، جاري مراجعة خطاب الدافع والفحص الطبي.",
    },
  });

  // Visa Checklist Items for Student 3
  await prisma.visaChecklistItem.createMany({
    data: [
      { visaCaseId: visaCase3.id, nameAr: "خطاب القبول الجامعي الرسمي (Zulassungsbescheid)", nameEn: "Official Admission Letter", isCompleted: true, completedAt: new Date() },
      { visaCaseId: visaCase3.id, nameAr: "الحساب المغلق بـ 11,904 يورو (Coracle/Expatrio)", nameEn: "Blocked Account Confirmation", isCompleted: true, completedAt: new Date() },
      { visaCaseId: visaCase3.id, nameAr: "تأمين صحي ألماني معتمد", nameEn: "Statutory / Incoming Health Insurance", isCompleted: true, completedAt: new Date() },
      { visaCaseId: visaCase3.id, nameAr: "خطاب الدافع والسيرة الذاتية (Motivation Letter)", nameEn: "Motivation Letter & CV", isCompleted: true, completedAt: new Date() },
      { visaCaseId: visaCase3.id, nameAr: "تأكيد موعد المقابلة المطبوع", nameEn: "Appointment Booking Confirmation", isCompleted: true, completedAt: new Date() },
      { visaCaseId: visaCase3.id, nameAr: "أصل جواز السفر وصور شخصية بيومترية", nameEn: "Passport & Biometric Photos", isCompleted: true, completedAt: new Date() },
    ],
  });

  // Contracts and Payments for Student 1
  const contract1 = await prisma.contract.upsert({
    where: { contractNumber: "CTR-2026-001" },
    update: {},
    create: {
      contractNumber: "CTR-2026-001",
      studentId: demoStudent1.id,
      totalAmount: 1800,
      currency: "USD",
      paidAmount: 1000,
      remainingAmount: 800,
      terms: "عقد خدمات دراسة بالخارج واستخراج قبول جامعي وتجهيز ملف التأشيرة الإسبانية.",
      status: "active",
    },
  });

  await prisma.payment.upsert({
    where: { receiptNumber: "REC-2026-001" },
    update: {},
    create: {
      receiptNumber: "REC-2026-001",
      studentId: demoStudent1.id,
      contractId: contract1.id,
      amount: 1000,
      currency: "USD",
      exchangeRate: 1.0,
      baseAmount: 1000,
      method: "cash",
      receiverId: adminUser.id,
      notes: "دفعة أولى (مقدم أتعاب التسجيل والقبول الجامعي) - إيصال رسمي معتمد.",
    },
  });

  // Commission for Bahçeşehir University
  await prisma.universityCommission.upsert({
    where: { referenceNumber: "COM-2026-BAU-001" },
    update: {},
    create: {
      referenceNumber: "COM-2026-BAU-001",
      applicationId: app2.id,
      universityId: bahcesehir.id,
      tuitionPaid: 7900,
      tuitionCurrency: "USD",
      commissionRate: 20.0,
      commissionAmount: 1580,
      currency: "USD",
      status: "expected",
      notes: "عمولة أمالون المستحقة 20% بعد سداد الطالب القسط الدراسي الأول.",
    },
  });

  // Timeline events for Student 1 with color coding
  await prisma.timelineEvent.createMany({
    data: [
      {
        studentId: demoStudent1.id,
        category: "communication",
        titleAr: "تسجيل الطالب عبر إنستغرام",
        titleEn: "Student registered via Instagram lead",
        description: "قام الطالب بملء استمارة الاهتمام بالدراسة في إسبانيا وهندسة الحاسوب.",
        color: "blue",
        actorName: "Sarah Ahmed",
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      },
      {
        studentId: demoStudent1.id,
        category: "payment",
        titleAr: "سداد الدفعة الأولى من العقد",
        titleEn: "First installment paid ($1000)",
        description: "تم تحصيل 1000 دولار نقداً في فرع القاهرة بموجب الإيصال REC-2026-001.",
        color: "green",
        actorName: "Ahmed Al-Amalon",
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
      {
        studentId: demoStudent1.id,
        category: "document",
        titleAr: "التحقق من جواز السفر وشهادة الآيلتس",
        titleEn: "Passport and IELTS verified",
        description: "تمت مراجعة الوثائق واعتمادها بنجاح.",
        color: "green",
        actorName: "Sarah Ahmed",
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        studentId: demoStudent1.id,
        category: "application",
        titleAr: "صدور القبول المشروط من جامعة كارلوس الثالث",
        titleEn: "Conditional acceptance issued by UC3M",
        description: "تم استلام خطاب القبول المشروط بتصديق الشهادة الثانوية.",
        color: "yellow",
        actorName: "Sarah Ahmed",
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ],
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "متابعة كشف الحساب البنكي للطالب زياد المنصوري",
        description: "التواصل مع الطالب للتأكد من استخراج كشف حساب 6 أشهر مختوم للسفارة الإسبانية.",
        priority: "high",
        status: "pending",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        assigneeId: counselorUser.id,
        creatorId: adminUser.id,
        studentId: demoStudent1.id,
      },
      {
        title: "تجهيز أصول المستندات لمقابلة السفارة الألمانية (حمزة الكردي)",
        description: "مراجعة ملف التأشيرة والـ Blocked Account والتأمين الصحي قبل موعد 25 أكتوبر.",
        priority: "urgent",
        status: "in_progress",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        assigneeId: visaUser.id,
        creatorId: adminUser.id,
        studentId: demoStudent3.id,
      },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        titleAr: "موعد سفارة قادم خلال أيام",
        titleEn: "Upcoming Embassy Appointment",
        messageAr: "موعد مقابلة السفارة الألمانية للطالب حمزة الكردي يوم 25 أكتوبر.",
        messageEn: "Embassy appointment for Hamza Al-Kurdi is approaching on Oct 25.",
        type: "embassy_soon",
        linkUrl: `/visa?search=${demoStudent3.studentCode}`,
        isRead: false,
      },
      {
        userId: adminUser.id,
        titleAr: "مستندات بانتظار المراجعة",
        titleEn: "Documents pending review",
        messageAr: "شهادة الثانوية العامة للطالب زياد المنصوري قيد الترجمة والاعتماد.",
        messageEn: "High school certificate for Zeyad is in translation review.",
        type: "missing_doc",
        linkUrl: `/students/${demoStudent1.id}?tab=documents`,
        isRead: false,
      },
      {
        userId: adminUser.id,
        titleAr: "عمولة جامعية مستحقة",
        titleEn: "Unreceived University Commission",
        messageAr: "عمولة بقيمة 1,580 دولار مستحقة من جامعة بهتشه شهير (BAU).",
        messageEn: "Commission of $1,580 expected from Bahçeşehir University.",
        type: "contract_expiry",
        linkUrl: "/commissions",
        isRead: false,
      },
    ],
  });

  // Audit Log demo
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      action: "create",
      entity: "Student",
      entityId: demoStudent1.id,
      details: "تم تسجيل الطالب زياد المنصوري وإنشاء ملف دراسي جديد",
      newValue: JSON.stringify({ studentCode: demoStudent1.studentCode, name: demoStudent1.fullNameAr }),
    },
  });

  console.log("✅ Amalon CRM database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
