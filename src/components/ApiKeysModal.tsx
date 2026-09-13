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
} from "lucide-react";
import { YouTubeChannelConfig } from "../types";

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
  // Multi-channel YouTube configuration
  youtubeChannels: YouTubeChannelConfig[];
  setYoutubeChannels: Dispatch<SetStateAction<YouTubeChannelConfig[]>>;
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
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
}: ApiKeysModalProps) {
  const [activeTab, setActiveTab] = useState<"gemini" | "youtube" | "telegram">("gemini");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);

  // New channel form state
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelLang, setNewChannelLang] = useState<"ar" | "en">("ar");
  const [newChannelApiKey, setNewChannelApiKey] = useState("");
  const [newChannelClientId, setNewChannelClientId] = useState("");
  const [newChannelClientSecret, setNewChannelClientSecret] = useState("");
  const [showNewChannelSecret, setShowNewChannelSecret] = useState(false);

  if (!isOpen) return null;

  const isGeminiReady = Boolean(geminiKey.trim() || hasServerKey);
  const isTgConfigured = Boolean(telegramToken.trim() && telegramChatId.trim());
  const configuredChannelsCount = youtubeChannels.length;

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

    // Reset inputs
    setNewChannelName("");
    setNewChannelApiKey("");
    setNewChannelClientId("");
    setNewChannelClientSecret("");
  };

  const handleRemoveChannel = (id: string) => {
    if (youtubeChannels.length <= 1) {
      alert("يجب إبقاء قناة واحدة على الأقل في القائمة.");
      return;
    }
    const updated = youtubeChannels.filter((ch) => ch.id !== id);
    setYoutubeChannels(updated);
    if (selectedChannelId === id) {
      setSelectedChannelId(updated[0].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مركز مفاتيح الربط وقنوات اليوتيوب</h3>
              <p className="text-xs text-slate-400">
                إدارة مفاتيح Gemini، قنوات YouTube (عربي/إنجليزي)، وبوت التنبيهات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("gemini")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "gemini"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            مفتاح الذكاء الاصطناعي (Gemini)
            <span
              className={`w-2 h-2 rounded-full ${isGeminiReady ? "bg-emerald-400" : "bg-red-400"}`}
            />
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "youtube"
                ? "border-red-500 text-red-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            قنوات YouTube المتعددة ({configuredChannelsCount})
          </button>

          <button
            onClick={() => setActiveTab("telegram")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "telegram"
                ? "border-sky-500 text-sky-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            إشعارات تيليجرام
            {isTgConfigured && <span className="w-2 h-2 rounded-full bg-sky-400" />}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200 flex-1">
          {/* TAB 1: GEMINI API KEY */}
          {activeTab === "gemini" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-300">
                    محرك التجريد الفكري وصياغة سيناريو 10-30 دقيقة
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    يستخدم الوكيل نماذج Gemini لإعادة صياغة القصص بالكامل وتغيير الأسماء وحمايتها
                    من حقوق الطبع والنشر، وتقسيمها إلى عدد مشاهد كافٍ لتغطية الفيديو بالكامل باللغة
                    المطلوبة (عربي أو إنجليزي).
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    مفتاح Google Gemini API:
                    {!hasServerKey && <span className="text-red-400">*</span>}
                  </label>

                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
                  >
                    الحصول على مفتاح مجاني رسمي
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={
                      hasServerKey
                        ? "السيرفر مزود بمفتاح مسبقاً، يمكنك وضع مفتاحك لتجاوز القيود المؤقتة"
                        : "الصق مفتاح Gemini هنا (يبدأ بـ AIzaSy...)"
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isGeminiReady ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span className={isGeminiReady ? "text-emerald-400 font-medium" : "text-amber-400"}>
                    {geminiKey
                      ? "تم إدخال مفتاح مخصص"
                      : hasServerKey
                      ? "مفتاح الخادم التلقائي نشط وجاهز"
                      : "المفتاح مطلوب للبدء"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-CHANNEL YOUTUBE CONFIGURATION */}
          {activeTab === "youtube" && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2.5">
                <Youtube className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-red-300 mb-0.5">
                    الربط المتعدد لقنوات يوتيوب (العربية والإنجليزية):
                  </strong>
                  يمكنك تعريف أكثر من قناة في السيستم (مثلاً: قناة قصص رعب بالعربية، وقناة وثائقية
                  باللغة الإنجليزية). سيقوم الوكيل بصياغة السيناريو وتوليد الصوت وتوجيه الرفع
                  التلقائي حسب القناة المختارة لكل قصة!
                </div>
              </div>

              {/* Existing Channels List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  القنوات المربوطة حالياً في النظام:
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {youtubeChannels.map((channel) => {
                    const isSelected = selectedChannelId === channel.id;
                    return (
                      <div
                        key={channel.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? "bg-slate-950 border-red-500/80 shadow-sm"
                            : "bg-slate-950/60 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedChannelId(channel.id)}
                            className="flex items-center gap-2 text-right cursor-pointer"
                          >
                            <span
                              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-red-500 bg-red-500" : "border-slate-600"
                              }`}
                            />
                            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
                              <Youtube className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                <span>{channel.name}</span>
                                <span
                                  className={`px-2 py-0.2 text-[10px] rounded font-semibold ${
                                    channel.language === "ar"
                                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                  }`}
                                >
                                  {channel.language === "ar" ? "🇸🇦 عربي" : "🇺🇸 English"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                حالة النشر:{" "}
                                <span className="text-slate-300">{channel.privacyStatus}</span>
                                {channel.apiKey ? " • مفتاح API مفعّل" : " • محلي/محاكاة"}
                              </div>
                            </div>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isSelected && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">
                              القناة النشطة حالياً
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveChannel(channel.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="حذف القناة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Channel Section */}
              <div className="pt-3 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>إضافة قناة يوتيوب جديدة (عربي أو إنجليزي):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        اسم القناة:
                      </label>
                      <input
                        type="text"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        placeholder="مثلاً: Mysterious Chronicles English"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        لغة القناة والمحتوى المستهدف:
                      </label>
                      <select
                        value={newChannelLang}
                        onChange={(e) => setNewChannelLang(e.target.value as "ar" | "en")}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                      >
                        <option value="ar">العربية (Arabic) - تعليق وسيناريو عربي</option>
                        <option value="en">الإنجليزية (English) - Voiceover & English Script</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Google / YouTube API Key (أو Client ID):
                      </label>
                      <input
                        type="text"
                        value={newChannelApiKey}
                        onChange={(e) => setNewChannelApiKey(e.target.value)}
                        placeholder="YouTube Data API v3 Key (اختياري للرفع السحابي)"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Client Secret (OAuth2):
                      </label>
                      <div className="relative">
                        <input
                          type={showNewChannelSecret ? "text" : "password"}
                          value={newChannelClientSecret}
                          onChange={(e) => setNewChannelClientSecret(e.target.value)}
                          placeholder="Client Secret للتصريح برفع الفيديو"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewChannelSecret(!showNewChannelSecret)}
                          className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-200"
                        >
                          {showNewChannelSecret ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddChannel}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة القناة إلى القائمة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TELEGRAM BOT */}
          {activeTab === "telegram" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200 flex items-start gap-2.5">
                <SendHorizontal className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-sky-300 mb-0.5">إشعار فوري على هاتفك:</strong>
                  بمجرد اكتمال تجهيز القصة أو مونتاج الفيديو، يرسل لك البوت تقريراً كاملاً برابط
                  الفيديو، العنوان والوصف والهاشتاجات، وأوامر الصور مباشرة.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    توكن البوت (Bot Token):
                  </label>
                  <div className="relative">
                    <input
                      type={showTgToken ? "text" : "password"}
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="123456789:ABC..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTgToken(!showTgToken)}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showTgToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    معرف المحادثة (Chat ID):
                  </label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="@channel أو 12345678"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Test button */}
              {telegramToken.trim() && telegramChatId.trim() && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onTestTelegram}
                    disabled={testingTg}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {testingTg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <SendHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    إرسال رسالة تجريبية لاختبار الاتصال
                  </button>
                </div>
              )}

              {/* Test feedback */}
              {tgTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    tgTestResult.success
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                      : "bg-red-950/40 text-red-300 border-red-800"
                  }`}
                >
                  {tgTestResult.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        تم الاتصال بنجاح! تم إرسال رسالة تجريبية للبوت (@
                        {tgTestResult.botUsername}).
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>فشل الاتصال بتيليجرام: {tgTestResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>الأمان والخصوصية:</strong> يتم حفظ جميع المفاتيح والقنوات محلياً في متصفحك
              بشكل آمن، ويتم إرسالها فقط لتنفيذ المهام المطلوبة عبر السيرفر.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isGeminiReady ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                النظام مهيأ وجاهز للتشغيل
              </span>
            ) : (
              <span className="text-amber-400 font-medium">يرجى توفير مفتاح Gemini</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
