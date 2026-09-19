import { useState, useEffect, FormEvent } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Sliders,
  Flame,
  RefreshCw,
  Newspaper,
  Video,
  Search,
  Palette,
  Mic,
  Monitor,
  Smartphone,
  Camera,
  Check,
  FileText,
  Eye,
  Film,
  X,
  Zap,
} from "lucide-react";
import {
  ART_STYLES,
  NARRATION_STYLES,
  CAMERA_MOTIONS,
  ArtStyleOption,
} from "../data/aiStoryOptions";

interface StoryFormProps {
  onSubmit: (params: {
    geminiKey: string;
    storyUrl: string;
    rawText: string;
    telegramToken: string;
    telegramChatId: string;
    style: string;
    targetScenes: number;
    storyLanguage: "ar" | "en";
    targetDurationMinutes: number;
    selectedChannelId: string;
    videoRatioPercent: number;
    autoGenerateImages: boolean;
    visualStyle?: string;
    narrationStyle?: string;
    aspectRatio?: "16:9" | "9:16";
    cameraMotion?: string;
  }) => void;
  onAnalyze?: (params: {
    storyUrl: string;
    rawText: string;
    visualStyle?: string;
    narrationStyle?: string;
    aspectRatio?: "16:9" | "9:16";
    cameraMotion?: string;
    targetDurationMinutes?: number;
    targetScenes?: number;
    videoRatioPercent?: number;
    storyTitle?: string;
  }) => void;
  isLoading: boolean;
  isAnalyzing?: boolean;
  hasServerKey: boolean;
  geminiKey: string;
  telegramToken: string;
  telegramChatId: string;
  onOpenKeysModal: () => void;
  onOpenSettingsModal: () => void;
  targetDurationMinutes: number;
  targetScenes: number;
  storyLanguage: "ar" | "en";
  selectedStyle: string;
  selectedChannelId: string;
  videoRatioPercent: number;
  autoGenerateImages: boolean;
}

const DEFAULT_PRESETS = [
  {
    title: "لغز طاهر بك.. ساحر مصر الذي تحدّى الموت",
    url: "https://kabbos.com/%d9%84%d8%ba%d8%b2-%d8%b7%d8%a7%d9%87%d8%b1-%d8%a8%d9%83-%d8%b3%d8%a7%d8%ad%d8%b1-%d9%85%d8%b5%d8%b1-%d8%a7%d9%84%d8%b0%d9%8a-%d8%aa%d8%ad%d8%af%d9%91%d9%89-%d8%a7%d9%84%d9%85%d9%88%d8%aa/",
  },
  {
    title: "الضلع الزائد – ثقب في جدار النوايا",
    url: "https://kabbos.com/%d8%a7%d9%84%d8%b6%d9%84%d8%b9-%d8%a7%d9%84%d8%b2%d8%a7%d8%a6%d8%af-%d8%ab%d9%82%d8%a8-%d9%81%d9%8a-%d8%ac%d8%af%d8%a7%d8%b1-%d8%a7%d9%84%d9%86%d9%88%d8%a7%d9%8a%d8%a7-%d9%82%d8%b5%d8%b5/",
  },
  {
    title: "قضية أقنعة الرصاص المحيرة",
    url: "https://kabbos.com/%d9%82%d8%b6%d9%8a%d8%a9-%d8%a3%d9%82%d9%86%d8%b9%d8%a9-%d8%a7%d9%84%d8%b1%d8%b5%d8%a7%d8%b5-%d8%a7%d9%84%d9%85%d8%ad%d9%8a%d8%b1%d8%a9/",
  },
  {
    title: "ساعة بلا عقارب .. لكن بضربات قلب!",
    url: "https://kabbos.com/%d8%b3%d8%a7%d8%b9%d8%a9-%d8%a8%d9%84%d8%a7-%d8%b9%d9%82%d8%a7%d8%b1%d8%a8-%d9%84%d9%83%d9%86-%d8%a8%d8%b6%d8%b1%d8%a8%d8%a7%d8%aa-%d9%82%d9%84%d8%a8/",
  },
  {
    title: "لم يطلب المال… بل طلب الشرطة",
    url: "https://kabbos.com/%d9%84%d9%85-%d9%8a%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d9%85%d8%a7%d9%84-%d8%a8%d9%84-%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d8%b4%d8%b1%d8%b7%d8%a9/",
  },
  {
    title: "فخ المتعة : لعبة عابرة قادت إلى الهاوية!..",
    url: "https://kabbos.com/%d9%81%d8%ae-%d8%a7%d9%84%d9%85%d8%aa%d8%b9%d8%a9-%d9%84%d8%b9%d8%a8%d8%a9-%d8%b9%d8%a7%d8%a8%d8%b1%d8%a9-%d9%82%d8%a7%d8%af%d8%aa-%d8%a5%d9%84%d9%89-%d8%a7%d9%84%d9%87%d8%a7%d9%88%d9%8a%d8%a9/",
  },
];

