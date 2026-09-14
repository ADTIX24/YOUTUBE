import json
import requests
from bs4 import BeautifulSoup
from http.server import BaseHTTPRequestHandler
from google import genai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            data = json.loads(body.decode('utf-8'))

            gemini_key = (data.get('geminiKey') or "").strip()
            story_url = (data.get('storyUrl') or "").strip()
            raw_text = (data.get('rawText') or "").strip()
            telegram_token = (data.get('telegramToken') or "").strip()
            telegram_chat_id = (data.get('telegramChatId') or "").strip()
            style = data.get('style') or "سينمائي مشوق ومثير (YouTube Viral)"
            target_scenes = data.get('targetScenes') or 15
            target_duration = data.get('targetDurationMinutes') or 15
            story_lang = data.get('storyLanguage') or "ar"

            if not gemini_key:
                raise ValueError("يرجى تزويد مفتاح Gemini API في الخانة المخصصة")

            if not story_url and not raw_text:
                raise ValueError("يرجى تزويد رابط القصة أو لصق نص القصة مباشرة")

            text = raw_text
            fetched_title = ""

            # 1. سحب المقال إن وُجد رابط
            if story_url:
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
                    }
                    res = requests.get(story_url, headers=headers, timeout=12)
                    if res.status_code == 200:
                        soup = BeautifulSoup(res.text, 'html.parser')
                        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                            tag.decompose()
                        title_el = soup.find(["h1", "title"])
                        if title_el:
                            fetched_title = title_el.get_text().strip()
                        paragraphs = [
                            p.get_text().strip() for p in soup.find_all('p')
                            if len(p.get_text().strip()) > 20 and "حقوق النشر" not in p.get_text()
                        ]
                        scraped = "\n\n".join(paragraphs)[:6000]
                        if len(scraped) > 40:
                            text = scraped
                except Exception as scrape_err:
                    if not text:
                        raise ValueError(f"تعذر قراءة محتوى الرابط: {str(scrape_err)}. يرجى نسخ النص ولصقه مباشرة.")

            if not text or len(text.strip()) < 20:
                raise ValueError("لم نتمكن من استخراج نص كافٍ. يرجى لصق نص القصة يدوياً.")

            # 2. إرسال النص إلى Gemini بنظام التدوير لحماية الـ 503
            client = genai.Client(api_key=gemini_key)
            is_english = story_lang == "en"

            prompt = f"""
أنت مخرج سينمائي وكاتب سيناريو يوتيوب محترف.
المهمة:
أعد صياغة هذه القصة بالكامل لتكون سيناريو حصري 100% خالٍ تماماً من حقوق الملكية وموجهاً لفيديو يوتيوب طويل ({target_duration} دقيقة).

القواعد الإجبارية:
1. غيّر جميع أسماء الشخصيات والمدن والمعالم لأسماء جديدة وخيالية.
2. قسّم القصة بدقة إلى {target_scenes} مشهداً.
3. لكل مشهد:
   - عنوان المشهد
   - نص التعليق الصوتي الدرامي المفصل (نص ثري بالأحداث والمشاعر)
   - الوصف الإخراجي البصري لما يظهر على الشاشة
   - وصف صورة المشهد (Image Prompt بالإنجليزية مخصص لتوليد صورة 8K بالذكاء الاصطناعي)
4. أضف مقترح عنوان جذاب لليوتيوب، وملخص في سطرين، وفكرة الغلاف المصغر (Thumbnail Prompt).
5. اللغة المستهدفة: {"الإنجليزية" if is_english else "العربية الفصحى السينمائية المشوقة"}.
6. النمط الإخراجي: {style}.

النص المصدر:
{text[:5000]}
"""

            candidate_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.8-flash"]
            response_text = ""
            last_err = None

            for model_name in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        response_text = response.text
                        break
                except Exception as m_err:
                    last_err = m_err
                    continue

            if not response_text:
                raise ValueError(f"فشلت نماذج Gemini في الرد: {str(last_err)}")

            # 3. إرسال إشعار تيليجرام إن وُجد
            telegram_msg = ""
            if telegram_token and telegram_chat_id:
                try:
                    tg_url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"
                    tg_payload = {
                        "chat_id": telegram_chat_id,
                        "text": f"🎬 تم توليد سيناريو القصة بنجاح بواسطة الوكيل!\nالعنوان الأصلي: {fetched_title or 'بدون عنوان'}\nالمدة التقديرية: {target_duration} دقيقة"
                    }
                    requests.post(tg_url, json=tg_payload, timeout=5)
                    telegram_msg = "تم إرسال إشعار للتيليجرام"
                except Exception as tg_err:
                    telegram_msg = f"تعذر إرسال تيليجرام: {str(tg_err)}"

            result_data = {
                "success": True,
                "result": response_text,
                "telegram": telegram_msg
            }
            status_code = 200

        except Exception as e:
            result_data = {"success": False, "error": str(e)}
            status_code = 500

        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(result_data, ensure_ascii=False).encode('utf-8'))

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()
        self.wfile.write("مسار الـ API يعمل وجاهز لاستقبال الـ POST".encode('utf-8'))
