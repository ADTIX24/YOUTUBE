import {
  Sparkles,
  Key,
  Send,
  Video,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Youtube,
  Cpu,
  Share2,
} from "lucide-react";

export function SetupGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
            🎬
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              دليل عمل وكيل صناعة سيناريوهات يوتيوب المستقل
            </h3>
            <p className="text-xs text-slate-400">
              مخرج وثائقي ومسؤول مونتاج أول (Lead Documentary Editor) مع توليد فيديو وصور بدون حقوق ملكية
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-300 leading-relaxed space-y-3 border-t border-slate-800 pt-4">
          <p>
            هذا النظام مصمم ليعمل <strong className="text-white">بشكل ذاتي وتلقائي بالكامل</strong>. بمجرد وضع رابط قصة من موقع <code className="text-amber-400 font-mono">kabbos.com</code> أو أي موقع آخر أو لصق النص، ينفذ النظام التالي:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pr-2">
            <li>سحب القصة وتنظيفها من الإعلانات وحشو الصفحات.</li>
            <li>تغيير أسماء الأشخاص والقرى والبلدات لمنع مطالبات حقوق الملكية الفكرية (Anti-Copyright Protection).</li>
            <li>صياغة إلقاء صوتي (Voiceover) متسلسل محكم بين <strong className="text-amber-400">20 إلى 35 كلمة لكل مشهد</strong> لمنع أي تكرار أو حشو.</li>
            <li>تطابق سمعي-بصري كامل (Audio-Visual Lock): العناصر المذكورة في الصوت هي ذاتها في أمر الصورة وحركة الكاميرا.</li>
            <li>توليد صور 4K وغلاف YouTube CTR فوراً، مع إمكانية تحويل المشاهد لفيديوهات حركية عبر نماذج Veo.</li>
            <li>مزامنة النشر المباشر عبر يوتيوب، وفيسبوك، وإنستغرام، وتيليجرام.</li>
          </ul>
        </div>
      </div>

      {/* Veo Video & Image Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-lg">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              توليد الفيديوهات الحركية (Veo Video Generation)
            </h3>
            <p className="text-xs text-slate-400">الاستفادة من اشتراك Google AI Studio Pro</p>
          </div>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-800 pt-4">
          <p>
            بفضل اشتراك Pro في Google AI Studio، يتيح لك النظام اختيار نسبة المشاهد المتحركة (مثلاً 30% أو 50% أو 100%).
          </p>
          <p>
            لكل مشهد يتم تحديد نوعه كـ <code className="text-red-400 font-mono">video</code>، يُنشئ المحرك أمراً سينمائياً بحركة الكاميرا (Motion Prompt)، ويمكنك الضغط على زر <strong className="text-white">"توليد فيديو متحرك (Veo)"</strong> ليقوم الخادم ببدء الرندر وتنزيل ملف MP4 عالي الجودة مباشرة.
          </p>
        </div>
      </div>

      {/* MCP Protocol Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              ربط المواقع وخوادم MCP (Model Context Protocol)
            </h3>
            <p className="text-xs text-slate-400">توصيل الوكيل بمصادر خارجية وأدوات مخصصة</p>
          </div>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-800 pt-4">
          <p>
            زر <strong className="text-purple-300">"بروتوكول MCP"</strong> في الشريط العلوي يتيح لك إضافة أي موقع أو سيرفر MCP مع رابط الـ Endpoint ومفتاح التوثيق. يقوم النظام بفحص الاتصال واكتشاف الأدوات (Tools) المتاحة لتوسيع قدرات الوكيل تلقائياً.
          </p>
        </div>
      </div>

      {/* Social Media Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              النشر عبر فيسبوك، إنستغرام، ويوتيوب
            </h3>
            <p className="text-xs text-slate-400">إدارة حسابات النشر التلقائي</p>
          </div>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-800 pt-4">
          <p>
            من خلال نافذة <strong className="text-amber-300">"المفاتيح والحسابات"</strong>، يمكنك ربط صفحات Facebook و Instagram للأعمال. بعد الانتهاء من توليد السيناريو والصور، تظهر لك أزرار النشر التلقائي المباشر بضغطة زر واحدة.
          </p>
        </div>
      </div>
    </div>
  );
}
