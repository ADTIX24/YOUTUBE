import { useState, Dispatch, SetStateAction } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  SendHorizontal,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Youtube,
  Plus,
  Trash2,
  Globe2,
  Tv,
  Share2,
} from "lucide-react";
import { YouTubeChannelConfig, FacebookConfig, InstagramConfig } from "../types";

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (val: string) => void;
  telegramToken: string;
  setTelegramToken: (val: string) => void;
  telegramChatId: string;
  setTelegramChatId: (val: string) => void;
  hasServerKey: boolean;
  testingTg: boolean;
  tgTestResult: { success: boolean; botUsername?: string; error?: string } | null;
  onTestTelegram: () => void;
  // YouTube Channels
  youtubeChannels: YouTubeChannelConfig[];
  setYoutubeChannels: Dispatch<SetStateAction<YouTubeChannelConfig[]>>;
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
  // Facebook
  facebookConfig: FacebookConfig;
  setFacebookConfig: Dispatch<SetStateAction<FacebookConfig>>;
  // Instagram
  instagramConfig: InstagramConfig;
  setInstagramConfig: Dispatch<SetStateAction<InstagramConfig>>;
}

export function ApiKeysModal({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  telegramToken,
  setTelegramToken,
  telegramChatId,
  setTelegramChatId,
  hasServerKey,
  testingTg,
  tgTestResult,
  onTestTelegram,
  youtubeChannels,
  setYoutubeChannels,
  selectedChannelId,
  setSelectedChannelId,
  facebookConfig,
  setFacebookConfig,
  instagramConfig,
  setInstagramConfig,
}: ApiKeysModalProps) {
  const [activeTab, setActiveTab] = useState<"gemini" | "youtube" | "social" | "telegram">("gemini");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [showFbToken, setShowFbToken] = useState(false);
  const [showIgToken, setShowIgToken] = useState(false);

  // New YouTube channel form
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelLang, setNewChannelLang] = useState<"ar" | "en">("ar");
  const [newChannelApiKey, setNewChannelApiKey] = useState("");
  const [newChannelClientId, setNewChannelClientId] = useState("");
  const [newChannelClientSecret, setNewChannelClientSecret] = useState("");

  if (!isOpen) return null;

  const isGeminiReady = Boolean(geminiKey.trim() || hasServerKey);
  const isTgConfigured = Boolean(telegramToken.trim() && telegramChatId.trim());

  const handleAddChannel = () => {
    if (!newChannelName.trim()) {
      alert("يرجى إدخال اسم القناة.");
      return;
    }

    const newChannel: YouTubeChannelConfig = {
      id: `ch_${Date.now()}`,
      name: newChannelName.trim(),
      language: newChannelLang,
      apiKey: newChannelApiKey.trim(),
      clientId: newChannelClientId.trim(),
      clientSecret: newChannelClientSecret.trim(),
      autoUpload: true,
      privacyStatus: "unlisted",
    };

    setYoutubeChannels((prev) => [...prev, newChannel]);
    setSelectedChannelId(newChannel.id);
    setNewChannelName("");
    setNewChannelApiKey("");
    setNewChannelClientId("");
    setNewChannelClientSecret("");
  };

  const handleDeleteChannel = (id: string) => {
    if (youtubeChannels.length <= 1) {
      alert("يجب أن تبقى قناة واحدة على الأقل في القائمة.");
      return;
    }
    const updated = youtubeChannels.filter((ch) => ch.id !== id);
    setYoutubeChannels(updated);
    if (selectedChannelId === id) {
      setSelectedChannelId(updated[0].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>إعدادات مفاتيح الربط والحسابات</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                  Gemini • YouTube • Facebook • Instagram • Telegram
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تكوين مفاتيح الذكاء الاصطناعي، القنوات، ومنصات التواصل الاجتماعي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("gemini")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "gemini"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI (Pro / Veo)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isGeminiReady ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("youtube")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "youtube"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>قنوات YouTube</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
              {youtubeChannels.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("social")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "social"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Facebook & Instagram</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("telegram")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "telegram"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Telegram Bot</span>
            {isTgConfigured && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GEMINI */}
          {activeTab === "gemini" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                <span className="font-bold block mb-1">🔑 دعم اشتراك Google AI Studio Pro و Veo:</span>
                مفتاح Gemini يتيح توليد السيناريو السينمائي، الصور بجودة 4K فائقة الدقة عبر Imagen، ومقاطع الفيديو الحركية (Veo Video)، والصوت الإذاعي.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>مفتاح Google Gemini API Key:</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>الحصول على مفتاح من Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>

                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={
                      hasServerKey
                        ? "المفتاح مضاف مسبقاً في بيئة العمل (جاهز)"
                        : "AIzaSy..."
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">حالة الربط والجاهزية:</span>
                </div>
                {isGeminiReady ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> جاهز للعمل وتوليد الصور والفيديوهات
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> يرجى إدخال المفتاح
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: YOUTUBE CHANNELS */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-200">
                إدارة قنوات يوتيوب المتعددة (عربي / إنجليزي) لرفع السيناريوهات والفيديوهات تلقائياً.
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">القنوات المربوطة حالياً:</label>
                {youtubeChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      selectedChannelId === ch.id
                        ? "bg-red-500/10 border-red-500/40 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedChannelId === ch.id}
                        onChange={() => setSelectedChannelId(ch.id)}
                        className="text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{ch.name}</span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            {ch.language === "ar" ? "🇸🇦 عربي" : "🇺🇸 English"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteChannel(ch.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Channel */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">إضافة قناة يوتيوب جديدة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="اسم القناة..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                  <select
                    value={newChannelLang}
                    onChange={(e) => setNewChannelLang(e.target.value as "ar" | "en")}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="ar">🇸🇦 لغة المحتوى: عربي</option>
                    <option value="en">🇺🇸 لغة المحتوى: English</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  إضافة القناة
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL MEDIA (FACEBOOK & INSTAGRAM) */}
          {activeTab === "social" && (
            <div className="space-y-5">
              {/* Facebook Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-600/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-black">f</span>
                    <span>ربط صفحة فيسبوك (Facebook Page)</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={facebookConfig.autoPostVideo}
                      onChange={(e) =>
                        setFacebookConfig((prev) => ({ ...prev, autoPostVideo: e.target.checked }))
                      }
                      className="rounded bg-slate-800 text-blue-600"
                    />
                    <span>نشر الفيديو تلقائياً</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      معرف صفحة فيسبوك (Page ID):
                    </label>
                    <input
                      type="text"
                      value={facebookConfig.pageId}
                      onChange={(e) =>
                        setFacebookConfig((prev) => ({ ...prev, pageId: e.target.value }))
                      }
                      placeholder="1009283746..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      رمز الوصول (Page Access Token):
                    </label>
                    <div className="relative">
                      <input
                        type={showFbToken ? "text" : "password"}
                        value={facebookConfig.accessToken}
                        onChange={(e) =>
                          setFacebookConfig((prev) => ({ ...prev, accessToken: e.target.value }))
                        }
                        placeholder="EAA..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFbToken(!showFbToken)}
                        className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400"
                      >
                        {showFbToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-pink-600/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-xs font-black">📷</span>
                    <span>ربط حساب إنستغرام للأعمال (Instagram Reels / Business)</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instagramConfig.autoPostReel}
                      onChange={(e) =>
                        setInstagramConfig((prev) => ({ ...prev, autoPostReel: e.target.checked }))
                      }
                      className="rounded bg-slate-800 text-pink-600"
                    />
                    <span>نشر الريلز تلقائياً</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      معرف الحساب (Instagram Account ID):
                    </label>
                    <input
                      type="text"
                      value={instagramConfig.instagramAccountId}
                      onChange={(e) =>
                        setInstagramConfig((prev) => ({ ...prev, instagramAccountId: e.target.value }))
                      }
                      placeholder="1784140..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      رمز الوصول (User Access Token):
                    </label>
                    <div className="relative">
                      <input
                        type={showIgToken ? "text" : "password"}
                        value={instagramConfig.accessToken}
                        onChange={(e) =>
                          setInstagramConfig((prev) => ({ ...prev, accessToken: e.target.value }))
                        }
                        placeholder="IGQVJ..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowIgToken(!showIgToken)}
                        className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400"
                      >
                        {showIgToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEGRAM */}
          {activeTab === "telegram" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200">
                إرسال السيناريوهات والصور مباشرة إلى محادثتك أو قناتك على Telegram.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  توكن بوت تيليجرام (Telegram Bot Token):
                </label>
                <div className="relative">
                  <input
                    type={showTgToken ? "text" : "password"}
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTgToken(!showTgToken)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"
                  >
                    {showTgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  معرف المحادثة (Telegram Chat ID):
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="مثال: 12345678 أو @mychannel"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onTestTelegram}
                  disabled={testingTg || !telegramToken || !telegramChatId}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testingTg ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="w-4 h-4" />
                  )}
                  <span>إرسال رسالة تجريبية إلى Telegram</span>
                </button>
              </div>

              {tgTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    tgTestResult.success
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                      : "bg-red-950/40 text-red-300 border-red-800"
                  }`}
                >
                  {tgTestResult.success
                    ? `✅ نجح الاتصال بالبوت @${tgTestResult.botUsername}`
                    : `❌ خطأ: ${tgTestResult.error}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
