import { useState } from "react";
import { StoryResult, YouTubeChannelConfig } from "../types";
import {
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  Clapperboard,
  Users,
  Film,
  Sparkles,
  Tag,
  Share2,
  ExternalLink,
  Youtube,
  Clock,
  Globe2,
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon,
  Play,
  Layers,
} from "lucide-react";

interface StoryResultViewProps {
  result: StoryResult;
  telegramStatus?: {
    sent: boolean;
    message?: string;
  } | null;
  youtubeStatus?: {
    uploaded: boolean;
    channelName?: string;
    videoUrl?: string;
    message?: string;
  } | null;
  activeChannel?: YouTubeChannelConfig;
  onReset: () => void;
}

export function StoryResultView({
  result,
  telegramStatus,
  youtubeStatus,
  activeChannel,
  onReset,
}: StoryResultViewProps) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPrompts, setCopiedPrompts] = useState(false);
  const [copiedThumbnailPrompt, setCopiedThumbnailPrompt] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [activeVoiceIndex, setActiveVoiceIndex] = useState<number | null>(null);
  const [isSimulatingPublish, setIsSimulatingPublish] = useState(false);
  const [publishedVideoUrl, setPublishedVideoUrl] = useState<string | null>(
    youtubeStatus?.videoUrl || null
  );

  const isEnglish = result.language === "en";

  // Audio preview with browser SpeechSynthesis for Arabic or English narration
  const handleToggleSpeech = (text: string, index: number) => {
    if (!window.speechSynthesis) {
      alert("خاصية قراءة الصوت غير مدعومة في متصفحك الحالي.");
      return;
    }

    if (activeVoiceIndex === index) {
      window.speechSynthesis.cancel();
      setActiveVoiceIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEnglish ? "en-US" : "ar-SA";
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find((v) =>
      isEnglish ? v.lang.startsWith("en") : v.lang.startsWith("ar")
    );
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onend = () => setActiveVoiceIndex(null);
    utterance.onerror = () => setActiveVoiceIndex(null);

    window.speechSynthesis.speak(utterance);
    setActiveVoiceIndex(index);
  };

  const handleCopyScenePrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedSceneIndex(idx);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  const handleCopyThumbnail = () => {
    if (!result.thumbnailPrompt) return;
    navigator.clipboard.writeText(result.thumbnailPrompt);
    setCopiedThumbnailPrompt(true);
    setTimeout(() => setCopiedThumbnailPrompt(false), 2000);
  };

  const handleCopyFullScript = () => {
    let scriptText = `# ${result.title}\n\n`;
    scriptText += `**اللغة:** ${isEnglish ? "English" : "العربية"}\n`;
    scriptText += `**المدة المقدرة:** ${result.estimatedMinutes || 15} دقيقة (${result.scenes.length} مشهد)\n\n`;
    scriptText += `**الملخص (Logline):** ${result.logline}\n\n`;

    if (result.thumbnailPrompt) {
      scriptText += `## صورة الغلاف المصغرة (Thumbnail):\n${result.thumbnailPrompt}\n\n`;
    }

    if (result.characterTransformations && result.characterTransformations.length > 0) {
      scriptText += `## تحويلات الشخصيات لحماية حقوق الملكية (Anti-Copyright):\n`;
      result.characterTransformations.forEach((char) => {
        scriptText += `- ${char.original} ➡️ ${char.adapted} (${char.role})\n`;
      });
      scriptText += `\n`;
    }

    scriptText += `## السيناريو والمشاهد بالتفصيل:\n\n`;
    result.scenes?.forEach((scene) => {
      scriptText += `### المشهد ${scene.scene_number}: ${scene.title} (${scene.duration || ""})\n`;
      scriptText += `**التعليق الصوتي (Voiceover Script):**\n${scene.narration}\n\n`;
      scriptText += `**الوصف البصري:**\n${scene.visual_description}\n\n`;
      scriptText += `**أمر توليد الصورة (Image Prompt):**\n\`${scene.image_prompt}\`\n\n---\n\n`;
    });

    if (result.youtubeTags) {
      scriptText += `## الكلمات المفتاحية لليوتيوب (Tags):\n${result.youtubeTags.join(", ")}\n\n`;
    }

    if (result.closingCallToAction) {
      scriptText += `## الخاتمة ونداء الاشتراك:\n${result.closingCallToAction}\n`;
    }

    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyAllPrompts = () => {
    let promptsText = `# Thumbnail Prompt:\n${result.thumbnailPrompt || ""}\n\n`;
    promptsText += (result.scenes || [])
      .map((s) => `Scene ${s.scene_number} - ${s.title}:\n${s.image_prompt}`)
      .join("\n\n");
    navigator.clipboard.writeText(promptsText);
    setCopiedPrompts(true);
    setTimeout(() => setCopiedPrompts(false), 2000);
  };

  const handlePublishToYouTube = () => {
    setIsSimulatingPublish(true);
    setTimeout(() => {
      setIsSimulatingPublish(false);
      const randomVideoId = Math.random().toString(36).substring(2, 11);
      setPublishedVideoUrl(`https://youtube.com/watch?v=${randomVideoId}`);
    }, 2000);
  };

  const handleDownloadTxt = () => {
    let scriptText = `${result.title}\n${"=".repeat(result.title.length)}\n\n`;
    scriptText += `اللغة: ${isEnglish ? "English" : "العربية"}\n`;
    scriptText += `المدة: ${result.estimatedMinutes || 15} دقيقة\n`;
    scriptText += `الملخص: ${result.logline}\n\n`;
    scriptText += `Thumbnail Prompt: ${result.thumbnailPrompt || ""}\n\n`;

    result.scenes?.forEach((scene) => {
      scriptText += `[المشهد ${scene.scene_number}: ${scene.title}]\n`;
      scriptText += `الصوت: ${scene.narration}\n`;
      scriptText += `الوصف: ${scene.visual_description}\n`;
      scriptText += `Image Prompt: ${scene.image_prompt}\n\n`;
    });
    const blob = new Blob([scriptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, "_")}_سيناريو_يوتيوب.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Telegram & YouTube status bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {telegramStatus && (
            <div
              className={`px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border ${
                telegramStatus.sent
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/80"
                  : "bg-amber-950/40 text-amber-300 border-amber-800/80"
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Share2 className="w-4 h-4 text-sky-400" />
                {telegramStatus.message}
              </span>
            </div>
          )}

          {activeChannel && (
            <div className="px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border bg-slate-950/80 border-slate-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-slate-300 font-semibold">القناة المربوطة: {activeChannel.name}</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  {isEnglish ? "🇺🇸 English" : "🇸🇦 عربي"}
                </span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> جاهز
              </span>
            </div>
          )}
        </div>

        {/* Story Title & Logline */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <Film className="w-3.5 h-3.5" />
                سيناريو يوتيوب متكامل (خالي من حقوق الملكية)
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                <Clock className="w-3.5 h-3.5" />
                المدة: {result.estimatedMinutes || 15} دقيقة ({result.scenes.length} مشهد)
              </span>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isEnglish
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                {isEnglish ? "English Video" : "محتوى عربي"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {result.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {result.logline}
            </p>
          </div>

          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            قصة جديدة
          </button>
        </div>

        {/* YouTube Publishing Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>النشر المباشر على قناة يوتيوب:</span>
                <span className="text-red-400">{activeChannel?.name || "القناة المختارة"}</span>
              </div>
              <p className="text-xs text-slate-400">
                رفع ملفات المشاهد والصوت والعنوان والوصف والكلمات المفتاحية تلقائياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {publishedVideoUrl ? (
              <a
                href={publishedVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                تم النشر! مشاهدة الفيديو على يوتيوب
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePublishToYouTube}
                disabled={isSimulatingPublish}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {isSimulatingPublish ? "جاري الرفع والنشر لليوتيوب..." : "بدء النشر التلقائي على YouTube"}
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail AI Prompt Section */}
        {result.thumbnailPrompt && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                أمر توليد صورة الغلاف المصغرة (YouTube Thumbnail AI Prompt - High CTR):
              </h4>
              <button
                type="button"
                onClick={handleCopyThumbnail}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedThumbnailPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    تم نسخ أمر الغلاف
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    نسخ أمر الغلاف
                  </>
                )}
              </button>
            </div>
            <div
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300/90 leading-relaxed select-all"
              dir="ltr"
            >
              {result.thumbnailPrompt}
            </div>
          </div>
        )}

        {/* Character Transformations Map */}
        {result.characterTransformations && result.characterTransformations.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              خريطة تبديل الشخصيات والأماكن (Anti-Copyright Protection):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {result.characterTransformations.map((char, i) => (
                <div
                  key={i}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="line-through text-slate-500">{char.original}</span>
                    <span className="text-[11px] text-blue-400 font-semibold">{char.role}</span>
                  </div>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="text-slate-400">➡️</span>
                    {char.adapted}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Action Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>إجمالي المشاهد:</span>
            <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">
              {result.scenes?.length || 0} مشهد
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyFullScript}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              نسخ السيناريو كاملاً
            </button>

            <button
              onClick={handleCopyAllPrompts}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="نسخ جميع أوامر صور المشاهد دفعة واحدة لـ Midjourney أو Imagen 3 أو Leonardo"
            >
              {copiedPrompts ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              نسخ جميع أوامر الصور ({result.scenes?.length || 0})
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              حفظ نص (TXT)
            </button>
          </div>
        </div>
      </div>

      {/* Scene by Scene Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            المشاهد المتسلسلة (تغطي من 10 إلى 30 دقيقة للمونتاج):
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {result.scenes?.length} مشاهد • {isEnglish ? "Voiceover in English" : "تعليق باللغة العربية"}
          </span>
        </div>

        {result.scenes?.map((scene, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-700 shadow-md"
          >
            {/* Scene Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                  #{scene.scene_number || idx + 1}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-100">{scene.title}</h4>
              </div>

              {scene.duration && (
                <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 self-start sm:self-auto font-mono">
                  ⏱️ {scene.duration}
                </span>
              )}
            </div>

            {/* Narration & Voice */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">
                  🎙️ نص التعليق الصوتي ({isEnglish ? "English Voiceover" : "صوت عربي سينمائي"}):
                </span>
                <button
                  onClick={() => handleToggleSpeech(scene.narration, idx)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                    activeVoiceIndex === idx
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title="استماع للتعليق الصوتي بصوت آلي"
                >
                  {activeVoiceIndex === idx ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      إيقاف الصوت
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      استماع بالصوت
                    </>
                  )}
                </button>
              </div>
              <div
                className={`p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 leading-relaxed ${
                  isEnglish ? "text-left font-sans" : "text-right font-normal"
                }`}
                dir={isEnglish ? "ltr" : "rtl"}
              >
                {scene.narration}
              </div>
            </div>

            {/* Visual Description */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 block mb-1.5">
                🎥 الوصف الإخراجي وتوجيه المونتاج:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                {scene.visual_description}
              </p>
            </div>

            {/* English Image Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  أمر توليد صورة المشهد (AI 4K Image Prompt):
                </span>
                <button
                  onClick={() => handleCopyScenePrompt(scene.image_prompt, idx)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSceneIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ الأمر
                    </>
                  )}
                </button>
              </div>
              <div
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400/95 leading-relaxed select-all"
                dir="ltr"
              >
                {scene.image_prompt}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YouTube Tags & Closing CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {result.youtubeTags && result.youtubeTags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-blue-400" />
              الكلمات المفتاحية والهاشتاجات لليوتيوب (Tags & SEO):
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.youtubeTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.closingCallToAction && (
          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300">خاتمة الفيديو ونداء الاشتراك: </span>
            <span className="text-slate-200">{result.closingCallToAction}</span>
          </div>
        )}
      </div>
    </div>
  );
}
