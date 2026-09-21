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
import {
  buildClientSideProposal,
  fetchStoryClientFallback,
  runClientGeminiScriptGeneration,
  buildClientSideScreenplayResult,
} from "./lib/clientFallback";

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

  // Keys state (persisted to localStorage)
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("gemini_api_key") || "";
    } catch {
      return "";
    }
  });
  const [telegramToken, setTelegramToken] = useState<string>(() => {
    try {
      return localStorage.getItem("telegram_token") || "";
    } catch {
      return "";
    }
  });
  const [telegramChatId, setTelegramChatId] = useState<string>(() => {
    try {
      return localStorage.getItem("telegram_chat_id") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      if (geminiKey) localStorage.setItem("gemini_api_key", geminiKey);
      else localStorage.removeItem("gemini_api_key");
    } catch {}
  }, [geminiKey]);

  useEffect(() => {
    try {
      if (telegramToken) localStorage.setItem("telegram_token", telegramToken);
      else localStorage.removeItem("telegram_token");
    } catch {}
  }, [telegramToken]);

  useEffect(() => {
    try {
      if (telegramChatId) localStorage.setItem("telegram_chat_id", telegramChatId);
      else localStorage.removeItem("telegram_chat_id");
    } catch {}
  }, [telegramChatId]);

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
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<string>("سينمائي واقعي خارق 8K");
  const [selectedNarrationStyle, setSelectedNarrationStyle] = useState<string>("غموض سينمائي وتشويق حابس للأنفاس");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [selectedCameraMotion, setSelectedCameraMotion] = useState<string>("Slow cinematic push-in");
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

  const handleAnalyzeStory = async (input: {
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
  }) => {
    setIsAnalyzing(true);
    setError(null);
    setProposal(null);
    setPendingInput({
      storyUrl: input.storyUrl,
      rawText: input.rawText,
    });

    if (input.visualStyle) setSelectedVisualStyle(input.visualStyle);
    if (input.narrationStyle) setSelectedNarrationStyle(input.narrationStyle);
    if (input.aspectRatio) setSelectedAspectRatio(input.aspectRatio);
    if (input.cameraMotion) setSelectedCameraMotion(input.cameraMotion);
    if (input.targetDurationMinutes) setTargetDurationMinutes(input.targetDurationMinutes);
    if (input.targetScenes) setTargetScenes(input.targetScenes);
    if (input.videoRatioPercent !== undefined) setVideoRatioPercent(input.videoRatioPercent);

    const runAnalysisRequest = async (isRetry = false): Promise<any> => {
      const response = await fetch("/api/analyze-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey,
          storyUrl: input.storyUrl,
          rawText: input.rawText,
          targetDurationMinutes: input.targetDurationMinutes || targetDurationMinutes,
          storyLanguage,
          style: input.narrationStyle || selectedStyle,
          visualStyle: input.visualStyle || selectedVisualStyle,
          narrationStyle: input.narrationStyle || selectedNarrationStyle,
          aspectRatio: input.aspectRatio || selectedAspectRatio,
          cameraMotion: input.cameraMotion || selectedCameraMotion,
          storyTitle: input.storyTitle,
          targetScenes: input.targetScenes || targetScenes,
          videoRatioPercent: input.videoRatioPercent !== undefined ? input.videoRatioPercent : videoRatioPercent,
        }),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        // If transient 500 or cold start occurred and we haven't retried yet, retry after 1.2s
        if (!isRetry && (response.status >= 500 || responseText.includes("A server error has occurred"))) {
          await new Promise((r) => setTimeout(r, 1200));
          return runAnalysisRequest(true);
        }

        if (response.status === 504 || responseText.includes("timed out") || responseText.includes("504")) {
          throw new Error("انتهت مهلة استجابة الخادم أثناء محاولة فتح الرابط. يُفضل نسخ نص القصة ولصقه مباشرة في خانة (لصق نص القصة).");
        }
        if (responseText.includes("A server error has occurred") || response.status >= 500) {
          throw new Error("تعذر على الخادم معالجة الرابط حالياً. يُرجى التأكد من الرابط أو التبديل إلى تبويب (لصق نص القصة) ولصق النص مباشرة.");
        }
        throw new Error(`استجاب الخادم ببيانات غير متوقعة (HTTP ${response.status}): ${responseText.slice(0, 120)}`);
      }
      return data;
    };

    try {
      const data = await runAnalysisRequest();
      if (data && data.success && data.proposal) {
        if (input.visualStyle) data.proposal.visualStyle = input.visualStyle;
        if (input.narrationStyle) data.proposal.narrationStyle = input.narrationStyle;
        if (input.aspectRatio) data.proposal.aspectRatio = input.aspectRatio;
        if (input.cameraMotion) data.proposal.cameraMotion = input.cameraMotion;

        setProposal(data.proposal);
        if (data.proposal.extractedText) {
          setPendingInput({
            storyUrl: input.storyUrl,
            rawText: data.proposal.extractedText,
          });
        }
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
        return;
      } else {
        throw new Error(data?.error || "Server could not generate proposal");
      }
    } catch (err: unknown) {
      console.warn("Server analysis encountered issue, activating client-side proposal engine:", err);

      // 1. If user provided raw text, generate proposal directly
      if (input.rawText && input.rawText.trim().length > 20) {
        const clientProposal = buildClientSideProposal(
          input.rawText.trim(),
          "",
          targetDurationMinutes,
          input.narrationStyle || selectedStyle,
          storyLanguage
        );
        clientProposal.visualStyle = input.visualStyle || selectedVisualStyle;
        clientProposal.narrationStyle = input.narrationStyle || selectedNarrationStyle;
        clientProposal.aspectRatio = input.aspectRatio || selectedAspectRatio;
        clientProposal.cameraMotion = input.cameraMotion || selectedCameraMotion;
        if (input.storyTitle) clientProposal.storyTitle = input.storyTitle;

        setProposal(clientProposal as any);
        if (clientProposal.recommendedMinutes) setTargetDurationMinutes(clientProposal.recommendedMinutes);
        if (clientProposal.recommendedScenesCount) setTargetScenes(clientProposal.recommendedScenesCount);
        if (clientProposal.recommendedVideoScenesCount && clientProposal.recommendedScenesCount) {
          setVideoRatioPercent(
            Math.round((clientProposal.recommendedVideoScenesCount / clientProposal.recommendedScenesCount) * 100)
          );
        }
        return;
      }

      // 2. If user provided URL, attempt client-side fallback retrieval
      if (input.storyUrl && input.storyUrl.trim()) {
        try {
          const fallbackStory = await fetchStoryClientFallback(input.storyUrl.trim());
          if (fallbackStory && fallbackStory.text) {
            setPendingInput({
              storyUrl: input.storyUrl,
              rawText: fallbackStory.text,
            });
            const clientProposal = buildClientSideProposal(
              fallbackStory.text,
              input.storyUrl,
              targetDurationMinutes,
              selectedStyle,
              storyLanguage
            );
            if (fallbackStory.title) clientProposal.storyTitle = fallbackStory.title;
            setProposal(clientProposal as any);
            if (clientProposal.recommendedMinutes) setTargetDurationMinutes(clientProposal.recommendedMinutes);
            if (clientProposal.recommendedScenesCount) setTargetScenes(clientProposal.recommendedScenesCount);
            if (clientProposal.recommendedVideoScenesCount && clientProposal.recommendedScenesCount) {
              setVideoRatioPercent(
                Math.round((clientProposal.recommendedVideoScenesCount / clientProposal.recommendedScenesCount) * 100)
              );
            }
            return;
          }
        } catch {
          // ignore
        }
      }

      // 3. Fail-safe guaranteed proposal generation (never leave the user blocked on 429/500)
      const fallbackText = input.rawText || (input.storyTitle ? `قصة مشوقة بعنوان: ${input.storyTitle}` : "قصة وثائقية درامية غامضة تكشف أسراراً وتفاصيل سينمائية غير مسبوقة.");
      const guaranteedProposal = buildClientSideProposal(
        fallbackText,
        input.storyUrl || "",
        targetDurationMinutes,
        input.narrationStyle || selectedStyle,
        storyLanguage
      );
      if (input.storyTitle) guaranteedProposal.storyTitle = input.storyTitle;
      guaranteedProposal.visualStyle = input.visualStyle || selectedVisualStyle;
      guaranteedProposal.narrationStyle = input.narrationStyle || selectedNarrationStyle;
      guaranteedProposal.aspectRatio = input.aspectRatio || selectedAspectRatio;
      guaranteedProposal.cameraMotion = input.cameraMotion || selectedCameraMotion;
      setProposal(guaranteedProposal as any);
      return;
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

    const resolvedRawText =
      proposal?.extractedText ||
      pendingInput?.rawText ||
      proposal?.extractedTextPreview ||
      proposal?.storySummary ||
      "";

    handleStartAgent({
      geminiKey,
      storyUrl: pendingInput?.storyUrl || "",
      rawText: resolvedRawText,
      storyTitle: proposal?.storyTitle || "",
      telegramToken,
      telegramChatId,
      style: proposal?.narrationStyle || selectedNarrationStyle || selectedStyle,
      targetScenes: customized.totalScenes,
      storyLanguage,
      targetDurationMinutes: customized.durationMinutes,
      selectedChannelId,
      videoRatioPercent: customized.videoRatioPercent,
      autoGenerateImages: customized.autoGenerateImages,
      visualStyle: proposal?.visualStyle || selectedVisualStyle,
      narrationStyle: proposal?.narrationStyle || selectedNarrationStyle,
      aspectRatio: proposal?.aspectRatio || selectedAspectRatio,
      cameraMotion: proposal?.cameraMotion || selectedCameraMotion,
      lockedCharacters: proposal?.lockedCharacters,
    });
  };

  const triggerProgressiveMediaGeneration = async (resObj: StoryResult, apiKey: string) => {
    const targetAspect = resObj.aspectRatio || selectedAspectRatio || "16:9";

    // 1. Generate thumbnail in background if prompt exists and not generated yet
    const thumbPrompt = resObj.thumbnail_prompt || resObj.thumbnailPrompt;
    if (thumbPrompt && !resObj.generatedThumbnailUrl) {
      try {
        const thumbRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: thumbPrompt, geminiKey: apiKey, aspectRatio: targetAspect }),
        });
        const thumbData = await thumbRes.json();
        if (thumbData.success && thumbData.imageUrl) {
          setResult((prev) => (prev ? { ...prev, generatedThumbnailUrl: thumbData.imageUrl } : prev));
        }
      } catch (e) {
        console.warn("Background thumbnail generation error:", e);
      }
    }

    // 2. Generate preview images for the first 2 scenes progressively
    const scenesToGen = (resObj.scenes || []).slice(0, 2);
    for (let i = 0; i < scenesToGen.length; i++) {
      const sc = scenesToGen[i];
      if (sc.image_prompt && !sc.generatedImageUrl) {
        try {
          const scRes = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: sc.image_prompt, geminiKey: apiKey, aspectRatio: targetAspect }),
          });
          const scData = await scRes.json();
          if (scData.success && scData.imageUrl) {
            setResult((prev) => {
              if (!prev || !prev.scenes) return prev;
              const newScenes = prev.scenes.map((item, idx) =>
                idx === i ? { ...item, generatedImageUrl: scData.imageUrl } : item
              );
              return { ...prev, scenes: newScenes };
            });
          }
        } catch (e) {
          console.warn(`Background scene image ${i + 1} error:`, e);
        }
      }
    }
  };

  const handleStartAgent = async (params: {
    geminiKey: string;
    storyUrl: string;
    rawText: string;
    storyTitle?: string;
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
    lockedCharacters?: any[];
  }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTelegramStatus(null);
    setLoadingStep(1);

    setLoadingText(
      `⏳ الخطوة 1/4: جلب القصة وتجهيز تسلسل المشاهد والتطابق السمعي-البصري...`
    );

    const stepTimer1 = setTimeout(() => {
      setLoadingStep(2);
      setLoadingText(
        `🧠 الخطوة 2/4: المخرج الوثائقي ينظم التسلسل الزمني وتثبيت هوية الشخصيات...`
      );
    }, 2000);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(3);
      setLoadingText(
        `🎬 الخطوة 3/4: تفصيل ${params.targetScenes} مشهداً، وتوزيع لقطات الفيديو Veo والصور 4K...`
      );
    }, 4500);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep(4);
      setLoadingText(`🚀 الخطوة 4/4: تجهيز الغلاف وضبط أوامر التوليد السينمائية...`);
    }, 7000);

    const abortCtrl = new AbortController();
    const fetchTimer = setTimeout(() => {
      abortCtrl.abort();
    }, 20000);

    const storyTextCandidate =
      params.rawText ||
      proposal?.extractedText ||
      pendingInput?.rawText ||
      proposal?.extractedTextPreview ||
      proposal?.storySummary ||
      "";

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, rawText: storyTextCandidate }),
        signal: abortCtrl.signal,
      });

      clearTimeout(fetchTimer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      let data: any = null;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch {
        console.warn("Server response was not JSON, engaging instant fail-safe script generator...");
      }

      if (data && data.success && data.result) {
        setResult(data.result);
        if (data.telegramStatus) {
          setTelegramStatus(data.telegramStatus);
        }

        if (params.autoGenerateImages) {
          triggerProgressiveMediaGeneration(data.result, params.geminiKey || geminiKey);
        }
        return;
      }

      // If server returned error or non-success, immediately run client-side generator
      console.warn("Server generation unfulfilled, engaging client-side generator engine...");
      const instantResult = buildClientSideScreenplayResult({
        storyTitle: params.storyTitle || proposal?.storyTitle || "قصة وثائقية سينمائية",
        storyText: storyTextCandidate,
        targetScenes: params.targetScenes,
        targetDurationMinutes: params.targetDurationMinutes,
        videoRatioPercent: params.videoRatioPercent,
        storyLanguage: params.storyLanguage,
        style: params.style,
        visualStyle: params.visualStyle || proposal?.visualStyle,
        narrationStyle: params.narrationStyle || proposal?.narrationStyle,
        aspectRatio: params.aspectRatio || proposal?.aspectRatio,
        cameraMotion: params.cameraMotion || proposal?.cameraMotion,
        lockedCharacters: params.lockedCharacters || proposal?.lockedCharacters,
        cadenceMap: proposal?.cadenceMap,
      });

      setResult(instantResult);
      if (params.autoGenerateImages) {
        triggerProgressiveMediaGeneration(instantResult, params.geminiKey || geminiKey);
      }
      return;
    } catch (err: unknown) {
      clearTimeout(fetchTimer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      console.warn("Server generation delayed/timed out. Activating instant client-side fail-safe...", err);

      try {
        const fallbackResult = buildClientSideScreenplayResult({
          storyTitle: params.storyTitle || proposal?.storyTitle || "قصة وثائقية سينمائية",
          storyText: storyTextCandidate,
          targetScenes: params.targetScenes,
          targetDurationMinutes: params.targetDurationMinutes,
          videoRatioPercent: params.videoRatioPercent,
          storyLanguage: params.storyLanguage,
          style: params.style,
          visualStyle: params.visualStyle || proposal?.visualStyle,
          narrationStyle: params.narrationStyle || proposal?.narrationStyle,
          aspectRatio: params.aspectRatio || proposal?.aspectRatio,
          cameraMotion: params.cameraMotion || proposal?.cameraMotion,
          lockedCharacters: params.lockedCharacters || proposal?.lockedCharacters,
          cadenceMap: proposal?.cadenceMap,
        });

        setResult(fallbackResult);
        if (params.autoGenerateImages) {
          triggerProgressiveMediaGeneration(fallbackResult, params.geminiKey || geminiKey);
        }
        return;
      } catch (localErr) {
        console.error("Local generator unexpected error:", localErr);
        setError("تعذر توليد السيناريو. يرجى المحاولة مرة أخرى.");
      }
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
