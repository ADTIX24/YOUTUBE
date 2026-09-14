import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Clock,
  Film,
  Video,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Flame,
  Info,
} from "lucide-react";
import { StoryProposal } from "../types";

interface StoryProposalCardProps {
  proposal: StoryProposal;
  onApprove: (customizedParams: {
    durationMinutes: number;
    totalScenes: number;
    videoScenesCount: number;
    videoRatioPercent: number;
    autoGenerateImages: boolean;
  }) => void;
  onCancel: () => void;
  isExecuting: boolean;
}

export function StoryProposalCard({
  proposal,
  onApprove,
  onCancel,
  isExecuting,
}: StoryProposalCardProps) {
  const { language, t } = useLanguage();
  // Local editable state initialized with proposal recommendations
  const [durationMinutes, setDurationMinutes] = useState(proposal.recommendedMinutes);
  const [totalScenes, setTotalScenes] = useState(proposal.recommendedScenesCount);
  const [videoScenesCount, setVideoScenesCount] = useState(proposal.recommendedVideoScenesCount);
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);
  const [showFullCadence, setShowFullCadence] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  // When duration changes, suggest recalculated scenes
  const handleDurationChange = (val: number) => {
    setDurationMinutes(val);
    const newScenes = Math.max(6, Math.min(45, Math.round(val * 1.15)));
    setTotalScenes(newScenes);
    const newVideos = Math.max(2, Math.min(Math.round(newScenes * 0.28), newScenes - 4));
    setVideoScenesCount(newVideos);
  };

  const imageScenesCount = Math.max(0, totalScenes - videoScenesCount);
  const videoRatioPercent = Math.round((videoScenesCount / Math.max(1, totalScenes)) * 100);

  const handleConfirm = () => {
    onApprove({
      durationMinutes,
      totalScenes,
      videoScenesCount,
      videoRatioPercent,
      autoGenerateImages,
    });
  };

  return (
    <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Director's Proposal Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t("proposalTitle")}</h2>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                {t("proposalBadge")}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t("proposalSubtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isExecuting}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>{t("changeStory")}</span>
        </button>
      </div>

      {/* Story Title & Synopsis */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-amber-200">{proposal.storyTitle}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {proposal.genre}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              كثافة السرد: {proposal.narrativeDensity === "epic" ? "ملحمية" : proposal.narrativeDensity === "dense" ? "غنية بالأحداث" : proposal.narrativeDensity === "light" ? "سريعة وموجزة" : "متوسطة ومتوازنة"}
            </span>
            {proposal.estimatedWords && (
              <span className="text-[11px] text-slate-500 font-mono">
                ~{proposal.estimatedWords} كلمة
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{proposal.storySummary}</p>
      </div>

      {/* Hero Stats Grid (The Core Proposal Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Duration */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold">
            <Clock className="w-4 h-4" />
            <span>{t("estimatedDuration")}</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {durationMinutes} <span className="text-xs font-normal text-slate-400">{t("minutes")}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">{t("durationRange")}</span>
        </div>

        {/* Metric 2: Total Scenes */}
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-semibold">
            <Film className="w-4 h-4" />
            <span>{t("totalScenesMetric")}</span>
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {totalScenes} <span className="text-xs font-normal text-slate-400">{t("sceneWord")}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">{t("perSceneWords")}</span>
        </div>

        {/* Metric 3: Video Scenes */}
        <div className="bg-slate-950 p-4 rounded-xl border border-red-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-semibold">
            <Video className="w-4 h-4" />
            <span>{t("videoScenesMetric")}</span>
          </div>
          <div className="text-2xl font-black text-red-300 font-mono">
            {videoScenesCount} <span className="text-xs font-normal text-slate-400">({videoRatioPercent}%)</span>
          </div>
          <span className="text-[10px] text-red-400/80 block">{t("videoPeakDesc")}</span>
        </div>

        {/* Metric 4: Image Scenes */}
        <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-semibold">
            <ImageIcon className="w-4 h-4" />
            <span>{t("imageScenesMetric")}</span>
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono">
            {imageScenesCount}
          </div>
          <span className="text-[10px] text-blue-400/80 block">{t("imageDetailsDesc")}</span>
        </div>
      </div>

      {/* Strategic Retention Strategy Insight Box */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-950 to-amber-950/40 p-4 rounded-xl border border-red-500/30 flex items-start gap-3">
        <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-red-300 block">
            استراتيجية الحفاظ على المشاهد ومنع الملل (Audience Retention Lock):
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {proposal.retentionStrategy}
          </p>
        </div>
      </div>

      {/* Visual Timeline Bar (Cadence Overview) */}
      <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>خريطة التوزيع الزمني التناوبي للمشاهد (Cadence Map):</span>
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              فيديو متحرك ({videoScenesCount})
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              صورة 4K ({imageScenesCount})
            </span>
          </div>
        </div>

        {/* Visual Blocks Strip */}
        <div className="flex gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {proposal.cadenceMap.slice(0, totalScenes).map((cadence, idx) => {
            const isVideo = cadence.media_type === "video";
            return (
              <div
                key={idx}
                title={`المشهد ${idx + 1}: ${cadence.stage_name} (${isVideo ? "فيديو" : "صورة"})`}
                className={`flex-1 min-w-[20px] h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${
                  isVideo
                    ? "bg-red-600 text-white shadow-sm shadow-red-500/50 border border-red-400"
                    : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                }`}
              >
                {isVideo ? "🎥" : idx + 1}
              </div>
            );
          })}
        </div>

        {/* Cadence Milestones Highlight */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block">1. مشهد 1 (فيديو):</span>
            <span className="text-slate-400">خطاف البداية لشد الانتباه في 5 ثوانٍ</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-blue-400 font-bold block">2. مشاهد 2-{Math.max(3, Math.round(totalScenes * 0.25) - 1)} (صور):</span>
            <span className="text-slate-400">بناء الأجواء والتحقيقات والوثائق</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block">3. مشهد {Math.round(totalScenes * 0.5)} (فيديو):</span>
            <span className="text-slate-400">نقطة التحول المركزية لكسر الملل</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block">4. مشهد {Math.round(totalScenes * 0.8)} (فيديو):</span>
            <span className="text-slate-400">ذروة الأحداث والانفجار الدرامي</span>
          </div>
        </div>

        {/* Toggle Detailed Cadence List */}
        <button
          type="button"
          onClick={() => setShowFullCadence(!showFullCadence)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1 cursor-pointer font-semibold"
        >
          {showFullCadence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showFullCadence ? "إخفاء التفاصيل الكاملة للمشاهد" : "عرض خريطة المشاهد الـ " + totalScenes + " بالتفصيل والتعليل السينمائي"}</span>
        </button>

        {showFullCadence && (
          <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-slate-800">
            {proposal.cadenceMap.slice(0, totalScenes).map((item) => (
              <div
                key={item.scene_index}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 text-xs border border-slate-800"
              >
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                    item.media_type === "video"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {item.media_type === "video" ? "🎥 فيديو" : "🖼️ صورة"} #{item.scene_index}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-slate-200 block">{item.stage_name}</span>
                  <span className="text-slate-400 text-[11px]">{item.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional Fine-Tuning Slider Section */}
      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowAdjustments(!showAdjustments)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>تخصيص يدوي للمدة وعدد الفيديوهات قبل الاعتماد (اختياري)</span>
          {showAdjustments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showAdjustments && (
          <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
            {/* Duration Slider (5 to 40 minutes) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  مدة الفيديو (5 إلى 40 دقيقة):
                </span>
                <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                  {durationMinutes} دقيقة
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={durationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5 د (قصير)</span>
                <span>15 د (موصى به)</span>
                <span>25 د</span>
                <span>40 د (وثائقي كامل)</span>
              </div>
            </div>

            {/* Video Scenes Count Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1 text-red-400">
                  <Video className="w-3.5 h-3.5" />
                  عدد مشاهد الفيديو Veo:
                </span>
                <span className="font-bold text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                  {videoScenesCount} فيديو ({imageScenesCount} صورة)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(2, totalScenes - 2)}
                step="1"
                value={videoScenesCount}
                onChange={(e) => setVideoScenesCount(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
              />
            </div>

            {/* Auto Generate Images Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                توليد الغلاف وصور المشاهد الأولى تلقائياً
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={(e) => setAutoGenerateImages(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isExecuting}
          className="w-full sm:flex-1 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 transition-all shadow-xl shadow-orange-600/25 disabled:opacity-50 flex items-center justify-center gap-2.5 text-base cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{t("approveBtn")}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isExecuting}
          className="w-full sm:w-auto py-4 px-5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-center"
        >
          {t("cancelProposalBtn")}
        </button>
      </div>
    </div>
  );
}
