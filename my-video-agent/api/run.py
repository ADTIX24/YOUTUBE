import json
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
            # 1. جلب محتوى القصة من الرابط إذا وجد
            if story_url and story_url.strip():
                try:
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                    res = requests.get(story_url.strip(), headers=headers, timeout=12)
                    soup = BeautifulSoup(res.text, 'html.parser')
                    for s in soup(['script', 'style', 'nav', 'footer', 'header']):
                        s.decompose()
                    paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 20]
                    scraped_text = " ".join(paragraphs)[:6000]
                    if len(scraped_text) > 50:
                        text = scraped_text
                except Exception as scrape_err:
                    if not text:
                        raise Exception(f"تعذر جلب القصة من الرابط: {str(scrape_err)}. جرب لصق النص مباشرة.")

            if not text or len(text) < 30:
                raise Exception("نص القصة قصير جداً أو فارغ. يرجى إدخال رابط صالح أو كتابة النص.")

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
                    tg_payload = {
                        "chat_id": telegram_chat_id,
                        "text": f"🎬 تم توليد قصة وسيناريو جديد بنجاح!\n\n{result_text[:800]}..."
                    }
                    requests.post(tg_url, json=tg_payload, timeout=6)
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
