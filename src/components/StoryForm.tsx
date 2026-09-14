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
  Zap,
} from "lucide-react";

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
  }) => void;
  onAnalyze?: (params: {
    storyUrl: string;
    rawText: string;
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
    title: "3906: شهادة رجل عاد من المستقبل",
    url: "https://kabbos.com/3906-%d8%b4%d9%87%d8%a7%d8%af%d8%a9-%d8%b1%d8%ac%d9%84-%d8%b9%d8%a7%d8%af-%d9%85%d8%b6%d8%aa%d9%82%d8%a8%d9%84/",
  },
  {
    title: "ساعة بلا عقارب .. لكن بضربات قلب!",
    url: "https://kabbos.com/%d8%b3%d8%a7%d8%b9%d8%a9-%d8%a8%d9%84%d8%a7-%d8%b9%d9%82%d8%a7%d8%b1%d8%a8-%d9%84%d9%83%d9%86-%d8%a8%d8%b6%d8%b1%d8%a8%d8%a7%d8%aa-%d9%82%d9%84%d8%a8/",
  },
  {
    title: "لم يطلب المال… بل طلب الشرطة",
    url: "https://kabbos.com/%d9%84%d9%85-%d9%8a%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d9%85%d8%a7%d9%84-%d8%a8%d9%84-%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d8%b4%d8%b1%d8%b7%d8%a9/",
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
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [storyUrl, setStoryUrl] = useState(DEFAULT_PRESETS[0].url);
  const [rawText, setRawText] = useState("");

  // Live stories from Kabbos with Refresh feature
  const [allFetchedStories, setAllFetchedStories] = useState<{ title: string; url: string }[]>(DEFAULT_PRESETS);
  const [displayedStories, setDisplayedStories] = useState<{ title: string; url: string }[]>(DEFAULT_PRESETS);
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
      const shuffled = [...allFetchedStories].sort(() => 0.5 - Math.random());
      setDisplayedStories(shuffled.slice(0, 4));
    } else {
      fetchLiveStories();
    }
  };

  const handleTriggerAnalysis = () => {
    if (!hasServerKey && !geminiKey.trim()) {
      onOpenKeysModal();
      alert("يرجى إدخال مفتاح Gemini API أولاً في زر المفاتيح بالأعلى.");
      return;
    }

    if (inputMode === "url" && !storyUrl.trim()) {
      alert("يرجى إدخال رابط القصة.");
      return;
    }

    if (inputMode === "text" && !rawText.trim()) {
      alert("يرجى إدخال أو لصق نص القصة.");
      return;
    }

    if (onAnalyze) {
      onAnalyze({
        storyUrl: inputMode === "url" ? storyUrl.trim() : "",
        rawText: inputMode === "text" ? rawText.trim() : "",
      });
    } else {
      triggerDirectSubmit();
    }
  };

  const triggerDirectSubmit = () => {
    if (!hasServerKey && !geminiKey.trim()) {
      onOpenKeysModal();
      alert("يرجى إدخال مفتاح Gemini API أولاً في زر المفاتيح بالأعلى.");
      return;
    }

    if (inputMode === "url" && !storyUrl.trim()) {
      alert("يرجى إدخال رابط القصة.");
      return;
    }

    if (inputMode === "text" && !rawText.trim()) {
      alert("يرجى إدخال أو لصق نص القصة.");
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
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleTriggerAnalysis();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Simple Mode Toggle */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              {language === "ar" ? "مصدر القصة:" : "Story Source:"}
            </span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                inputMode === "url"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t("tabUrl")}
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                inputMode === "text"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t("tabText")}
            </button>
          </div>
        </div>

        {/* Story Input Field */}
        {inputMode === "url" ? (
          <div className="space-y-3">
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
        ) : (
          <div className="space-y-2">
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

        {/* Current Active Settings Bar */}
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

        {/* Action Buttons: Proposal Workflow vs Direct Run */}
        <div className="space-y-3 pt-2">
          {/* Primary Action Button: Director Analysis & Cadence Proposal */}
          <button
            type="button"
            onClick={handleTriggerAnalysis}
            disabled={isLoading || isAnalyzing}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 transition-all shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base cursor-pointer"
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
            ) : (
              <>
                <Search className="w-5 h-5 text-amber-200" />
                <span>{t("analyzeBtn")}</span>
              </>
            )}
          </button>

          {/* Quick Explanation & Direct Shortcut */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-xs text-slate-400">
            <span className="text-[11px] text-slate-400">
              {t("analyzeTip")}
            </span>
            <button
              type="button"
              onClick={triggerDirectSubmit}
              disabled={isLoading || isAnalyzing}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer shrink-0"
              title={language === "ar" ? "تخطي شاشة المقترح والبدء بالتوليد فوراً" : "Skip proposal and generate directly"}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t("instantDirectBtn")}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