export function StoryForm({
  onSubmit,
  onAnalyze,
  isLoading,
  isAnalyzing = false,
  hasServerKey,
  geminiKey,
  telegramToken,
  telegramChatId,
  onOpenKeysModal,
  onOpenSettingsModal,
  targetDurationMinutes,
  targetScenes,
  storyLanguage,
  selectedStyle,
  selectedChannelId,
  videoRatioPercent,
  autoGenerateImages,
}: StoryFormProps) {
  const { language, t } = useLanguage();
  const [inputMode, setInputMode] = useState<"url" | "text" | "ai">("url");
  const [storyUrl, setStoryUrl] = useState(DEFAULT_PRESETS[0].url);
  const [rawText, setRawText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Dedicated AI Story Parameters (User Request: عنوان القصة، شكل الرسومات، إعدادات الفيديو، أسلوب السرد)
  const [aiTitle, setAiTitle] = useState("");
  const [aiPlotDetails, setAiPlotDetails] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState<string>(ART_STYLES[0].id);
  const [aiNarrationStyle, setAiNarrationStyle] = useState<string>(NARRATION_STYLES[1].id);
  const [aiAspectRatio, setAiAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [aiDuration, setAiDuration] = useState<number>(targetDurationMinutes || 15);
  const [aiScenes, setAiScenes] = useState<number>(targetScenes || 22);
  const [aiVideoRatio, setAiVideoRatio] = useState<number>(videoRatioPercent || 30);
  const [aiCameraMotion, setAiCameraMotion] = useState<string>(CAMERA_MOTIONS[0].labelAr);
  const [aiLanguage, setAiLanguage] = useState<"ar" | "en">(storyLanguage);
  const [artCategoryFilter, setArtCategoryFilter] = useState<"all" | "kids" | "cinematic" | "art" | "dark">("all");
  const [samplePreviewModal, setSamplePreviewModal] = useState<ArtStyleOption | null>(null);

  // Live stories from Kabbos with Refresh feature
  const [allFetchedStories, setAllFetchedStories] = useState<{ title: string; url: string }[]>(DEFAULT_PRESETS);
  const [displayedStories, setDisplayedStories] = useState<{ title: string; url: string }[]>(DEFAULT_PRESETS.slice(0, 4));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live stories on load
  const fetchLiveStories = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/kabbos-feed");
      const data = await res.json();
      if (data.success && data.stories && data.stories.length > 0) {
        setAllFetchedStories(data.stories);
        const shuffled = [...data.stories].sort(() => 0.5 - Math.random());
        setDisplayedStories(shuffled.slice(0, 4));
      }
    } catch (e) {
      console.warn("Feed fetch error, using defaults:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStories();
  }, []);

  const handleShuffleStories = () => {
    if (allFetchedStories.length > 4) {
      const remaining = allFetchedStories.filter(
        (s) => !displayedStories.some((d) => d.url === s.url)
      );
      if (remaining.length >= 4) {
        const shuffled = [...remaining].sort(() => 0.5 - Math.random());
        setDisplayedStories(shuffled.slice(0, 4));
      } else {
        const shuffled = [...allFetchedStories].sort(() => 0.5 - Math.random());
        setDisplayedStories(shuffled.slice(0, 4));
      }
    } else {
      fetchLiveStories();
    }
  };

  const handleDurationSliderChange = (minutes: number) => {
    setAiDuration(minutes);
    // Unconstrained dynamic scene recommendation: ~1.5 to 1.6 scenes per minute
    const calculatedScenes = Math.max(6, Math.min(120, Math.round(minutes * 1.55)));
    setAiScenes(calculatedScenes);
  };

  const handlePacingPreset = (speed: "fast" | "balanced" | "documentary") => {
    if (speed === "fast") {
      // Fast pacing: ~2.4 scenes/min (e.g. 35 min = 84 scenes)
      setAiScenes(Math.max(6, Math.min(120, Math.round(aiDuration * 2.4))));
    } else if (speed === "balanced") {
      // Balanced pacing: ~1.6 scenes/min (e.g. 35 min = 56 scenes)
      setAiScenes(Math.max(6, Math.min(120, Math.round(aiDuration * 1.6))));
    } else {
      // Documentary/calm: ~1.1 scenes/min (e.g. 35 min = 38 scenes)
      setAiScenes(Math.max(6, Math.min(120, Math.round(aiDuration * 1.1))));
    }
  };

  const buildAiStoryPayload = () => {
    return `
طلب تأليف قصة ذكاء اصطناعي سينمائية:
عنوان القصة: ${aiTitle.trim()}
${aiPlotDetails.trim() ? `تفاصيل وحبكة مقترحة: ${aiPlotDetails.trim()}` : "المطلوب: ابتكار قصة متكاملة مع تصاعد درامي مستمر ومؤثرات بصرية وصوتية تتناسب مع الطراز المختار."}
شكل وطراز الرسومات الفنية: ${aiArtStyle}
أسلوب ونبرة السرد الصوتي: ${aiNarrationStyle}
أبعاد المشاهد والفيديو: ${aiAspectRatio === "9:16" ? "9:16 رأسي (Vertical Shorts/TikTok)" : "16:9 أفقي سينمائي (Widescreen)"}
ديناميكية حركة الكاميرا: ${aiCameraMotion}
مدة الفيديو المقترحة: ${aiDuration} دقيقة
عدد المشاهد المستهدفة: ${aiScenes} مشهداً
نسبة مقاطع الفيديو Veo: ${aiVideoRatio}%
لغة الإلقاء: ${aiLanguage === "ar" ? "العربية الفصحى" : "English"}
`.trim();
  };

  const handleTriggerAnalysis = () => {
    setFormError(null);
    if (!hasServerKey && !geminiKey.trim()) {
      onOpenKeysModal();
      setFormError(language === "ar" ? "يرجى إدخال مفتاح Gemini API أولاً في زر المفاتيح بالأعلى." : "Please enter Gemini API key first.");
      return;
    }

    if (inputMode === "url" && !storyUrl.trim()) {
      setFormError(language === "ar" ? "يرجى إدخال رابط القصة أو اختيار إحدى القصص الجاهزة." : "Please enter a story URL.");
      return;
    }

    if (inputMode === "text" && !rawText.trim()) {
      setFormError(language === "ar" ? "يرجى إدخال أو لصق نص القصة." : "Please paste the story text.");
      return;
    }

    if (inputMode === "ai") {
      if (!aiTitle.trim()) {
        setFormError(language === "ar" ? "يرجى كتابة عنوان القصة أولاً." : "Please enter a story title.");
        return;
      }

      const aiText = buildAiStoryPayload();
      if (onAnalyze) {
        onAnalyze({
          storyUrl: "",
          rawText: aiText,
          visualStyle: aiArtStyle,
          narrationStyle: aiNarrationStyle,
          aspectRatio: aiAspectRatio,
          cameraMotion: aiCameraMotion,
          targetDurationMinutes: aiDuration,
          targetScenes: aiScenes,
          videoRatioPercent: aiVideoRatio,
          storyTitle: aiTitle.trim(),
        });
      } else {
        triggerDirectSubmit();
      }
      return;
    }

    if (onAnalyze) {
      onAnalyze({
        storyUrl: inputMode === "url" ? storyUrl.trim() : "",
        rawText: inputMode === "text" ? rawText.trim() : "",
        visualStyle: selectedStyle,
        narrationStyle: selectedStyle,
        aspectRatio: "16:9",
        cameraMotion: "Slow cinematic push-in",
        targetDurationMinutes,
        targetScenes,
        videoRatioPercent,
      });
    } else {
      triggerDirectSubmit();
    }
  };

  const triggerDirectSubmit = () => {
    setFormError(null);
    if (!hasServerKey && !geminiKey.trim()) {
      onOpenKeysModal();
      setFormError(language === "ar" ? "يرجى إدخال مفتاح Gemini API أولاً في زر المفاتيح بالأعلى." : "Please enter Gemini API key first.");
      return;
    }

    if (inputMode === "ai") {
      if (!aiTitle.trim()) {
        setFormError(language === "ar" ? "يرجى كتابة عنوان القصة." : "Please enter a story title.");
        return;
      }

      const aiText = buildAiStoryPayload();
      onSubmit({
        geminiKey: geminiKey.trim(),
        storyUrl: "",
        rawText: aiText,
        telegramToken: telegramToken.trim(),
        telegramChatId: telegramChatId.trim(),
        style: aiNarrationStyle,
        targetScenes: aiScenes,
        storyLanguage: aiLanguage,
        targetDurationMinutes: aiDuration,
        selectedChannelId,
        videoRatioPercent: aiVideoRatio,
        autoGenerateImages,
        visualStyle: aiArtStyle,
        narrationStyle: aiNarrationStyle,
        aspectRatio: aiAspectRatio,
        cameraMotion: aiCameraMotion,
      });
      return;
    }

    if (inputMode === "url" && !storyUrl.trim()) {
      setFormError(language === "ar" ? "يرجى إدخال رابط القصة أو اختيار إحدى القصص الجاهزة." : "Please enter a story URL.");
      return;
    }

    if (inputMode === "text" && !rawText.trim()) {
      setFormError(language === "ar" ? "يرجى إدخال أو لصق نص القصة." : "Please paste the story text.");
      return;
    }

    onSubmit({
      geminiKey: geminiKey.trim(),
      storyUrl: inputMode === "url" ? storyUrl.trim() : "",
      rawText: rawText.trim(),
      telegramToken: telegramToken.trim(),
      telegramChatId: telegramChatId.trim(),
      style: selectedStyle,
      targetScenes,
      storyLanguage,
      targetDurationMinutes,
      selectedChannelId,
      videoRatioPercent,
      autoGenerateImages,
      visualStyle: selectedStyle,
      narrationStyle: selectedStyle,
      aspectRatio: "16:9",
      cameraMotion: "Slow cinematic push-in",
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleTriggerAnalysis();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Mode Toggle: URL vs Direct Text vs AI Story */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              {language === "ar" ? "طريقة إنشاء المحتوى:" : "Content Creation Method:"}
            </span>
          </div>

          <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                inputMode === "url"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{t("tabUrl")}</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                inputMode === "text"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t("tabText")}</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode("ai")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                inputMode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/40"
                  : "text-purple-300 hover:text-purple-100 bg-purple-950/30 border border-purple-800/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{t("tabAi")}</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: URL INPUT                                             */}
        {/* ------------------------------------------------------------- */}
        {inputMode === "url" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-slate-300">
              {language === "ar"
                ? "أدخل رابط القصة (مثال: من موقع kabbos.com أو أي مقال آخر):"
                : "Enter story URL (from news, blogs, or articles):"}
            </label>
            <input
              type="url"
              value={storyUrl}
              onChange={(e) => setStoryUrl(e.target.value)}
              placeholder={t("urlPlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              dir="ltr"
            />

            {/* Quick Live Stories from Kabbos with Refresh Button */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === "ar"
                      ? "قصص حية من موقع كابوس (اختر بضغطة واحدة):"
                      : "Live curated mystery stories (1-click load):"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleShuffleStories}
                  disabled={isRefreshing}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
                  title={language === "ar" ? "سحب وتوليد قصص جديدة من موقع كابوس" : "Refresh stories"}
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>{language === "ar" ? "تحديث وقصص أخرى" : "Refresh"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedStories.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStoryUrl(item.url);
                      setInputMode("url");
                    }}
                    className={`text-xs p-2.5 rounded-xl ${language === "ar" ? "text-right" : "text-left"} flex items-center gap-2 border transition-all cursor-pointer ${
                      storyUrl === item.url && inputMode === "url"
                        ? "bg-amber-500/20 text-amber-200 border-amber-500/60 font-bold"
                        : "bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: DIRECT TEXT INPUT                                     */}
        {/* ------------------------------------------------------------- */}
        {inputMode === "text" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-slate-300">
              {language === "ar" ? "الصق نص القصة أو المقال هنا:" : "Paste story text or plot summary here:"}
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
              placeholder={t("textPlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
            {rawText && (
              <span className="text-[11px] text-slate-500 block">
                {language === "ar" ? `عدد الأحرف: ${rawText.length} حرف` : `Characters: ${rawText.length}`}
              </span>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: AI STORY GENERATOR (زر قصة AI المخصص بجميع المعايير)   */}
        {/* ------------------------------------------------------------- */}
        {inputMode === "ai" && (
          <div className="space-y-6 animate-in fade-in duration-250">
            {/* Banner info */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 p-4 rounded-xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === "ar" ? "مبتكر القصص الاحترافي بالذكاء الاصطناعي" : "AI Cinematic Story Architect"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === "ar"
                      ? "حدد عنوان القصة، شكل وطراز الرسومات الفنية، إعدادات المشاهد، وأسلوب السرد"
                      : "Configure Story Title, Visual Art Style, Scene Cadence, and Narration"}
                  </p>
                </div>
              </div>
            </div>

            {/* 1. عنوان القصة (Story Title) */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{language === "ar" ? "1. عنوان القصة أو الفكرة المطلوبة:" : "1. Story Title or Subject:"}</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {language === "ar" ? "أدخل العنوان الذي ترغب بإنتاج قصة وفيديو متكامل حوله" : "Enter your story title or premise"}
                </span>
              </div>

              <input
                type="text"
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "اكتب عنوان القصة هنا (مثال: رحلة الأرنب الصغير في الغابة المسحورة، أو أسطورة سفينة ماري سيلست...)"
                    : "e.g., The Little Rabbit's Journey in the Magic Woods, or The Mystery of Mary Celeste..."
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />

              {/* Optional Plot details */}
              <div className="pt-1">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {language === "ar"
                    ? "تفاصيل إضافية للحبكة أو شخصيات معينة (اختياري):"
                    : "Optional plot details or specific twists:"}
                </label>
                <textarea
                  value={aiPlotDetails}
                  onChange={(e) => setAiPlotDetails(e.target.value)}
                  rows={2}
                  placeholder={
                    language === "ar"
                      ? "أضف أي تفاصيل أو شخصيات أو رسائل ترغب في أن يركز عليها الذكاء الاصطناعي..."
                      : "Add specific clues, setting details, or twists..."
                  }
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* 2. شكل الرسومات (Art / Visual Style) */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === "ar" ? "2. شكل وطراز الرسومات الفنية (مع عينات بصرية حية):" : "2. Visual Art & Graphics Style:"}</span>
                </label>
                <span className="text-[11px] text-purple-300 font-medium">
                  {language === "ar" ? `المحدد: ${aiArtStyle}` : `Selected: ${aiArtStyle}`}
                </span>
              </div>

              {/* Art Category Filter Tabs (Including Kids) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setArtCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    artCategoryFilter === "all"
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🌟 {language === "ar" ? "جميع الطرز" : "All Styles"}
                </button>
                <button
                  type="button"
                  onClick={() => setArtCategoryFilter("kids")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                    artCategoryFilter === "kids"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-amber-400 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30"
                  }`}
                >
                  <span>🧸</span>
                  <span>{language === "ar" ? "مخصص للأطفال والعائلة" : "Kids & Family"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArtCategoryFilter("cinematic")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    artCategoryFilter === "cinematic"
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎬 {language === "ar" ? "سينمائي وواقعي" : "Cinematic"}
                </button>
                <button
                  type="button"
                  onClick={() => setArtCategoryFilter("art")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    artCategoryFilter === "art"
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🏛️ {language === "ar" ? "لوحات وفن كلاسيكي" : "Fine Art"}
                </button>
                <button
                  type="button"
                  onClick={() => setArtCategoryFilter("dark")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    artCategoryFilter === "dark"
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🌑 {language === "ar" ? "نوار ورعب نفسي" : "Noir & Mystery"}
                </button>
              </div>

              {/* Art Styles Grid with Sample Image Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {ART_STYLES.filter((item) => artCategoryFilter === "all" || item.category === artCategoryFilter).map((styleItem) => {
                  const isSelected = aiArtStyle === styleItem.id;
                  return (
                    <div
                      key={styleItem.id}
                      onClick={() => setAiArtStyle(styleItem.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 relative group overflow-hidden ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500 ring-1 ring-purple-400/50 shadow-lg shadow-purple-950/50"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      {/* Image Thumbnail Sample Preview */}
                      <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group-hover:border-slate-700 transition-colors">
                        <img
                          src={styleItem.sampleImage}
                          alt={styleItem.labelAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        
                        {/* Style Category Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold shadow-md ${
                            styleItem.category === "kids"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-900/90 text-purple-300 border border-purple-500/30"
                          }`}>
                            {styleItem.category === "kids" ? "🧸 للأطفال" : styleItem.icon}
                          </span>
                        </div>

                        {/* View Sample Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSamplePreviewModal(styleItem);
                          }}
                          className="absolute bottom-2 left-2 bg-slate-900/90 hover:bg-slate-800 text-[10px] text-amber-300 px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                          title="معاينة عينة الرسمة بحجم كامل"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة العينة</span>
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{styleItem.icon}</span>
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                            {language === "ar" ? styleItem.labelAr : styleItem.labelEn}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {language === "ar" ? styleItem.descAr : styleItem.descEn}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/20 font-medium">
                          {language === "ar" ? styleItem.tagAr : styleItem.tagEn}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] text-emerald-400 font-bold">
                            ✓ تم الاختيار
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. إعدادات الفيديو (Video Settings & Unconstrained Scenes) */}
            <div className="space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === "ar" ? "3. إعدادات الفيديو وعدد المشاهد (مرونة كاملة للفيديوهات الطويلة):" : "3. Video Pacing & Aspect Ratio:"}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aspect Ratio Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-300 block">
                    {language === "ar" ? "أبعاد المشاهد والفيديو:" : "Aspect Ratio:"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAiAspectRatio("16:9")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        aiAspectRatio === "16:9"
                          ? "bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>16:9 شاشة عريضة (YouTube)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiAspectRatio("9:16")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        aiAspectRatio === "9:16"
                          ? "bg-pink-600/30 border-pink-500 text-pink-200 ring-1 ring-pink-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>9:16 طولي (Shorts / Reels)</span>
                    </button>
                  </div>
                </div>

                {/* Duration Slider (5 to 60 Minutes) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      {language === "ar" ? "مدة الفيديو التقديرية (5 إلى 60 دقيقة):" : "Target Duration:"}
                    </span>
                    <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {aiDuration} دقيقة
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={1}
                    value={aiDuration}
                    onChange={(e) => handleDurationSliderChange(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 دقائق</span>
                    <span>15 دقيقة (افتراضي)</span>
                    <span>35 دقيقة (سرد طويل)</span>
                    <span>60 دقيقة (كامل)</span>
                  </div>
                </div>
              </div>

              {/* Advanced Scene Count Controls (No Restrictions for 35+ Min) */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>إجمالي عدد المشاهد المطلوبة (حر حتى 120 مشهداً):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-indigo-500/30">
                      <input
                        type="number"
                        min={4}
                        max={120}
                        value={aiScenes}
                        onChange={(e) => setAiScenes(Math.max(4, Math.min(120, Number(e.target.value) || 6)))}
                        className="w-14 bg-transparent text-indigo-300 font-mono font-bold text-center text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-indigo-400">مشهد</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md">
                      (~{Math.round((aiDuration * 60) / Math.max(1, aiScenes))} ثانية للمشهد)
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={4}
                  max={120}
                  step={1}
                  value={aiScenes}
                  onChange={(e) => setAiScenes(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>4 مشاهد</span>
                  <span>40 مشهد</span>
                  <span>60 مشهد</span>
                  <span>85 مشهد</span>
                  <span>120 مشهد</span>
                </div>

                {/* Quick Pacing Presets for Scenes */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">
                    ⚡ وتيرة تقطيع المشاهد الموصى بها لـ ({aiDuration} دقيقة):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePacingPreset("fast")}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-[10px] font-medium cursor-pointer transition-colors"
                      title="مشهد كل 15-20 ثانية للحفاظ على انتباه المشاهد والأطفال"
                    >
                      ⚡ وتيرة سريعة مكثفة (~{Math.min(120, Math.round(aiDuration * 2.4))} مشهد)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePacingPreset("balanced")}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium cursor-pointer transition-colors"
                      title="مشهد كل 30-35 ثانية مناسب لليوتيوب"
                    >
                      🎬 وتيرة سينمائية متوازنة (~{Math.min(120, Math.round(aiDuration * 1.6))} مشهد)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePacingPreset("documentary")}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-medium cursor-pointer transition-colors"
                      title="مشهد كل 50-60 ثانية"
                    >
                      📜 وتيرة وثائقية هادئة (~{Math.min(120, Math.round(aiDuration * 1.1))} مشهد)
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Motion Ratio (Veo Percentage) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-300 block">
                  {language === "ar" ? "نسبة مشاهد الفيديو الحركية Veo:" : "Video Motion %:"}
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[0, 30, 50, 100].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setAiVideoRatio(percent)}
                      className={`py-2 px-2 rounded-xl border font-mono font-bold transition-all cursor-pointer ${
                        aiVideoRatio === percent
                          ? "bg-red-600/30 border-red-500 text-red-200 ring-1 ring-red-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {aiVideoRatio === 0
                    ? "صور فائقة الدقة 4K فقط لجميع المشاهد (أسرع توليد)"
                    : aiVideoRatio === 30
                    ? "30% فيديو حركي (النمط الموصى به لليوتيوب)"
                    : aiVideoRatio === 50
                    ? "50% فيديو و 50% صور (إنتاج شبه سينمائي ممتع)"
                    : "فيديو بالكامل لكل المشاهد"}
                </span>
              </div>

              {/* Camera Motion Style (Expanded to 12 Rich Dynamic Motions) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === "ar" ? "ديناميكية حركة الكاميرا السينمائية (12 حركة احترافية):" : "Cinematic Camera Motion:"}</span>
                  </span>
                  <span className="text-[10px] text-indigo-300 font-medium">
                    {aiCameraMotion}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CAMERA_MOTIONS.map((cam) => {
                    const isSelected = aiCameraMotion === cam.labelAr;
                    return (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => setAiCameraMotion(cam.labelAr)}
                        className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          isSelected
                            ? "bg-indigo-950/50 border-indigo-500 text-indigo-200 ring-1 ring-indigo-400/40 shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className="text-base">{cam.icon}</span>
                            <span className={isSelected ? "text-white" : "text-slate-300"}>
                              {language === "ar" ? cam.labelAr : cam.labelEn}
                            </span>
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 line-clamp-1">
                          {language === "ar" ? cam.descAr : cam.descEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. أسلوب السرد (Narrative Style) */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === "ar" ? "4. أسلوب السرد والإلقاء الصوتي (Narrative Style):" : "4. Narrative & Voiceover Tone:"}</span>
                </label>

                {/* Language for AI Voiceover */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiLanguage("ar")}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                      aiLanguage === "ar" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    🇸🇦 عربي فصحى
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiLanguage("en")}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                      aiLanguage === "en" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {NARRATION_STYLES.map((narrationItem) => {
                  const isSelected = aiNarrationStyle === narrationItem.id;
                  return (
                    <button
                      key={narrationItem.id}
                      type="button"
                      onClick={() => setAiNarrationStyle(narrationItem.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? "bg-amber-950/30 border-amber-500 ring-1 ring-amber-400/50 shadow-md shadow-amber-950/50"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{narrationItem.icon}</span>
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                            {language === "ar" ? narrationItem.labelAr : narrationItem.labelEn}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {language === "ar" ? narrationItem.descAr : narrationItem.descEn}
                      </p>
                      <div className="pt-1">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20 font-medium">
                          {language === "ar" ? narrationItem.tagAr : narrationItem.tagEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Current Active Settings Bar (When in URL or Text mode) */}
        {inputMode !== "ai" && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="font-semibold text-white">
                {language === "ar" ? "المواصفات المختارة:" : "Selected Cadence:"}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                ⏱️ {targetDurationMinutes} {t("minutes")}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                🎬 {targetScenes} {t("sceneWord")}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-red-300 font-mono flex items-center gap-1">
                <Video className="w-3 h-3 text-red-400" />
                {videoRatioPercent}% {language === "ar" ? "فيديو حركي" : "Motion Video"}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                {storyLanguage === "ar" ? "🇸🇦 عربي" : "🇺🇸 English"}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "تعديل الإعدادات (فيديوهات/صور/مدة)" : "Adjust Cadence & Styles"}</span>
            </button>
          </div>
        )}

        {/* Action Buttons: Proposal Workflow vs Direct Run */}
        <div className="space-y-3 pt-2">
          {formError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center justify-between gap-2">
              <span>{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-red-400 hover:text-red-200 font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleTriggerAnalysis}
            disabled={isLoading || isAnalyzing}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base cursor-pointer ${
              inputMode === "ai"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 shadow-purple-600/30"
                : "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-orange-600/25"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{t("analyzingBtn")}</span>
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{t("generatingBtn")}</span>
              </>
            ) : inputMode === "ai" ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>
                  {language === "ar"
                    ? "✨ ابتكار قصة AI واعتماد خطة المونتاج"
                    : "✨ Architect & Plan AI Cinematic Story"}
                </span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 text-amber-200" />
                <span>{t("analyzeBtn")}</span>
              </>
            )}
          </button>

          {/* Quick Explanation */}
          <div className="text-center px-1">
            <span className="text-xs text-slate-400">
              {inputMode === "ai"
                ? language === "ar"
                  ? "يقوم مخرج الذكاء الاصطناعي ببناء حبكة القصة وتوزيع المشاهد مع الحفاظ على التناسق السمعي والبصري الكامل"
                  : "The AI Director architects the story plot, scene cadence, and audiovisual fidelity based on your chosen styles"
                : t("analyzeTip")}
            </span>
          </div>
        </div>
      </form>

      {/* Visual Sample Lightbox Modal (معاينة عينة الرسمة بحجم عالي) */}
      {samplePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSamplePreviewModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{samplePreviewModal.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === "ar" ? samplePreviewModal.labelAr : samplePreviewModal.labelEn}
                  </h4>
                  <span className="text-xs text-purple-300">
                    {samplePreviewModal.category === "kids"
                      ? "🧸 طراز مخصص للأطفال وقصص الصغار"
                      : samplePreviewModal.tagAr}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSamplePreviewModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* High-res Image Preview */}
            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
              <img
                src={samplePreviewModal.sampleImage}
                alt={samplePreviewModal.labelAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded-md text-amber-300 font-mono border border-amber-500/30">
                عينة جودة الصورة المقترحة للمشاهد
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === "ar" ? samplePreviewModal.descAr : samplePreviewModal.descEn}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  {aiArtStyle === samplePreviewModal.id ? "✅ هذا هو الطراز المحدد حالياً" : "اضغط لاعتماد هذا الطراز لقصتك"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSamplePreviewModal(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiArtStyle(samplePreviewModal.id);
                      setSamplePreviewModal(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 cursor-pointer transition-all"
                  >
                    اختيار هذا الطراز 🎨
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
