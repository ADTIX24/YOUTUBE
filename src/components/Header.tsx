import { KeyRound, Sparkles, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeTab: "agent" | "guide";
  setActiveTab: (tab: "agent" | "guide") => void;
  onOpenKeysModal: () => void;
  isGeminiConfigured: boolean;
  isTgConfigured: boolean;
  serverConnected: boolean;
  hasServerKey: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenKeysModal,
  isGeminiConfigured,
  isTgConfigured,
  serverConnected,
  hasServerKey,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/90 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 text-right w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0 font-black text-lg">
                🎬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-100">
                    صانع سيناريوهات وقصص كابوس
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    جاهز للعمل
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  سحب قصص kabbos.com وتجريد الملكية الفكرية وصياغة سيناريوهات يوتيوب
                </p>
              </div>
            </div>

            {/* Mobile quick status */}
            <button
              onClick={onOpenKeysModal}
              className="sm:hidden px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>المفاتيح</span>
            </button>
          </div>

          {/* Controls: Navigation & Dedicated API Keys Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/90 shadow-inner">
              <button
                onClick={() => setActiveTab("agent")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "agent"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                لوحة التحكم
              </button>

              <button
                onClick={() => setActiveTab("guide")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "guide"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                دليل الاستخدام
              </button>
            </div>

            {/* Dedicated API Keys Button replacing Vercel Files Button */}
            <button
              onClick={onOpenKeysModal}
              id="header-api-keys-btn"
              className="relative px-3.5 py-1.5 bg-gradient-to-r from-amber-500/15 via-amber-600/20 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
            >
              <KeyRound className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>مفاتيح الربط</span>
              
              {/* Active Indicator Dots */}
              <span className="flex items-center gap-1 mr-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isGeminiConfigured ? "bg-emerald-400" : "bg-red-400 animate-ping"
                  }`}
                  title={isGeminiConfigured ? "Gemini متصل" : "Gemini مطلوب"}
                />
                {isTgConfigured && (
                  <span
                    className="w-2 h-2 rounded-full bg-sky-400"
                    title="Telegram متصل"
                  />
                )}
              </span>
            </button>

            {/* Server Status pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
              <span>{serverConnected ? "متصل" : "جاري الاتصال..."}</span>
              {hasServerKey && (
                <span className="text-slate-500 border-r border-slate-800 pr-1.5 mr-1.5 flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Gemini
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
