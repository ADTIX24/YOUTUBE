import { Sliders, Clock, Globe, Film, Video, X, Sparkles } from "lucide-react";
import { YouTubeChannelConfig } from "../types";

interface StorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDurationMinutes: number;
  setTargetDurationMinutes: (val: number) => void;
  targetScenes: number;
  setTargetScenes: (val: number) => void;
  storyLanguage: "ar" | "en";
  setStoryLanguage: (val: "ar" | "en") => void;
  selectedStyle: string;
  setSelectedStyle: (val: string) => void;
  youtubeChannels: YouTubeChannelConfig[];
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
  videoRatioPercent: number;
  setVideoRatioPercent: (val: number) => void;
  autoGenerateImages: boolean;
  setAutoGenerateImages: (val: boolean) => void;
}

export const STORY_STYLES = [
  { id: "سينمائي مشوق ومثير (YouTube Viral)", label: "سينمائي مشوق ومثير (YouTube Viral)" },
  { id: "قصة أطفال دافئة ومشوقة (Kids & Family Friendly)", label: "🧸 قصة أطفال دافئة وتربوية مشوقة (Kids)" },
  { id: "غموض وتحقيق استقصائي داكن (True Crime & Mystery)", label: "غموض وتحقيق استقصائي داكن" },
  { id: "رعب نفسي وتشويق عميق (Psychological Horror)", label: "رعب نفسي وتشويق عميق" },
  { id: "ملحمة أسطورية وتاريخية (Historical Documentary)", label: "ملحمة أسطورية وتاريخية" },
  { id: "خيال علمي وغرائب ما وراء الطبيعة (Sci-Fi & Paranormal)", label: "خيال علمي وما وراء الطبيعة" },
];

export function StorySettingsModal({
  isOpen,
  onClose,
  targetDurationMinutes,
  setTargetDurationMinutes,
  targetScenes,
  setTargetScenes,
  storyLanguage,
  setStoryLanguage,
  selectedStyle,
  setSelectedStyle,
  youtubeChannels,
  selectedChannelId,
  setSelectedChannelId,
  videoRatioPercent,
  setVideoRatioPercent,
  autoGenerateImages,
  setAutoGenerateImages,
}: StorySettingsModalProps) {
  if (!isOpen) return null;

  const handleDurationChange = (minutes: number) => {
    setTargetDurationMinutes(minutes);
    const calculatedScenes = Math.min(120, Math.max(6, Math.round(minutes * 1.5)));
    setTargetScenes(calculatedScenes);
  };

  const calculatedVideoScenes = Math.round((targetScenes * videoRatioPercent) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>إعدادات الفيديو والمشاهد المتقدمة</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                  Veo • Imagen • Audio
                </span>
              </h2>
              <p className="text-xs text-slate-400">تخصيص مدة الفيديو والمشاهد المتحركة وتوليد الوسائط</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Target YouTube Channel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span>القناة المستهدفة:</span>
            </label>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {youtubeChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.language === "ar" ? "العربية" : "English"})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              لغة السيناريو والصوت:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStoryLanguage("ar")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  storyLanguage === "ar"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🇸🇦 العربية الفصحى</span>
              </button>
              <button
                type="button"
                onClick={() => setStoryLanguage("en")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  storyLanguage === "en"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🇺🇸 English (Native)</span>
              </button>
            </div>
          </div>

          {/* Video Scenes Ratio Slider (Veo Video Generation) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-red-500/30 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 text-red-400">
                <Video className="w-4 h-4 text-red-400" />
                نسبة المشاهد المتحركة بالفيديو (Veo Models):
              </span>
              <span className="font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/25">
                {videoRatioPercent}% (~{calculatedVideoScenes} مشهد فيديو)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={videoRatioPercent}
              onChange={(e) => setVideoRatioPercent(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (صور فقط)</span>
              <span>30% (مزيج سينمائي موصى به)</span>
              <span>50%</span>
              <span>100% (فيديو بالكامل)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              * يقوم المحرك بتخصيص المشاهد الحركية وحركات الكاميرا (Motion Prompts) لذروة الأحداث لتوليدها بفيديو سينمائي 1080p/720p.
            </p>
          </div>

          {/* Auto Image Generation Toggle */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">توليد الصور والغلاف فوراً تلقائياً</span>
                <span className="text-[11px] text-slate-400 block">
                  إنشاء غلاف يوتيوب CTR وصور المشاهد الأولى مباشرة عند إنهاء السيناريو
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateImages}
                onChange={(e) => setAutoGenerateImages(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Duration Slider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                مدة الفيديو التقديرية:
              </span>
              <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {targetDurationMinutes} دقيقة
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={targetDurationMinutes}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 د (قصير)</span>
              <span>15 د (افتراضي)</span>
              <span>35 د (سرد طويل)</span>
              <span>60 د (وثائقي كامل)</span>
            </div>
          </div>

          {/* Scenes Count */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Film className="w-4 h-4 text-indigo-400" />
                إجمالي المشاهد:
              </span>
              <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                {targetScenes} مشهداً
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="120"
              step="1"
              value={targetScenes}
              onChange={(e) => setTargetScenes(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 مشاهد</span>
              <span>40 مشهداً</span>
              <span>80 مشهداً</span>
              <span>120 مشهداً</span>
            </div>
          </div>

          {/* Directing Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الأسلوب الإخراجي والنبرة:
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {STORY_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
