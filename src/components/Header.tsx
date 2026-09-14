import { useState, useRef, useEffect } from "react";
import { KeyRound, Sliders, Cpu, Settings, Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface HeaderProps {
  activeTab: "agent" | "guide";
  setActiveTab: (tab: "agent" | "guide") => void;
  onOpenKeysModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenMcpModal: () => void;
  isGeminiConfigured: boolean;
  isTgConfigured: boolean;
  mcpConnectedCount: number;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenKeysModal,
  onOpenSettingsModal,
  onOpenMcpModal,
  isGeminiConfigured,
  mcpConnectedCount,
}: HeaderProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="border-b border-slate-800/90 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand: Clean & Uncluttered "وكيل فيديو" */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0 font-black text-sm">
              🎬
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                {t("siteTitle")}
              </h1>
            </div>
          </div>

          {/* Right Controls: Minimal & Organized (Language + Single Settings Button + View Tabs) */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "ar" ? "English" : "العربية"}</span>
            </button>

            {/* Consolidate All 3 Configs into ONE Clean "Settings" Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="header-settings-btn"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isSettingsOpen
                    ? "bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
                title={t("settings")}
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("settings")}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isGeminiConfigured ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                  }`}
                  title={isGeminiConfigured ? t("geminiConnected") : t("geminiNotConnected")}
                />
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isSettingsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Containing Exactly the 3 Desired Items */}
              {isSettingsOpen && (
                <div className="absolute left-0 sm:left-auto right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>{t("settings")}</span>
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      {isGeminiConfigured ? "● " + t("geminiConnected") : "○ " + t("geminiNotConnected")}
                    </span>
                  </div>

                  {/* 1. مفاتيح Gemini */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenKeysModal();
                    }}
                    className="w-full text-start p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500/25 transition-colors">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                          {t("geminiKeys")}
                        </span>
                        {isGeminiConfigured && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {t("geminiKeysDesc")}
                      </p>
                    </div>
                  </button>

                  {/* 2. إعدادات الفيديو */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full text-start p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500/25 transition-colors">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white block">
                        {t("videoSettings")}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {t("videoSettingsDesc")}
                      </p>
                    </div>
                  </button>

                  {/* 3. إعدادات MCP */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenMcpModal();
                    }}
                    className="w-full text-start p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500/25 transition-colors">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                          {t("mcpSettings")}
                        </span>
                        {mcpConnectedCount > 0 && (
                          <span className="text-[9px] bg-purple-500/25 text-purple-300 px-1.5 py-0.2 rounded-full font-mono border border-purple-500/30">
                            {mcpConnectedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {t("mcpSettingsDesc")}
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Studio / Guide Tabs */}
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("agent")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "agent"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t("tabStudio")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "guide"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t("tabGuide")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
