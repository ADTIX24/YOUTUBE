import { useState, Dispatch, SetStateAction } from "react";
import {
  Server,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  Radio,
  Plug,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { McpServerConfig } from "../types";

interface McpManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcpServers: McpServerConfig[];
  setMcpServers: Dispatch<SetStateAction<McpServerConfig[]>>;
}

export function McpManagerModal({
  isOpen,
  onClose,
  mcpServers,
  setMcpServers,
}: McpManagerModalProps) {
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");
  const [newServerToken, setNewServerToken] = useState("");
  const [newServerDesc, setNewServerDesc] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ id: string; success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAddServer = () => {
    if (!newServerName.trim() || !newServerUrl.trim()) {
      alert("يرجى إدخال اسم الموقع/الخادم ورابط MCP.");
      return;
    }

    const newServer: McpServerConfig = {
      id: `mcp_${Date.now()}`,
      name: newServerName.trim(),
      serverUrl: newServerUrl.trim(),
      authToken: newServerToken.trim(),
      description: newServerDesc.trim() || "خادم أدوات ومواقع خارجية (MCP Protocol)",
      status: "connected",
      toolsCount: 3,
    };

    setMcpServers((prev) => [...prev, newServer]);
    setNewServerName("");
    setNewServerUrl("");
    setNewServerToken("");
    setNewServerDesc("");
  };

  const handleDeleteServer = (id: string) => {
    setMcpServers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleTestConnection = async (server: McpServerConfig) => {
    setTestingId(server.id);
    setTestMsg(null);
    try {
      const res = await fetch("/api/test-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverUrl: server.serverUrl,
          authToken: server.authToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestMsg({
          id: server.id,
          success: true,
          text: `✅ ${data.message} (الأدوات المكتشفة: ${data.toolsCount})`,
        });
        setMcpServers((prev) =>
          prev.map((s) => (s.id === server.id ? { ...s, status: "connected", toolsCount: data.toolsCount } : s))
        );
      } else {
        setTestMsg({
          id: server.id,
          success: false,
          text: `⚠️ ${data.error}`,
        });
        setMcpServers((prev) =>
          prev.map((s) => (s.id === server.id ? { ...s, status: "disconnected" } : s))
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestMsg({ id: server.id, success: false, text: `خطأ اتصال: ${msg}` });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>بروتوكول سياق النماذج (MCP - Model Context Protocol)</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-mono font-semibold">
                  مواقع وأدوات ذكية
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ربط مواقع خارجية وخوادم MCP لجلب المصادر والأدوات تلقائياً للوكيل
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Info Banner */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed flex items-start gap-3">
            <Plug className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">ما هو نظام MCP؟</span>
              بروتوكول MCP يتيح لوكيل الذكاء الاصطناعي الارتباط بأي موقع، قاعدة بيانات، أو أداة خارجية بشكل مباشر وسحب البيانات منها أو تنفيذ الأوامر بها أثناء صناعة السيناريو.
            </div>
          </div>

          {/* Connected Servers List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>المواقع وخوادم MCP المربوطة ({mcpServers.length}):</span>
            </h3>

            {mcpServers.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                لا توجد خوادم MCP مضافة حالياً. أضف موقعك أو خادمك أدناه.
              </div>
            ) : (
              <div className="space-y-2.5">
                {mcpServers.map((server) => {
                  const isTesting = testingId === server.id;
                  const currentTest = testMsg?.id === server.id ? testMsg : null;
                  return (
                    <div
                      key={server.id}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400">
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{server.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                  server.status === "connected"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}
                              >
                                {server.status === "connected" ? "متصل" : "غير متصل"}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block" dir="ltr">
                              {server.serverUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTestConnection(server)}
                            disabled={isTesting}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            {isTesting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                            ) : (
                              <Radio className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span>فحص الاتصال</span>
                          </button>

                          <button
                            onClick={() => handleDeleteServer(server.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="حذف الخادم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {currentTest && (
                        <div
                          className={`text-xs p-2 rounded-lg border ${
                            currentTest.success
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                              : "bg-red-950/40 text-red-300 border-red-800"
                          }`}
                        >
                          {currentTest.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New MCP Server Form */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>إضافة موقع أو خادم MCP جديد:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  اسم الموقع أو الخادم:
                </label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="مثال: موقع مقالات كابوس أو خادم نصوص"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  رابط خادم MCP (Server URL):
                </label>
                <input
                  type="url"
                  value={newServerUrl}
                  onChange={(e) => setNewServerUrl(e.target.value)}
                  placeholder="https://mcp.mysite.com/sse أو ws://"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  مفتاح التوثيق (Auth Token) - اختياري:
                </label>
                <input
                  type="password"
                  value={newServerToken}
                  onChange={(e) => setNewServerToken(e.target.value)}
                  placeholder="Bearer token أو API Key..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  وصف مختصر للخادم:
                </label>
                <input
                  type="text"
                  value={newServerDesc}
                  onChange={(e) => setNewServerDesc(e.target.value)}
                  placeholder="مثال: جلب القصص وتحليل المحتوى"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddServer}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خادم الـ MCP إلى النظام</span>
            </button>
          </div>
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
