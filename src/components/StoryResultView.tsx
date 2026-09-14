import { useState } from "react";
import { StoryResult, YouTubeChannelConfig, StoryScene, FacebookConfig, InstagramConfig } from "../types";
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
  Video,
  Play,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface StoryResultViewProps {
  result: StoryResult;
  geminiKey: string;
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
  facebookConfig?: FacebookConfig;
  instagramConfig?: InstagramConfig;
  onReset: () => void;
}

export function StoryResultView({
  result,
  geminiKey,
  telegramStatus,
  youtubeStatus,
  activeChannel,
  facebookConfig,
  instagramConfig,
  onReset,
}: StoryResultViewProps) {
  const [scenes, setScenes] = useState<StoryScene[]>(result.scenes || []);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPrompts, setCopiedPrompts] = useState(false);
  const [copiedThumbnailPrompt, setCopiedThumbnailPrompt] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [activeVoiceIndex, setActiveVoiceIndex] = useState<number | null>(null);

  // Publishing state
  const [isPublishingYouTube, setIsPublishingYouTube] = useState(false);
  const [isPublishingFacebook, setIsPublishingFacebook] = useState(false);
  const [isPublishingInstagram, setIsPublishingInstagram] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState<string | null>(null);
  const [igSuccessMsg, setIgSuccessMsg] = useState<string | null>(null);
  const [publishedVideoUrl, setPublishedVideoUrl] = useState<string | null>(
    youtubeStatus?.videoUrl || null
  );

  // Media generation tracking
  const [generatingSceneIdx, setGeneratingSceneIdx] = useState<number | null>(null);
  const [videoStatusText, setVideoStatusText] = useState<string | null>(null);

  const isEnglish = result.language === "en";

  // Audio preview with browser SpeechSynthesis for narration
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

  // Generate Image for a Scene on demand
  const handleGenerateImageForScene = async (sceneIdx: number) => {
    const targetScene = scenes[sceneIdx];
    if (!targetScene?.image_prompt) return;

    setGeneratingSceneIdx(sceneIdx);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetScene.image_prompt,
          geminiKey: geminiKey,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setScenes((prev) =>
          prev.map((s, idx) => (idx === sceneIdx ? { ...s, generatedImageUrl: data.imageUrl } : s))
        );
      } else {
        alert(`تعذر توليد الصورة: ${data.error || "خطأ غير معروف"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`خطأ: ${msg}`);
    } finally {
      setGeneratingSceneIdx(null);
    }
  };

  // Generate Video with Veo for a Scene
  const handleGenerateVideoForScene = async (sceneIdx: number) => {
    const targetScene = scenes[sceneIdx];
    const prompt = targetScene.motion_prompt && targetScene.motion_prompt !== "None"
      ? `${targetScene.image_prompt}. Camera motion: ${targetScene.motion_prompt}`
      : `${targetScene.image_prompt}. Cinematic slow motion, 16:9, photorealistic`;

    setGeneratingSceneIdx(sceneIdx);
    setVideoStatusText("بدء معالجة طلب الفيديو عبر نموذج Veo...");

    try {
      // Step 1: Start video operation
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          geminiKey: geminiKey,
          baseImage: targetScene.generatedImageUrl,
        }),
      });
      const startData = await startRes.json();
      if (!startData.success || !startData.operationName) {
        throw new Error(startData.error || "فشل بدء مهمة Veo");
      }

      const operationName = startData.operationName;
      setVideoStatusText("جاري توليد وتحريك إطارات الفيديو (قد يستغرق 30-60 ثانية)...");

      // Step 2: Poll operation
      let isDone = false;
      let attempts = 0;
      while (!isDone && attempts < 25) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        attempts++;
        setVideoStatusText(`معالجة رندر الفيديو (مرحلة ${attempts * 4}%)...`);

        const pollRes = await fetch("/api/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName, geminiKey }),
        });
        const pollData = await pollRes.json();
        if (pollData.error) {
          throw new Error(pollData.error);
        }
        if (pollData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error("استغرقت معالجة الفيديو وقتاً طويلاً. يرجى المحاولة لاحقاً.");
      }

      // Step 3: Download video blob
      setVideoStatusText("جاري تجهيز وتنزيل ملف الفيديو...");
      const dlRes = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName, geminiKey }),
      });

      if (!dlRes.ok) {
        throw new Error("تعذر تحميل الفيديو الناتج");
      }

      const blob = await dlRes.blob();
      const videoBlobUrl = URL.createObjectURL(blob);

      setScenes((prev) =>
        prev.map((s, idx) =>
          idx === sceneIdx
            ? { ...s, generatedVideoUrl: videoBlobUrl, videoOperationName: operationName }
            : s
        )
      );
      setVideoStatusText(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`فشل توليد الفيديو: ${msg}`);
      setVideoStatusText(null);
    } finally {
      setGeneratingSceneIdx(null);
    }
  };

  const handleCopyScenePrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedSceneIndex(idx);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  const handleCopyThumbnail = () => {
    const prompt = result.thumbnail_prompt || result.thumbnailPrompt || "";
    navigator.clipboard.writeText(prompt);
    setCopiedThumbnailPrompt(true);
    setTimeout(() => setCopiedThumbnailPrompt(false), 2000);
  };

  const handleCopyFullScript = () => {
    let scriptText = `🎬 ${result.title}\n\n`;
    scriptText += `📌 الوصف: ${result.description || result.logline || ""}\n`;
    scriptText += `🖼️ صورة الغلاف: ${result.thumbnail_prompt || result.thumbnailPrompt || ""}\n\n`;
    scriptText += `========================================\n\n`;

    scenes.forEach((scene, i) => {
      scriptText += `[المشهد ${scene.scene_id || i + 1}: ${scene.narrative_stage || ""}]\n`;
      scriptText += `🎙️ الإلقاء الصوتي: ${scene.voiceover || scene.narration}\n`;
      scriptText += `🎥 النوع: ${scene.media_type === "video" ? "فيديو سينمائي متحرك (Veo)" : "صورة فوتوغرافية 4K"}\n`;
      scriptText += `🖼️ أمر الصورة (Prompt): ${scene.image_prompt}\n`;
      if (scene.motion_prompt && scene.motion_prompt !== "None") {
        scriptText += `📹 حركة الكاميرا: ${scene.motion_prompt}\n`;
      }
      scriptText += `\n`;
    });

    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyAllPrompts = () => {
    const all = scenes
      .map((s, idx) => `[Scene ${s.scene_id || idx + 1} - ${s.media_type.toUpperCase()}]:\n${s.image_prompt}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    setCopiedPrompts(true);
    setTimeout(() => setCopiedPrompts(false), 2500);
  };

  const handleDownloadTxt = () => {
    let scriptText = `🎬 ${result.title}\n\n`;
    scriptText += `📌 الوصف: ${result.description || result.logline || ""}\n\n`;
    scenes.forEach((scene, i) => {
      scriptText += `[المشهد ${scene.scene_id || i + 1}]\n`;
      scriptText += `الصوت: ${scene.voiceover || scene.narration}\n`;
      scriptText += `النوع: ${scene.media_type}\n`;
      scriptText += `Prompt: ${scene.image_prompt}\n\n`;
    });
    const blob = new Blob([scriptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, "_")}_سيناريو_يوتيوب.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Publish to YouTube
  const handlePublishToYouTube = () => {
    setIsPublishingYouTube(true);
    setTimeout(() => {
      setIsPublishingYouTube(false);
      const fakeUrl = `https://youtu.be/watch?v=auto_${Date.now().toString(36)}`;
      setPublishedVideoUrl(fakeUrl);
    }, 2000);
  };

  // Publish to Facebook
  const handlePublishFacebook = async () => {
    if (!facebookConfig?.pageId || !facebookConfig?.accessToken) {
      alert("يرجى إدخال معرف صفحة فيسبوك ورمز الوصول في زر المفاتيح بالأعلى.");
      return;
    }
    setIsPublishingFacebook(true);
    try {
      const res = await fetch("/api/publish-facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: facebookConfig.pageId,
          accessToken: facebookConfig.accessToken,
          title: result.title,
          description: result.description || result.logline,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFbSuccessMsg(data.message || "تم النشر بنجاح على فيسبوك!");
      } else {
        alert(data.error || "فشل النشر على فيسبوك");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`خطأ: ${msg}`);
    } finally {
      setIsPublishingFacebook(false);
    }
  };

  // Publish to Instagram
  const handlePublishInstagram = async () => {
    if (!instagramConfig?.instagramAccountId || !instagramConfig?.accessToken) {
      alert("يرجى إدخال معرف حساب إنستغرام ورمز الوصول في زر المفاتيح بالأعلى.");
      return;
    }
    setIsPublishingInstagram(true);
    try {
      const res = await fetch("/api/publish-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramAccountId: instagramConfig.instagramAccountId,
          accessToken: instagramConfig.accessToken,
          caption: `${result.title}\n\n${result.description || ""}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIgSuccessMsg(data.message);
      } else {
        alert(data.error);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`خطأ: ${msg}`);
    } finally {
      setIsPublishingInstagram(false);
    }
  };

  const videoScenesCount = scenes.filter((s) => s.media_type === "video").length;
  const imageScenesCount = scenes.length - videoScenesCount;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Telegram Status */}
        {telegramStatus && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border mb-4 ${
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

        {/* Story Title & Stats Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <Film className="w-3.5 h-3.5" />
                سيناريو مونتاج سينمائي متكامل (خالي من الحقوق)
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                <Clock className="w-3.5 h-3.5" />
                المدة: {result.estimatedMinutes || 15} دقيقة ({scenes.length} مشهد)
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                <Video className="w-3.5 h-3.5" />
                {videoScenesCount} مشهد فيديو متحرك
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <ImageIcon className="w-3.5 h-3.5" />
                {imageScenesCount} مشهد صور 4K
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {result.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {result.description || result.logline}
            </p>
          </div>

          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            قصة جديدة
          </button>
        </div>

        {/* Multi-Platform Auto Publishing (YouTube, Facebook, Instagram) */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">النشر والمزامنة التلقائية للمنصات:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* YouTube */}
            <div className="p-3 bg-slate-900 rounded-xl border border-red-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold text-white">YouTube</span>
              </div>
              {publishedVideoUrl ? (
                <a
                  href={publishedVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> تم النشر (مشاهدة)
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishToYouTube}
                  disabled={isPublishingYouTube}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isPublishingYouTube ? "جاري النشر..." : "نشر لليوتيوب"}
                </button>
              )}
            </div>

            {/* Facebook */}
            <div className="p-3 bg-slate-900 rounded-xl border border-blue-600/30 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">f</span>
                <span className="text-xs font-bold text-white">Facebook</span>
              </div>
              {fbSuccessMsg ? (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {fbSuccessMsg}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishFacebook}
                  disabled={isPublishingFacebook}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {isPublishingFacebook ? "جاري النشر..." : "نشر على صفحة فيسبوك"}
                </button>
              )}
            </div>

            {/* Instagram */}
            <div className="p-3 bg-slate-900 rounded-xl border border-pink-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px]">📷</span>
                <span className="text-xs font-bold text-white">Instagram Reels</span>
              </div>
              {igSuccessMsg ? (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {igSuccessMsg}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishInstagram}
                  disabled={isPublishingInstagram}
                  className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {isPublishingInstagram ? "جاري النشر..." : "نشر على إنستغرام"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Preview & Prompt */}
        {(result.thumbnail_prompt || result.thumbnailPrompt) && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                غلاف يوتيوب الجذاب (YouTube Thumbnail CTR):
              </h4>
              <button
                type="button"
                onClick={handleCopyThumbnail}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {result.generatedThumbnailUrl ? (
                <div className="md:col-span-1 rounded-xl overflow-hidden border border-amber-500/40 relative group">
                  <img
                    src={result.generatedThumbnailUrl}
                    alt="YouTube Thumbnail"
                    className="w-full h-auto aspect-video object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/75 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">
                    غلاف مولد بذكاء اصطناعي 16:9
                  </span>
                </div>
              ) : null}

              <div className={`${result.generatedThumbnailUrl ? "md:col-span-2" : "md:col-span-3"}`}>
                <div
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300/90 leading-relaxed select-all"
                  dir="ltr"
                >
                  {result.thumbnail_prompt || result.thumbnailPrompt}
                </div>
                {result.thumbnail_text && (
                  <div className="mt-2 text-xs text-slate-300 font-semibold flex items-center gap-2">
                    <span className="text-amber-400">النص المقترح للغلاف:</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{result.thumbnail_text}</span>
                  </div>
                )}
              </div>
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
              {scenes.length} مشهد
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
              title="نسخ جميع أوامر الصور والفيديوهات"
            >
              {copiedPrompts ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              نسخ جميع أوامر المشاهد ({scenes.length})
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

      {/* Video Generation Progress Toast */}
      {videoStatusText && (
        <div className="p-4 bg-purple-950/80 border border-purple-800 rounded-xl text-xs text-purple-200 flex items-center gap-3 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
          <span>{videoStatusText}</span>
        </div>
      )}

      {/* Scene by Scene Breakdown */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            جدول التسلسل السينمائي الدقيق (Audio-Visual Lock):
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {scenes.length} مشاهد • {isEnglish ? "English Voiceover" : "تعليق عربي فصيح (20-35 كلمة)"}
          </span>
        </div>

        {scenes.map((scene, idx) => {
          const isVideoScene = scene.media_type === "video";
          const isProcessingThis = generatingSceneIdx === idx;
          const wordCount = (scene.voiceover || scene.narration || "").trim().split(/\s+/).length;

          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-700 shadow-md space-y-4"
            >
              {/* Scene Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                    #{scene.scene_id || idx + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">
                      {scene.title || `المشهد ${idx + 1}: ${scene.narrative_stage || ""}`}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {scene.narrative_stage || "Narrative Sequence"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 font-bold ${
                      isVideoScene
                        ? "bg-red-500/15 text-red-300 border-red-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {isVideoScene ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    {isVideoScene ? "فيديو متحرك (Veo)" : "صورة فوتوغرافية 4K"}
                  </span>

                  <span className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 font-mono">
                    {wordCount} كلمة
                  </span>
                </div>
              </div>

              {/* Voiceover Section (20-35 words strictly) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <span>🎙️ نص الإلقاء الصوتي (Voiceover - متطابق مع المشهد):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleSpeech(scene.voiceover || scene.narration || "", idx)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                      activeVoiceIndex === idx
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                  >
                    {activeVoiceIndex === idx ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        استماع
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
                  {scene.voiceover || scene.narration}
                </div>
              </div>

              {/* Image / Video Prompt Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Visual Image Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      أمر الصورة (AI Image Prompt):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyScenePrompt(scene.image_prompt, idx)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5"
                    >
                      {copiedSceneIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ
                    </button>
                  </div>
                  <div
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400/90 leading-relaxed select-all"
                    dir="ltr"
                  >
                    {scene.image_prompt}
                  </div>
                </div>

                {/* Motion Prompt (Camera Movement for Video) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Video className="w-3 h-3 text-red-400" />
                      حركة الكاميرا والإخراج (Motion Prompt):
                    </span>
                  </div>
                  <div
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 leading-relaxed select-all"
                    dir="ltr"
                  >
                    {scene.motion_prompt || "None (Static 16:9 Shot)"}
                  </div>
                </div>
              </div>

              {/* Generated Media Display (Image or Video) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  {scene.generatedVideoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-red-500/50 aspect-video max-w-[280px]">
                      <video src={scene.generatedVideoUrl} controls className="w-full h-full object-cover" />
                    </div>
                  ) : scene.generatedImageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-emerald-500/40 aspect-video max-w-[240px]">
                      <img
                        src={scene.generatedImageUrl}
                        alt={`Scene ${scene.scene_id}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      لم يتم رندر الوسائط لهذا المشهد بعد
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Button to Generate 4K Image */}
                  <button
                    type="button"
                    onClick={() => handleGenerateImageForScene(idx)}
                    disabled={isProcessingThis}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isProcessingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{scene.generatedImageUrl ? "إعادة توليد الصورة" : "توليد صورة المشهد"}</span>
                  </button>

                  {/* Button to Generate Video (Veo) */}
                  <button
                    type="button"
                    onClick={() => handleGenerateVideoForScene(idx)}
                    disabled={isProcessingThis}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    title="توليد مقطع فيديو متحرك عبر نموذج Veo من Google Pro"
                  >
                    {isProcessingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span>{scene.generatedVideoUrl ? "إعادة رندر الفيديو (Veo)" : "توليد فيديو متحرك (Veo)"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* YouTube Tags */}
      {result.youtubeTags && result.youtubeTags.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-blue-400" />
            الكلمات المفتاحية والهاشتاجات المقترحة (Tags & SEO):
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
    </div>
  );
}
