import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StoryForm } from "./components/StoryForm";
import { StoryProposalCard } from "./components/StoryProposalCard";
import { StoryResultView } from "./components/StoryResultView";
import { ApiKeysModal } from "./components/ApiKeysModal";
import { StorySettingsModal, STORY_STYLES } from "./components/StorySettingsModal";
import { McpManagerModal } from "./components/McpManagerModal";
import { SetupGuide } from "./components/SetupGuide";
import { useLanguage } from "./context/LanguageContext";
import {
  StoryResult,
  StoryProposal,
  YouTubeChannelConfig,
  FacebookConfig,
  InstagramConfig,
  McpServerConfig,
} from "./types";
import { AlertCircle, Loader2 } from "lucide-react";

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

const INITIAL_MCP_SERVERS: McpServerConfig[] = [
  {
    id: "mcp_kabbos_feed",
    name: "موقع كابوس (Kabbos Feed Engine)",
    serverUrl: "https://kabbos.com/feed",
    description: "تغذية حية ومقالات رعب وغموض وخوارق",
    status: "connected",
    toolsCount: 2,
  },
];

export default function App() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"agent" | "guide">("agent");
  const [serverConnected, setServerConnected] = useState(true);
  const [hasServerKey, setHasServerKey] = useState(false);

  // Modals state (Vercel ZIP modal completely removed)
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);

  // Keys state
  const [geminiKey, setGeminiKey] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Facebook & Instagram config
  const [facebookConfig, setFacebookConfig] = useState<FacebookConfig>(() => {
    try {
      const saved = localStorage.getItem("fb_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { pageId: "", accessToken: "", autoPostVideo: true };
  });

  const [instagramConfig, setInstagramConfig] = useState<InstagramConfig>(() => {
    try {
      const saved = localStorage.getItem("ig_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { instagramAccountId: "", accessToken: "", autoPostReel: true };
  });

  // MCP Servers
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(() => {
    try {
      const saved = localStorage.getItem("mcp_servers_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MCP_SERVERS;
  });

  // Video Settings state
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(15);
  const [targetScenes, setTargetScenes] = useState(15);
  const [storyLanguage, setStoryLanguage] = useState<"ar" | "en">("ar");
  const [selectedStyle, setSelectedStyle] = useState(STORY_STYLES[0].id);
  const [videoRatioPercent, setVideoRatioPercent] = useState(30); // 30% Veo video scenes by default
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);

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

  // Save configs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("yt_channels_config", JSON.stringify(youtubeChannels));
    } catch {}
  }, [youtubeChannels]);

  useEffect(() => {
    try {
      localStorage.setItem("fb_config", JSON.stringify(facebookConfig));
    } catch {}
  }, [facebookConfig]);

  useEffect(() => {
    try {
      localStorage.setItem("ig_config", JSON.stringify(instagramConfig));
    } catch {}
  }, [instagramConfig]);

  useEffect(() => {
    try {
      localStorage.setItem("mcp_servers_config", JSON.stringify(mcpServers));
    } catch {}
  }, [mcpServers]);

  // Sync language with selected channel
  useEffect(() => {
    const ch = youtubeChannels.find((c) => c.id === selectedChannelId);
    if (ch?.language) {
      setStoryLanguage(ch.language);
    }
  }, [selectedChannelId, youtubeChannels]);

  // Telegram test state
  const [testingTg, setTestingTg] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{
    success: boolean;
    botUsername?: string;
    error?: string;
  } | null>(null);

  const [proposal, setProposal] = useState<StoryProposal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingInput, setPendingInput] = useState<{ storyUrl: string; rawText: string } | null>(null);

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

  const handleAnalyzeStory = async (input: { storyUrl: string; rawText: string }) => {
    setIsAnalyzing(true);
    setError(null);
    setProposal(null);
    setPendingInput(input);

    try {
      const response = await fetch("/api/analyze-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey,
          storyUrl: input.storyUrl,
          rawText: input.rawText,
          targetDurationMinutes,
          storyLanguage,
          style: selectedStyle,
        }),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        if (response.status === 504 || responseText.includes("timed out") || responseText.includes("504")) {
          throw new Error("انتهت مهلة استجابة الخادم (Gateway Timeout 504). يُفضل لصق نص القصة مباشرة أو زيادة المهلة في إعدادات السيرفر.");
        }
        if (responseText.includes("A server error has occurred") || response.status >= 500) {
          throw new Error(`تعذر على الخادم معالجة الطلب (خطأ 500 على السيرفر). تأكد من إعداد مفتاح GEMINI_API_KEY في متغيرات البيئة (Environment Variables) ومن صلاحية رابط القصة.`);
        }
        throw new Error(`استجاب الخادم ببيانات غير متوقعة (HTTP ${response.status}): ${responseText.slice(0, 120)}`);
      }
      if (data.success && data.proposal) {
        setProposal(data.proposal);
        if (data.proposal.recommendedMinutes) {
          setTargetDurationMinutes(data.proposal.recommendedMinutes);
        }
        if (data.proposal.recommendedScenesCount) {
          setTargetScenes(data.proposal.recommendedScenesCount);
        }
        if (data.proposal.recommendedVideoScenesCount && data.proposal.recommendedScenesCount) {
          const ratio = Math.round(
            (data.proposal.recommendedVideoScenesCount / data.proposal.recommendedScenesCount) * 100
          );
          setVideoRatioPercent(ratio);
        }
      } else {
        setError(data.error || "تعذر فحص القصة. يرجى التأكد من صحة الرابط أو المحتوى.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`فشل الاتصال بخدمة التحليل: ${errMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveProposal = (customized: {
    durationMinutes: number;
    totalScenes: number;
    videoScenesCount: number;
    videoRatioPercent: number;
    autoGenerateImages: boolean;
  }) => {
    setTargetDurationMinutes(customized.durationMinutes);
    setTargetScenes(customized.totalScenes);
    setVideoRatioPercent(customized.videoRatioPercent);
    setAutoGenerateImages(customized.autoGenerateImages);

    handleStartAgent({
      geminiKey,
      storyUrl: pendingInput?.storyUrl || "",
      rawText: pendingInput?.rawText || "",
      telegramToken,
      telegramChatId,
      style: selectedStyle,
      targetScenes: customized.totalScenes,
      storyLanguage,
      targetDurationMinutes: customized.durationMinutes,
      selectedChannelId,
      videoRatioPercent: customized.videoRatioPercent,
      autoGenerateImages: customized.autoGenerateImages,
    });
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
    videoRatioPercent: number;
    autoGenerateImages: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTelegramStatus(null);
    setLoadingStep(1);

    const langLabel = params.storyLanguage === "en" ? "الإنجليزية" : "العربية";
    setLoadingText(
      `⏳ الخطوة 1/4: جلب القصة واستخراج النصوص وتنقيتها من الإعلانات...`
    );

    const stepTimer1 = setTimeout(() => {
      setLoadingStep(2);
      setLoadingText(
        `🧠 الخطوة 2/4: المخرج الوثائقي ينظم التسلسل الزمني والتطابق السمعي-البصري (20-35 كلمة صوتية)...`
      );
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(3);
      setLoadingText(
        `🎬 الخطوة 3/4: تفصيل ${params.targetScenes} مشهداً، وتحديد لقطات الفيديو Veo (${params.videoRatioPercent}%) والصور 4K...`
      );
    }, 6000);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep(4);
      setLoadingText(`🚀 الخطوة 4/4: توليد الصور التلقائية والغلاف عالي الـ CTR وتجهيز السيناريو...`);
    }, 9500);

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
        const isHtml = responseText.includes("<html") || responseText.includes("<!DOCTYPE");
        if (isHtml || responseText.startsWith("The page")) {
          throw new Error(
            `استجاب الخادم بصفحة خطأ غير متوقعة (HTTP ${response.status}). يرجى التأكد من تشغيل الخادم.`
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
      setError(`تعذر إكمال المعالجة: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isGeminiConfigured = Boolean(geminiKey.trim() || hasServerKey);
  const isTgConfigured = Boolean(telegramToken.trim() && telegramChatId.trim());
  const activeChannel = youtubeChannels.find((ch) => ch.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Clean Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenKeysModal={() => setShowKeysModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onOpenMcpModal={() => setShowMcpModal(true)}
        isGeminiConfigured={isGeminiConfigured}
        isTgConfigured={isTgConfigured}
        mcpConnectedCount={mcpServers.length}
      />

      {/* Global API Keys & Accounts Modal */}
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
        facebookConfig={facebookConfig}
        setFacebookConfig={setFacebookConfig}
        instagramConfig={instagramConfig}
        setInstagramConfig={setInstagramConfig}
      />

      {/* Advanced Video Settings Modal */}
      <StorySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        targetDurationMinutes={targetDurationMinutes}
        setTargetDurationMinutes={setTargetDurationMinutes}
        targetScenes={targetScenes}
        setTargetScenes={setTargetScenes}
        storyLanguage={storyLanguage}
        setStoryLanguage={setStoryLanguage}
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
        youtubeChannels={youtubeChannels}
        selectedChannelId={selectedChannelId}
        setSelectedChannelId={setSelectedChannelId}
        videoRatioPercent={videoRatioPercent}
        setVideoRatioPercent={setVideoRatioPercent}
        autoGenerateImages={autoGenerateImages}
        setAutoGenerateImages={setAutoGenerateImages}
      />

      {/* MCP Manager Modal */}
      <McpManagerModal
        isOpen={showMcpModal}
        onClose={() => setShowMcpModal(false)}
        mcpServers={mcpServers}
        setMcpServers={setMcpServers}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-1">تنبيه:</span>
              <p className="leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs px-2.5 py-1 bg-red-900/50 rounded-lg cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Tab 1: Agent Workspace */}
        {activeTab === "agent" && (
          <div className="space-y-6">
            {!result ? (
              <>
                {proposal ? (
                  /* Director's Proposed Cadence & Production Plan */
                  <StoryProposalCard
                    proposal={proposal}
                    onApprove={handleApproveProposal}
                    onCancel={() => setProposal(null)}
                    isExecuting={isLoading}
                  />
                ) : (
                  /* Clean Form with Proposal Trigger */
                  <StoryForm
                    onSubmit={handleStartAgent}
                    onAnalyze={handleAnalyzeStory}
                    isLoading={isLoading}
                    isAnalyzing={isAnalyzing}
                    hasServerKey={hasServerKey}
                    geminiKey={geminiKey}
                    telegramToken={telegramToken}
                    telegramChatId={telegramChatId}
                    onOpenKeysModal={() => setShowKeysModal(true)}
                    onOpenSettingsModal={() => setShowSettingsModal(true)}
                    targetDurationMinutes={targetDurationMinutes}
                    targetScenes={targetScenes}
                    storyLanguage={storyLanguage}
                    selectedStyle={selectedStyle}
                    selectedChannelId={selectedChannelId}
                    videoRatioPercent={videoRatioPercent}
                    autoGenerateImages={autoGenerateImages}
                  />
                )}

                {/* Loading Status Indicator */}
                {isLoading && (
                  <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{loadingText}</div>
                    <div className="w-full max-w-md mx-auto bg-slate-950 rounded-full h-2 overflow-hidden">
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
                geminiKey={geminiKey}
                telegramStatus={telegramStatus}
                activeChannel={activeChannel}
                facebookConfig={facebookConfig}
                instagramConfig={instagramConfig}
                onReset={() => {
                  setResult(null);
                  setProposal(null);
                }}
              />
            )}
          </div>
        )}

        {/* Tab 2: Instructions Guide */}
        {activeTab === "guide" && <SetupGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 font-medium">
            {language === "ar" ? "وكيل فيديو • إخراج ومونتاج سينمائي ذكي" : "Video Agent • Autonomous Cinematic Production"}
          </p>
          <div>
            <a
              href="https://www.adixmedia.website/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-slate-200 transition-colors text-xs font-normal"
            >
              {language === "ar" ? "تصميم ADIX MEDIA" : "Designed by ADIX MEDIA"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
