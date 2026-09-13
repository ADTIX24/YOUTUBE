import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StoryForm } from "./components/StoryForm";
import { StoryResultView } from "./components/StoryResultView";
import { ApiKeysModal } from "./components/ApiKeysModal";
import { SetupGuide } from "./components/SetupGuide";
import { StoryResult, YouTubeChannelConfig } from "./types";
import {
  AlertCircle,
  Sparkles,
  Loader2,
  KeyRound,
  Youtube,
  Clock,
  Globe2,
} from "lucide-react";

const INITIAL_YOUTUBE_CHANNELS: YouTubeChannelConfig[] = [
  {
    id: "ch_arabic_main",
    name: "قناة القصص العربية (Arabic Channel)",
    language: "ar",
    autoUpload: true,
    privacyStatus: "unlisted",
  },
  {
    id: "ch_english_main",
    name: "Mysteries & Chronicles (English Channel)",
    language: "en",
    autoUpload: true,
    privacyStatus: "unlisted",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"agent" | "guide">("agent");
  const [serverConnected, setServerConnected] = useState(true);
  const [hasServerKey, setHasServerKey] = useState(false);

  // API Keys state lifted to App level so Header button & Form share state
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Multi-channel YouTube configuration state
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannelConfig[]>(() => {
    try {
      const saved = localStorage.getItem("yt_channels_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_YOUTUBE_CHANNELS;
  });

  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    return youtubeChannels[0]?.id || INITIAL_YOUTUBE_CHANNELS[0].id;
  });

  // Save channels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("yt_channels_config", JSON.stringify(youtubeChannels));
    } catch {}
  }, [youtubeChannels]);

  // Telegram test state
  const [testingTg, setTestingTg] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{
    success: boolean;
    botUsername?: string;
    error?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<StoryResult | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<{
    sent: boolean;
    message?: string;
  } | null>(null);

  // Check health and server Gemini status
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setServerConnected(true);
          setHasServerKey(Boolean(data.hasServerGeminiKey));
        }
      })
      .catch(() => {
        setServerConnected(false);
      });
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      alert("يرجى إدخال توكن البوت ومعرف المحادثة لاختبار الاتصال.");
      return;
    }
    setTestingTg(true);
    setTgTestResult(null);
    try {
      const res = await fetch("/api/test-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: telegramToken, chatId: telegramChatId }),
      });
      const data = await res.json();
      setTgTestResult(data);
    } catch (e: unknown) {
      const errStr = e instanceof Error ? e.message : String(e);
      setTgTestResult({ success: false, error: errStr });
    } finally {
      setTestingTg(false);
    }
  };

  const handleStartAgent = async (params: {
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
  }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTelegramStatus(null);
    setLoadingStep(1);

    const langLabel = params.storyLanguage === "en" ? "الإنجليزية (English)" : "العربية";
    setLoadingText(
      `⏳ الخطوة 1/4: جلب قصة كابوس kabbos.com واستخراج النصوص وتنظيفها من الإعلانات...`
    );

    // Simulated progress steps with realistic milestones
    const stepTimer1 = setTimeout(() => {
      setLoadingStep(2);
      setLoadingText(
        `🧠 الخطوة 2/4: تجريد الملكية الفكرية وتغيير الشخصيات وتوسيع السرد ليناسب ${params.targetDurationMinutes} دقيقة باللغة ${langLabel}...`
      );
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(3);
      setLoadingText(
        `🎬 الخطوة 3/4: تفصيل ${params.targetScenes} مشهداً بالتعليق الصوتي وأوامر صور 4K وغلاف YouTube Thumbnail...`
      );
    }, 6000);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep(4);
      setLoadingText(
        `🚀 الخطوة 4/4: إعداد حزمة الفيديو وربطها مع قناة ${
          youtubeChannels.find((ch) => ch.id === params.selectedChannelId)?.name || "اليوتيوب"
        }...`
      );
    }, 9000);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        // If server returned HTML (e.g. 404/504 gateway timeout or Vercel crash page)
        const isHtml = responseText.includes("<html") || responseText.includes("<!DOCTYPE");
        if (isHtml || responseText.startsWith("The page")) {
          throw new Error(
            `استجاب الخادم بصفحة خطأ غير متوقعة (HTTP ${response.status}). قد يكون وقت التنفيذ تجاوز الحد المسموح أو هناك خطأ في مسار الخادم.`
          );
        } else {
          throw new Error(`تعذر قراءة استجابة الخادم: ${responseText.slice(0, 150)}`);
        }
      }

      if (data.success && data.result) {
        setResult(data.result);
        if (data.telegramStatus) {
          setTelegramStatus(data.telegramStatus);
        }
      } else {
        setError(data.error || "حدث خطأ غير معروف أثناء معالجة القصة.");
      }
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`تعذر الاتصال بالخادم: ${errMsg}. يرجى المحاولة لاحقاً.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isGeminiConfigured = Boolean(geminiKey.trim() || hasServerKey);
  const isTgConfigured = Boolean(telegramToken.trim() && telegramChatId.trim());
  const activeChannel = youtubeChannels.find((ch) => ch.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Header with Dedicated API Keys & Channels Button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenKeysModal={() => setShowKeysModal(true)}
        isGeminiConfigured={isGeminiConfigured}
        isTgConfigured={isTgConfigured}
        serverConnected={serverConnected}
        hasServerKey={hasServerKey}
      />

      {/* Global API Keys & YouTube Channels Modal */}
      <ApiKeysModal
        isOpen={showKeysModal}
        onClose={() => setShowKeysModal(false)}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
        telegramToken={telegramToken}
        setTelegramToken={setTelegramToken}
        telegramChatId={telegramChatId}
        setTelegramChatId={setTelegramChatId}
        hasServerKey={hasServerKey}
        testingTg={testingTg}
        tgTestResult={tgTestResult}
        onTestTelegram={handleTestTelegram}
        youtubeChannels={youtubeChannels}
        setYoutubeChannels={setYoutubeChannels}
        selectedChannelId={selectedChannelId}
        setSelectedChannelId={setSelectedChannelId}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800 text-red-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-1">تنبيه أثناء المعالجة:</span>
              <p className="leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs px-2 py-1 bg-red-900/50 rounded-lg cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Tab 1: Agent Dashboard */}
        {activeTab === "agent" && (
          <div className="space-y-6">
            {!result ? (
              <>
                {/* Intro summary banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          الوكيل التلقائي لصناعة فيديوهات يوتيوب (Agentic Workflow)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1">
                          <Youtube className="w-3.5 h-3.5" />
                          دعم القنوات المتعددة (عربي / إنجليزي)
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        سحب قصص kabbos.com وتحويلها إلى سيناريوهات 10-30 دقيقة بدون حقوق نشر
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        الوكيل يقوم بسحب القصة، وتجريد الملكية الفكرية، وتوسيع السرد ليغطي المدة
                        المحددة (10 إلى 30 دقيقة)، وتقسيمها إلى 10-30 مشهداً مع نصوص الصوت وأوامر
                        الصور 4K وغلاف YouTube Thumbnail تمهيداً للنشر.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowKeysModal(true)}
                      className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>قنوات يوتيوب والمفاتيح</span>
                    </button>
                  </div>
                </div>

                {/* Form Input Card */}
                <StoryForm
                  onSubmit={handleStartAgent}
                  isLoading={isLoading}
                  hasServerKey={hasServerKey}
                  geminiKey={geminiKey}
                  telegramToken={telegramToken}
                  telegramChatId={telegramChatId}
                  onOpenKeysModal={() => setShowKeysModal(true)}
                  youtubeChannels={youtubeChannels}
                  selectedChannelId={selectedChannelId}
                  setSelectedChannelId={setSelectedChannelId}
                />

                {/* Loading Status Indicator */}
                {isLoading && (
                  <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{loadingText}</div>
                    <div className="w-full max-w-md mx-auto bg-slate-950 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-700"
                        style={{ width: `${(loadingStep / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Story Output Result */
              <StoryResultView
                result={result}
                telegramStatus={telegramStatus}
                activeChannel={activeChannel}
                onReset={() => setResult(null)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Setup & Deployment Guide */}
        {activeTab === "guide" && <SetupGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>وكيل صانع القصص وسيناريوهات يوتيوب • متوافق مع kabbos.com وتعدد اللغات والقنوات</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>مدعوم بـ Google Gemini</span>
            <span>•</span>
            <button
              onClick={() => setShowKeysModal(true)}
              className="text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              مفاتيح وقنوات الربط
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
