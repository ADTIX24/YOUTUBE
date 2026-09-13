import {
  Rocket,
  Key,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Youtube,
} from "lucide-react";

export function SetupGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Step 1: Vercel Deployment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              طريقة الرفع والاستضافة على Vercel مجاناً (خلال دقيقة واحدة)
            </h3>
            <p className="text-xs text-slate-400">بدون الحاجة لكتابة كود أو تثبيت برامج على جهازك</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              أ
            </span>
            <p>
              قم بتنزيل الحزمة من تبويب <strong className="text-white">"ملفات Vercel الجاهزة"</strong> أو أنشئ مجلداً على جهازك باسم <code className="text-emerald-400 font-mono">my-video-agent</code> وضع فيه الملفات الأربعة.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ب
            </span>
            <p>
              ارفع هذا المجلد على حسابك في <strong className="text-white">GitHub</strong> (مستودع جديد باسم مثلاً <code className="text-blue-400 font-mono">story-agent</code>).
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ج
            </span>
            <p>
              ادخل على موقع <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold">Vercel.com</a>، اضغط <strong className="text-white">Add New Project</strong>، واختر مستودع الـ GitHub ثم اضغط <strong className="text-white">Deploy</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <p className="text-emerald-300 font-semibold">
              مبروك! ستتلقى رابطاً مباشراً (مثل https://story-agent.vercel.app) يفتح لك لوحة التحكم من متصفح الهاتف أو الكمبيوتر في أي وقت.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: How to get Gemini API Key */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              كيفية الحصول على مفتاح Gemini API مجاناً
            </h3>
            <p className="text-xs text-slate-400">منصة Google الرسمية للذكاء الاصطناعي</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          <p>
            1. توجّه إلى موقع <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold">Google AI Studio API Keys</a> وسجل الدخول بحساب Google الخاص بك.
          </p>
          <p>
            2. اضغط على زر <strong className="text-white">Create API Key</strong>.
          </p>
          <p>
            3. انسخ المفتاح الذي يبدأ بـ <code className="text-amber-300 font-mono">AIzaSy...</code> والصقه في خانة مفتاح Gemini باللوحة.
          </p>
        </div>
      </div>

      {/* Step 3: Telegram Bot Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              إعداد بوت تيليجرام (اختياري لاستلام القصص فوراً)
            </h3>
            <p className="text-xs text-slate-400">لإرسال ملخصات القصص والسيناريوهات إلى هاتفك أو قناتك</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          <p>
            1. افتح تطبيق تيليجرام وابحث عن البوت الرسمي: <strong className="text-sky-300 font-mono">@BotFather</strong>.
          </p>
          <p>
            2. أرسل الأمر <code className="text-slate-100 bg-slate-950 px-2 py-0.5 rounded font-mono">/newbot</code> واتبع التعليمات لاختيار اسم للبوت.
          </p>
          <p>
            3. سيعطيك البوت التوكن الخاص بك (مثال: <code className="text-slate-400 font-mono">123456:ABC-DEF1234...</code>).
          </p>
          <p>
            4. للحصول على معرف المحادثة (Chat ID): ابحث عن بوت مثل <strong className="text-sky-300 font-mono">@userinfobot</strong> واضغط Start، سيعطيك رقم الـ ID الخاص بك مباشرة. أو ضع اسم قناتك مع علامة <code className="text-slate-100 font-mono">@channel_name</code> بعد تعيين البوت مشرفاً فيها.
          </p>
        </div>
      </div>

      {/* Why copyright protection works */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              كيف يحمي الوكيل قناتك من مخالفات حقوق الطبع والنشر؟
            </h3>
            <p className="text-xs text-slate-400">معايير يوتيوب الصارمة والاستخدام العادل</p>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-slate-300 border-t border-slate-800 pt-4 list-disc list-inside leading-relaxed">
          <li><strong>تغيير شامل للشخصيات والأماكن:</strong> لا يتم استخدام الأسماء الأصلية لحماية السيناريو من المطالبات القانونية.</li>
          <li><strong>إعادة صياغة درامية 100%:</strong> لا ينسخ الذكاء الاصطناعي فقرات المقال أو القصة الأصلية، بل يعيد بناء الأحداث بنبرة تعليق صوتي سينمائي فصيح.</li>
          <li><strong>أوامر صور مخصصة:</strong> يعطيك أوامر Prompt إنجليزية مفصلة لتوليد صور حصرية بالذكاء الاصطناعي لا وجود لها على الإنترنت مسبقاً.</li>
        </ul>
      </div>
    </div>
  );
}
