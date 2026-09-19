import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand
    siteTitle: "وكيل فيديو",
    siteSubtitle: "إخراج ومونتاج سينمائي متطابق سمعياً وبصرياً",

    // Header & Settings
    settings: "الإعدادات",
    geminiKeys: "مفاتيح Gemini والحسابات",
    geminiKeysDesc: "ضبط مفتاح Gemini وتوكن التيليجرام والحسابات",
    videoSettings: "إعدادات الفيديو",
    videoSettingsDesc: "المدة الزمنية، عدد المشاهد، ونسبة الفيديوهات",
    mcpSettings: "إعدادات MCP",
    mcpSettingsDesc: "ربط خوادم Model Context Protocol الخارجية",
    geminiConnected: "Gemini متصل",
    geminiNotConnected: "مفتاح Gemini مطلوب",
    tabStudio: "الاستوديو",
    tabGuide: "الدليل",

    // Footer
    footerDesignedBy: "تصميم ADIX MEDIA",
    footerText: "وكيل فيديو • متطابق سمعياً وبصرياً بدقة 100%",

    // Story Form
    storyInputTitle: "إدخال القصة والمصادر",
    tabUrl: "رابط القصة (URL)",
    tabText: "نص القصة مباشرة",
    tabAi: "قصة AI (تأليف بالذكاء الاصطناعي)",
    urlPlaceholder: "https://example.com/story... (رابط مقال أو قصة)",
    urlHint: "يدعم مواقع المقالات الإخبارية والمدونات والقصص وموقع كابوس",
    textPlaceholder: "الصق نص القصة هنا أو اكتب ملخص الأحداث بالتفصيل...",
    storyStyle: "الأسلوب السينمائي والسردي:",
    storyLanguage: "لغة الإلقاء والنصوص:",
    targetDuration: "المدة التقديرية للفيديو:",
    minutes: "دقيقة",
    scenesCount: "عدد المشاهد المقترح:",
    sceneWord: "مشهداً",
    videoRatio: "نسبة مقاطع الفيديو Veo:",
    autoGenImages: "توليد الغلاف والصور تلقائياً",
    analyzeBtn: "فحص القصة واقتراح خطة المشاهد والفيديوهات",
    analyzingBtn: "جاري تحليل القصة واقتراح خطة الفيديوهات والصور...",
    generatingBtn: "جاري التوليد الشامل للسيناريو والصور...",
    instantDirectBtn: "توليد فوري ومباشر",
    analyzeTip: "💡 يحلل القصة أولاً ويقترح المدة الزمنية وتوزيع الفيديوهات والصور لمنع الملل قبل استهلاك أي رصيد.",
    quickSample: "أو جرّب قصة نموذجية سريعة:",
    sampleStory1: "سفينة ماري سيلست الغامضة",
    sampleStory2: "منارة إيلان مور المفقودة",
    sampleStory3: "لغز اختفاء طائرة كولونيا",

    // Proposal
    proposalTitle: "خطة الإخراج وتوزيع المشاهد المقترحة",
    proposalBadge: "تحليل ذكي مسبق",
    proposalSubtitle: "تم تحليل عمق القصة وتحديد المدة المثلى وتوزيع مقاطع الفيديو والصور لمنع الملل",
    changeStory: "تغيير القصة",
    estimatedDuration: "المدة التقديرية",
    durationRange: "نطاق السرد: 5 إلى 40 دقيقة",
    totalScenesMetric: "إجمالي المشاهد",
    perSceneWords: "بمعدل 20-35 كلمة صوتية",
    videoScenesMetric: "مشاهد الفيديو Veo",
    videoPeakDesc: "للحظات الذروة والصدمة",
    imageScenesMetric: "مشاهد الصور 4K",
    imageDetailsDesc: "للتفاصيل والوثائق والأجواء",
    retentionTitle: "استراتيجية الحفاظ على المشاهد ومنع الملل (Audience Retention Lock):",
    cadenceTitle: "خريطة التوزيع الزمني التناوبي للمشاهد (Cadence Map):",
    cadenceVideo: "فيديو متحرك",
    cadenceImage: "صورة 4K",
    approveBtn: "✅ اعتماد الخطة والبدء بالاستخراج وتوليد السيناريو والوسائط",
    cancelProposalBtn: "تعديل القصة أو إلغاء",
    toggleCadenceDetails: "عرض خريطة المشاهد بالتفصيل والتعليل السينمائي",
    hideCadenceDetails: "إخفاء التفاصيل الكاملة للمشاهد",

    // Output & Results
    scenesTab: "السيناريو والمشاهد",
    seoTab: "العنوان والوصف والوسوم",
    promptsTab: "أوامر التوليد البصري",
    voiceoverTab: "نص التعليق الصوتي الموحد",
    exportTg: "إرسال إلى Telegram",
    copyScript: "نسخ السيناريو كاملاً",
    downloadJson: "تحميل ملف JSON",
    newStory: "إنتاج قصة جديدة",
  },
  en: {
    // Brand
    siteTitle: "Video Agent",
    siteSubtitle: "Autonomous Documentary Director & Audio-Visual Production",

    // Header & Settings
    settings: "Settings",
    geminiKeys: "Gemini Keys & Accounts",
    geminiKeysDesc: "Configure Gemini API keys, Telegram token & accounts",
    videoSettings: "Video Settings",
    videoSettingsDesc: "Target duration, scene count, video ratio & style",
    mcpSettings: "MCP Settings",
    mcpSettingsDesc: "Connect external Model Context Protocol servers",
    geminiConnected: "Gemini Connected",
    geminiNotConnected: "Gemini Key Required",
    tabStudio: "Studio",
    tabGuide: "Guide",

    // Footer
    footerDesignedBy: "Designed by ADIX MEDIA",
    footerText: "Video Agent • 100% Audio-Visual Synchronized Production",

    // Story Form
    storyInputTitle: "Story Input & Sources",
    tabUrl: "Story URL",
    tabText: "Direct Text",
    tabAi: "AI Story Creator",
    urlPlaceholder: "https://example.com/story... (Article or blog URL)",
    urlHint: "Supports news articles, history blogs, investigative pieces, and stories",
    textPlaceholder: "Paste your story text or write detailed plot points here...",
    storyStyle: "Narrative & Cinematic Style:",
    storyLanguage: "Voiceover & Story Language:",
    targetDuration: "Estimated Video Duration:",
    minutes: "min",
    scenesCount: "Proposed Scene Count:",
    sceneWord: "scenes",
    videoRatio: "Veo Video Ratio:",
    autoGenImages: "Auto-generate thumbnail & initial scene images",
    analyzeBtn: "Analyze Story & Propose Production Plan",
    analyzingBtn: "Analyzing narrative density & cadence proposal...",
    generatingBtn: "Generating script, visual prompts & media...",
    instantDirectBtn: "Instant Direct Generation",
    analyzeTip: "💡 Analyzes story first and proposes duration & video-to-image cadence to prevent boredom before spending any quota.",
    quickSample: "Or load a sample mystery story:",
    sampleStory1: "The Mary Celeste Mystery",
    sampleStory2: "Eilean Mor Lighthouse Mystery",
    sampleStory3: "Colonia Air Disaster Enigma",

    // Proposal
    proposalTitle: "Proposed Production Plan & Visual Cadence",
    proposalBadge: "Pre-Production AI Analysis",
    proposalSubtitle: "Story depth analyzed; duration & video/image alternation optimized to prevent viewer boredom",
    changeStory: "Change Story",
    estimatedDuration: "Estimated Duration",
    durationRange: "Range: 5 to 40 minutes",
    totalScenesMetric: "Total Scenes",
    perSceneWords: "20-35 words per voiceover",
    videoScenesMetric: "Veo Video Clips",
    videoPeakDesc: "For high-tension peaks & shocks",
    imageScenesMetric: "4K Scene Images",
    imageDetailsDesc: "For clues, atmosphere & documents",
    retentionTitle: "Audience Retention Strategy & Boredom Prevention:",
    cadenceTitle: "Visual Cadence Map (Alternating Rhythm):",
    cadenceVideo: "Motion Video",
    cadenceImage: "4K Image",
    approveBtn: "✅ Approve Plan & Start Full Script & Media Generation",
    cancelProposalBtn: "Edit Story or Cancel",
    toggleCadenceDetails: "Show detailed scene timeline & cinematic rationale",
    hideCadenceDetails: "Hide detailed timeline",

    // Output & Results
    scenesTab: "Scenes & Storyboard",
    seoTab: "Title, SEO & Metadata",
    promptsTab: "Visual AI Prompts",
    voiceoverTab: "Full Voiceover Script",
    exportTg: "Send to Telegram",
    copyScript: "Copy Full Script",
    downloadJson: "Download JSON",
    newStory: "New Story",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language") as Language;
    return saved === "en" || saved === "ar" ? saved : "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  useEffect(() => {
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["ar"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isRTL: language === "ar",
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
