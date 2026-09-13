import { VercelFile } from "../types";

export const VERCEL_PROJECT_FILES: VercelFile[] = [
  {
    name: "index.html",
    path: "my-video-agent/index.html",
    lang: "html",
    description: "واجهة الموقع الرسومية البسيطة التي تفتحها في المتصفح من أي جهاز لإدخال المفاتيح ورابط القصة.",
    content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>وكيل صناعة القصص التلقائي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Cairo', sans-serif;
      background: #090d16;
      color: #f1f5f9;
      display: flex;
      justify-content: center;
      padding: 40px 16px;
      margin: 0;
    }
    .card {
      background: #131d2e;
      border: 1px solid #1e293b;
      padding: 32px;
      border-radius: 16px;
      width: 100%;
      max-width: 650px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    h2 { margin-top: 0; color: #38bdf8; font-size: 22px; }
    p.desc { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    label { display: block; margin-top: 14px; font-weight: 600; font-size: 13px; color: #cbd5e1; }
    input, textarea {
      width: 100%;
      padding: 11px 13px;
      margin-top: 5px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0a0f1d;
      color: #fff;
      font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: #38bdf8; }
    button.btn {
      width: 100%;
      padding: 13px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      margin-top: 24px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 700;
      font-family: inherit;
    }
    button.btn:hover { background: #1d4ed8; }
    .keys-toggle-btn {
      width: 100%;
      padding: 10px 14px;
      background: #1e293b;
      color: #fbbf24;
      border: 1px solid #d97706;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: inherit;
      margin-bottom: 16px;
    }
    .keys-toggle-btn:hover { background: #334155; }
    .keys-panel {
      background: #0b1120;
      border: 1px solid #1e293b;
      padding: 14px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: none;
    }
    #status { margin-top: 15px; text-align: center; font-size: 14px; font-weight: 600; }
    #result { margin-top: 20px; background: #0a0f1d; border: 1px solid #223049; border-radius: 10px; padding: 16px; white-space: pre-wrap; font-size: 14px; max-height: 450px; overflow-y: auto; display: none; }
  </style>
</head>
<body>

<div class="card">
  <h2>🎬 صانع قصص يوتيوب التلقائي</h2>
  <p class="desc">ضع رابط القصة أو مقال وسيقوم الوكيل الذكي بالباقي وتحويله إلى سيناريو يوتيوب خالي من حقوق الملكية:</p>

  <!-- Separate Button for Keys -->
  <button type="button" class="keys-toggle-btn" onclick="toggleKeysPanel()">
    <span>🔑 إعدادات مفاتيح الربط (Gemini / Telegram)</span>
    <span id="keysArrow">▼</span>
  </button>

  <div id="keysPanel" class="keys-panel">
    <label>مفتاح Google Gemini API: *</label>
    <input type="password" id="geminiKey" placeholder="الصق المفتاح هنا (يبدأ بـ AIzaSy...)">

    <label>توكن بوت تيليجرام (اختياري للإشعارات):</label>
    <input type="password" id="telegramToken" placeholder="123456789:AAF...">

    <label>معرف محادثة تيليجرام (Chat ID اختياري):</label>
    <input type="text" id="telegramChatId" placeholder="@channel_name أو ID رقمي">
  </div>

  <label>رابط القصة أو المقال:</label>
  <input type="text" id="storyUrl" placeholder="https://example.com/story">

  <label>أو الصق نص القصة يدوياً:</label>
  <textarea id="rawText" rows="3" placeholder="إذا لم يعمل الرابط، الصق النص هنا مباشرة..."></textarea>

  <button class="btn" id="startBtn" onclick="startAgent()">🚀 ابدأ إنشاء القصة والمحتوى</button>

  <div id="status"></div>
  <div id="result"></div>
</div>

<script>
function toggleKeysPanel() {
  const panel = document.getElementById('keysPanel');
  const arrow = document.getElementById('keysArrow');
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    arrow.innerText = '▼';
  } else {
    panel.style.display = 'block';
    arrow.innerText = '▲';
  }
}

async function startAgent() {
  const geminiKey = document.getElementById('geminiKey').value.trim();
  const storyUrl = document.getElementById('storyUrl').value.trim();
  const rawText = document.getElementById('rawText').value.trim();
  const telegramToken = document.getElementById('telegramToken').value.trim();
  const telegramChatId = document.getElementById('telegramChatId').value.trim();
  const status = document.getElementById('status');
  const btn = document.getElementById('startBtn');
  const resultDiv = document.getElementById('result');

  if (!geminiKey) {
    document.getElementById('keysPanel').style.display = 'block';
    document.getElementById('keysArrow').innerText = '▲';
    alert("يرجى إدخال مفتاح Gemini API من زر إعدادات المفاتيح!");
    return;
  }
  if (!storyUrl && !rawText) {
    alert("يرجى وضع رابط القصة أو لصق نصها!");
    return;
  }

  btn.disabled = true;
  status.style.color = "#38bdf8";
  status.innerText = "⏳ جاري قراءة القصة وتوليد السيناريو الخالي من حقوق الملكية...";
  resultDiv.style.display = 'none';

  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geminiKey, storyUrl, rawText, telegramToken, telegramChatId })
    });
    const data = await res.json();
    btn.disabled = false;

    if (data.success) {
      status.style.color = "#34d399";
      status.innerText = "✅ تمت معالجة القصة وتجهيز السيناريو بنجاح!";
      resultDiv.innerText = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
      resultDiv.style.display = 'block';
    } else {
      status.style.color = "#f87171";
      status.innerText = "❌ حدث خطأ: " + (data.error || "خطأ غير متوقع");
    }
  } catch(e) {
    btn.disabled = false;
    status.style.color = "#f87171";
    status.innerText = "❌ تعذر الاتصال بالسيرفر. تحقق من الرابط وإعدادات Vercel.";
  }
}
</script>

</body>
</html>`
  },
  {
    name: "vercel.json",
    path: "my-video-agent/vercel.json",
    lang: "json",
    description: "ملف إعدادات Vercel يوجّه استدعاءات المسار /api/run إلى الدالة السحابية api/run.py.",
    content: `{
  "rewrites": [
    { "source": "/api/run", "destination": "/api/run.py" }
  ]
}`
  },
  {
    name: "requirements.txt",
    path: "my-video-agent/requirements.txt",
    lang: "text",
    description: "قائمة المكتبات التي يقوم Vercel بتثبيتها آلياً عند الرفع (google-genai، beautifulsoup4، requests).",
    content: `google-genai
beautifulsoup4
requests`
  },
  {
    name: "api/run.py",
    path: "my-video-agent/api/run.py",
    lang: "python",
    description: "الدالة السحابية المكتوبة بلغة Python التي تتولى جلب القصة بالرابط، تجريدها من حقوق الملكية عبر Gemini، وصياغة المشاهد والصور.",
    content: `import json
import requests
from bs4 import BeautifulSoup
from http.server import BaseHTTPRequestHandler
from google import genai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body.decode('utf-8'))

        gemini_key = data.get('geminiKey')
        story_url = data.get('storyUrl', '')
        raw_text = data.get('rawText', '')
        telegram_token = data.get('telegramToken', '')
        telegram_chat_id = data.get('telegramChatId', '')

        try:
            text = raw_text.strip()
            # 1. جلب محتوى القصة من الرابط
            if story_url and story_url.strip():
                try:
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    res = requests.get(story_url.strip(), headers=headers, timeout=12)
                    soup = BeautifulSoup(res.text, 'html.parser')
                    for s in soup(['script', 'style', 'nav', 'footer', 'header']):
                        s.decompose()
                    paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 20]
                    scraped = " ".join(paragraphs)[:6000]
                    if len(scraped) > 50:
                        text = scraped
                except Exception as scrape_err:
                    if not text:
                        raise Exception(f"تعذر جلب القصة من الرابط: {str(scrape_err)}")

            if not text or len(text) < 30:
                raise Exception("نص القصة قصير جداً أو فارغ. يرجى إدخال رابط أو نص صحيح.")

            # 2. إرسال النص لـ Gemini لإعادة الصياغة وتوليد المشاهد
            client = genai.Client(api_key=gemini_key)
            prompt = f"""
أنت مخرج سينمائي وكاتب سيناريو محترف ليوتيوب. أعد كتابة هذه القصة بالكامل لحمايتها من حقوق الملكية:
1. غيّر جميع أسماء الشخصيات والأماكن تماماً.
2. اكتب عنواناً جذاباً وملخصاً مشوقاً.
3. قسّم السيناريو إلى 4 إلى 6 مشاهد سينمائية مشوقة.
4. لكل مشهد اكتب:
   - رقم وعنوان المشهد
   - نص التعليق الصوتي بالعربية
   - وصف ما نراه في الشاشة
   - وصف سينمائي بالإنجليزية (Prompt) لتوليد صورة المشهد بالذكاء الاصطناعي بدقة عالية.

نص القصة:
{text[:5000]}
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            result_text = response.text or ""

            # 3. إرسال إشعار اختياري إلى تيليجرام
            telegram_msg = ""
            if telegram_token and telegram_chat_id:
                try:
                    tg_url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"
                    requests.post(tg_url, json={
                        "chat_id": telegram_chat_id,
                        "text": f"🎬 تم توليد سيناريو جديد بنجاح!\n\n{result_text[:700]}..."
                    }, timeout=6)
                    telegram_msg = "تم إرسال إشعار تيليجرام بنجاح"
                except Exception as tg_err:
                    telegram_msg = f"خطأ تيليجرام: {str(tg_err)}"

            result_data = {
                "success": True,
                "result": result_text,
                "telegram": telegram_msg
            }

        except Exception as e:
            result_data = {"success": False, "error": str(e)}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(result_data, ensure_ascii=False).encode('utf-8'))
`
  },
  {
    name: "README.md",
    path: "my-video-agent/README.md",
    lang: "markdown",
    description: "ملف الإرشادات السريع لكيفية رفع المجلد على GitHub وVercel خلال دقيقة واحدة.",
    content: `# وكيل صناعة القصص التلقائي (Vercel Ready)

هذا المجلد جاهز بنسبة 100% للرفع المباشر على منصة Vercel مجاناً.

## الملفات المطلوبة داخل المجلد:
- index.html
- vercel.json
- requirements.txt
- api/run.py

## خطوات النشر:
1. ارفع هذا المجلد إلى حسابك في GitHub.
2. اذهب إلى vercel.com واضغط Add New Project.
3. استورد المستودع واضغط Deploy.
4. استمتع بموقعك الخاص المتاح 24/7 على الإنترنت!`
  }
];
