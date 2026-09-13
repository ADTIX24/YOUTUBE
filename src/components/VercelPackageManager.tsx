import { useState } from "react";
import JSZip from "jszip";
import { VERCEL_PROJECT_FILES } from "../data/vercelFiles";
import { VercelFile } from "../types";
import {
  FolderArchive,
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
  ExternalLink,
  Info,
  CheckCircle2,
} from "lucide-react";

export function VercelPackageManager() {
  const [selectedFile, setSelectedFile] = useState<VercelFile>(VERCEL_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();
      const folder = zip.folder("my-video-agent");

      if (folder) {
        folder.file("index.html", VERCEL_PROJECT_FILES.find((f) => f.name === "index.html")!.content);
        folder.file("vercel.json", VERCEL_PROJECT_FILES.find((f) => f.name === "vercel.json")!.content);
        folder.file("requirements.txt", VERCEL_PROJECT_FILES.find((f) => f.name === "requirements.txt")!.content);
        folder.file("README.md", VERCEL_PROJECT_FILES.find((f) => f.name === "README.md")!.content);

        const apiFolder = folder.folder("api");
        if (apiFolder) {
          apiFolder.file("run.py", VERCEL_PROJECT_FILES.find((f) => f.name === "api/run.py")!.content);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-video-agent.zip";
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("ZIP Generation error:", err);
      alert("حدث خطأ أثناء إنشاء ملف ZIP.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadSingleFile = (file: VercelFile) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.split("/").pop() || file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <FolderArchive className="w-3.5 h-3.5" />
              جاهز 100% للرفع دون كتابة كود
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              حزمة مشروع Vercel السحابية (my-video-agent)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              تحتوي هذه الحزمة على كافة الملفات الأربعة المطلوبة لاستضافة لوحة تحكم الوكيل مجاناً على
              Vercel. يمكنك تنزيل المجلد بالكامل بضغطة زر كملف ZIP أو معاينة ونسخ أي ملف منه.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  تم تنزيل my-video-agent.zip!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  تحميل الحزمة كاملة (ZIP)
                </>
              )}
            </button>

            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              فتح منصة Vercel
            </a>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Files Tree Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
              <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
              هيكل مجلد my-video-agent:
            </h3>

            <div className="space-y-1">
              {VERCEL_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-right p-3 rounded-xl text-xs font-mono transition-all flex items-start gap-2.5 border ${
                      isSelected
                        ? "bg-blue-600/10 text-blue-300 border-blue-500/30 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 border-transparent hover:text-white"
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 uppercase">
                          {file.lang}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-1">
                        {file.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Info className="w-4 h-4 text-blue-400" />
              كيف تعمل الحزمة على Vercel؟
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              - يكتشف Vercel ملف <code className="text-emerald-400 font-mono">requirements.txt</code> تلقائياً ويثبت المكتبات في بيئة السيرفر السحابية.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              - ملف <code className="text-emerald-400 font-mono">vercel.json</code> يوجه المتصفح عند الضغط على زر "ابدأ" إلى سكربت البايثون <code className="text-emerald-400 font-mono">api/run.py</code>.
            </p>
          </div>
        </div>

        {/* File Content Viewer */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header of Viewer */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold font-mono text-slate-200">
                  {selectedFile.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                  title="تنزيل هذا الملف منفرداً"
                >
                  <Download className="w-3.5 h-3.5" />
                  تنزيل
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ الكود
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description bar */}
            <div className="bg-slate-950/40 border-b border-slate-800/60 px-4 py-2 text-xs text-slate-400">
              {selectedFile.description}
            </div>

            {/* Code Body */}
            <div className="p-4 flex-1 bg-slate-950 font-mono text-xs text-slate-200 overflow-auto leading-relaxed select-text" dir="ltr">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
