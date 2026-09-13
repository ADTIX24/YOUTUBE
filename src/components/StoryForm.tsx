import { useState, useEffect, FormEvent } from "react";
import {
  Link as LinkIcon,
  FileText,
  Sparkles,
  Sliders,
  Loader2,
  Settings2,
  ExternalLink,
  Flame,
  Newspaper,
  Youtube,
  Clock,
  Globe,
  Radio,
} from "lucide-react";
import { YouTubeChannelConfig } from "../types";

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
  }) => void;
  isLoading: boolean;
  hasServerKey: boolean;
  geminiKey: string;
  telegramToken: string;
  telegramChatId: string;
  onOpenKeysModal: () => void;
  youtubeChannels: YouTubeChannelConfig[];
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
}

const KABBOS_PRESETS = [
  {
    title: "لغز طاهر بك.. ساحر مصر الذي تحدّى الموت",
    url: "https://kabbos.com/%d9%84%d8%ba%d8%b2-%d8%b7%d8%a7%d9%87%d8%b1-%d8%a8%d9%83-%d8%b3%d8%a7%d8%ad%d8%b1-%d9%85%d8%b5%d8%b1-%d8%a7%d9%84%d8%b0%d9%8a-%d8%aa%d8%ad%d8%af%d9%91%d9%89-%d8%a7%d9%84%d9%85%d9%88%d8%aa/",
  },
  {
    title: "3906: شهادة رجل عاد من المستقبل",
    url: "https://kabbos.com/3906-%d8%b4%d9%87%d8%a7%d8%af%d8%a9-%d8%b1%d8%ac%d9%84-%d8%b9%d8%a7%d8%af-%d9%85%d9%86-%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d9%82%d8%a8%d9%84/",
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

const STYLES = [
  { id: "سينمائي مشوق ومثير (YouTube Viral)", label: "سينمائي مشوق (YouTube Viral)" },
  { id: "غموض وتحقيق استقصائي داكن (True Crime & Mystery)", label: "غموض وتحقيق استقصائي داكن" },
  { id: "رعب نفسي وتشويق عميق (Psychological Horror)", label: "رعب نفسي وتشويق عميق" },
  { id: "ملحمة أسطورية وتاريخية (Historical Documentary)", label: "ملحمة أسطورية ووثائقية" },
  { id: "خيال علمي وغرائب ما وراء الطبيعة (Sci-Fi & Paranormal)", label: "خيال علمي وما وراء الطبيعة" },
];

export function StoryForm({
  onSubmit,
  isLoading,
  hasServerKey,
  geminiKey,
  telegramToken,
  telegramChatId,
  onOpenKeysModal,
  youtubeChannels,
  selectedChannelId,
  setSelectedChannelId,
}: StoryFormProps) {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [storyUrl, setStoryUrl] = useState(
    "https://kabbos.com/%d9%84%d8%ba%d8%b2-%d8%b7%d8%a7%d9%87%d8%b1-%d8%a8%d9%83-%d8%b3%d8%a7%d8%ad%d8%b1-%d9%85%d8%b5%d8%b1-%d8%a7%d9%84%d8%b0%d9%8a-%d8%aa%d8%ad%d8%af%d9%91%d9%89-%d8%a7%d9%84%d9%85%d9%88%d8%aa/"
  );
  const [rawText, setRawText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);

  // New features: Duration (10-30 min), Language (AR/EN), Scenes (10 to 30)
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(15);
  const [targetScenes, setTargetScenes] = useState(16);
  const [storyLanguage, setStoryLanguage] = useState<"ar" | "en">("ar");

  // Keep language in sync if active channel changes
  const activeChannel = youtubeChannels.find((ch) => ch.id === selectedChannelId);

  useEffect(() => {
    if (activeChannel?.language) {
      setStoryLanguage(activeChannel.language);
    }
  }, [selectedChannelId, activeChannel]);

  // Adjust recommended scenes dynamically when duration changes
  const handleDurationChange = (minutes: number) => {
    setTargetDurationMinutes(minutes);
    // Every minute typically has ~1 to 1.5 scenes for engaging pacing
    const calculatedScenes = Math.min(30, Math.max(10, Math.round(minutes * 1.1)));
    setTargetScenes(calculatedScenes);
  };

  // Live Kabbos stories
  const [liveKabbosStories, setLiveKabbosStories] = useState<{ title: string; url: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/kabbos-feed")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.stories && data.stories.length > 0) {
          setLiveKabbosStories(data.stories);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectStoryUrl = (url: string) => {
    setStoryUrl(url);
    setInputMode("url");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!hasServerKey && !geminiKey.trim()) {
      onOpenKeysModal();
      alert("يرجى إدخال مفتاح Gemini API أولاً في زر مفاتيح الربط لتشغيل الذكاء الاصطناعي.");
      return;
    }

    if (!storyUrl.trim() && !rawText.trim()) {
      alert("يرجى إدخال رابط القصة أو اختيار واحدة من قصص موقع كابوس.");
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
    });
  };

  const isGeminiConfigured = Boolean(geminiKey.trim() || hasServerKey);
  const isTgConfigured = Boolean(telegramToken.trim() && telegramChatId.trim());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Control Bar: Active YouTube Channel & Status */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Active Channel Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span>القناة المستهدفة للنشر:</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {youtubeChannels.length} قنوات مسجلة
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-red-500 max-w-[220px]"
                >
                  {youtubeChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} ({ch.language === "ar" ? "العربية" : "English"})
                    </option>
                  ))}
                </select>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    storyLanguage === "ar"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {storyLanguage === "ar" ? "🇸🇦 محتوى عربي" : "🇺🇸 English Content"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick link to manage keys & channels */}
          <button
            type="button"
            onClick={onOpenKeysModal}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all self-start md:self-auto"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>إدارة قنوات يوتيوب ومفاتيح الربط</span>
          </button>
        </div>

        {/* Video Specs Configuration: Duration (10-30 min), Scenes (10-30), Language */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              مواصفات فيديو اليوتيوب (من 10 إلى 30 دقيقة)
            </h3>
            <span className="text-[11px] text-amber-400/90 font-medium">
              الوكيل الذكي يوسع السرد تلقائياً لتغطية كامل الوقت
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Language Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                لغة السيناريو والصوت:
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setStoryLanguage("ar")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    storyLanguage === "ar"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🇸🇦 العربية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryLanguage("en")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    storyLanguage === "en"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🇺🇸 English</span>
                </button>
              </div>
            </div>

            {/* 2. Target Video Duration (10 to 30 mins) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>مدة الفيديو المستهدفة:</span>
                <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                  ⏱️ {targetDurationMinutes} دقيقة
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={targetDurationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 cursor-pointer h-2 rounded-lg mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>10 دقائق</span>
                <span>15 دقيقة (شائع)</span>
                <span>20 دقيقة</span>
                <span>30 دقيقة</span>
              </div>
            </div>

            {/* 3. Number of Scenes (10 to 30 scenes) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>عدد المشاهد المقترحة:</span>
                <span className="font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                  🎬 {targetScenes} مشهداً
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={targetScenes}
                onChange={(e) => setTargetScenes(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-2 rounded-lg mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>10 مشاهد</span>
                <span>20 مشهد</span>
                <span>30 مشهد (سرد عميق)</span>
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              الأسلوب السينمائي والإخراجي للقصة:
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kabbos Quick Story Selector */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900/60 border border-amber-500/20">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  سحب القصص من موقع كابوس (kabbos.com):
                </span>
                <span className="text-[11px] text-slate-400 block">
                  انقر على القصة ليسحب الوكيل كامل محتواها ويتجاوز الإعلانات ويحولها لسيناريو كامل
                </span>
              </div>
            </div>

            <a
              href="https://kabbos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              زيارة kabbos.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(liveKabbosStories.length > 0 ? liveKabbosStories.slice(0, 6) : KABBOS_PRESETS).map(
              (item, idx) => {
                const isSelected = storyUrl === item.url && inputMode === "url";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStoryUrl(item.url)}
                    className={`text-xs px-3 py-2 rounded-xl transition-all text-right flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-200 border-amber-500/60 font-semibold shadow-sm"
                        : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/70"
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{item.title}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Story Input (URL / Text) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              رابط القصة من kabbos.com أو أي موقع آخر
            </h3>

            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  inputMode === "url"
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                رابط (URL)
              </button>
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  inputMode === "text"
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                لصق نص
              </button>
            </div>
          </div>

          {inputMode === "url" ? (
            <div>
              <div className="relative">
                <input
                  type="url"
                  value={storyUrl}
                  onChange={(e) => setStoryUrl(e.target.value)}
                  placeholder="https://kabbos.com/story-title"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                يدعم موقع <strong className="text-amber-400">kabbos.com</strong> تلقائياً مع تنظيف
                الإعلانات والتعليقات وسحب القصة كاملة بضغطة زر واحدة.
              </p>
            </div>
          ) : (
            <div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={4}
                placeholder="الصق نص قصة كابوس أو أي مقال هنا مباشرة..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
              ></textarea>
              {rawText && (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  عدد الحروف: {rawText.length} حرف
                </span>
              )}
            </div>
          )}
        </div>

        {/* Start Agent Workflow CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 transition-all shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>
                  جاري سحب القصة وإعادة كتابتها ({targetDurationMinutes} دقيقة - {targetScenes} مشهد
                  - {storyLanguage === "ar" ? "عربي" : "English"})...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>
                  ابدأ تشغيل الوكيل (سحب القصة • سيناريو {targetDurationMinutes} دقيقة • أوامر صور
                  4K • إخراج يوتيوب)
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
