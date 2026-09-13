import os
import json
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from google import genai

app = FastAPI()

class StoryRequest(BaseModel):
    geminiKey: Optional[str] = ""
    storyUrl: Optional[str] = ""
    rawText: Optional[str] = ""
    telegramToken: Optional[str] = ""
    telegramChatId: Optional[str] = ""
    style: Optional[str] = "سينمائي مشوق ومثير (YouTube Viral)"
    targetScenes: Optional[int] = 15
    storyLanguage: Optional[str] = "ar"
    targetDurationMinutes: Optional[int] = 15
    selectedChannelId: Optional[str] = ""

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "hasServerGeminiKey": bool(os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/run")
def process_story(data: StoryRequest):
    try:
        gemini_key = (data.geminiKey or "").strip() or os.environ.get("GEMINI_API_KEY", "").strip()
        if not gemini_key:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "يرجى إدخال مفتاح Gemini API في خانة المفتاح أو في متغيرات البيئة."}
            )

        text = (data.rawText or "").strip()
        story_url = (data.storyUrl or "").strip()
        fetched_title = ""

        # 1. سحب المقال وتنظيفه إن وُجد رابط
        if story_url:
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
                }
                res = requests.get(story_url, headers=headers, timeout=12)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "aside"]):
                        tag.decompose()
                    
                    title_elem = soup.find(["h1", "title"])
                    if title_elem:
                        fetched_title = title_elem.get_text().strip()

                    paragraphs = [
                        p.get_text().strip() for p in soup.find_all("p") 
                        if len(p.get_text().strip()) > 20 and "حقوق النشر" not in p.get_text()
                    ]
                    scraped_text = "\n\n".join(paragraphs)[:8000]
                    if len(scraped_text) > 50:
                        text = scraped_text
            except Exception as scrape_err:
                if not text:
                    return JSONResponse(
                        status_code=400,
                        content={"success": False, "error": f"تعذر جلب القصة من الرابط: {str(scrape_err)}. جرب لصق النص مباشرة."}
                    )

        if not text or len(text) < 30:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "نص القصة قصير جداً أو فارغ. يرجى إدخال رابط صالح أو لصق نص القصة."}
            )

        # 2. إعداد استدعاء Gemini بنماذج متعددة للحماية من أخطاء 503
        client = genai.Client(api_key=gemini_key)
        is_english = data.storyLanguage == "en"
        duration_min = max(10, min(30, int(data.targetDurationMinutes or 15)))
        scenes_count = max(10, min(30, int(data.targetScenes or 15)))

        prompt = f"""
You are a master Hollywood YouTube Director and Scriptwriter specializing in creating viral, copyright-free long-form videos ({duration_min} minutes long).

TASK:
Take the provided story source and adapt it completely into a 100% ORIGINAL, COPYRIGHT-FREE YouTube story script.

TARGET SPECIFICATIONS:
- Language: {"ENGLISH (fluent, dramatic English narration)" if is_english else "ARABIC (فصحى سينمائية مشوقة)"}
- Target Video Duration: {duration_min} MINUTES
- Number of Scenes: Generate EXACTLY {scenes_count} detailed scenes.
- Directing Style: {data.style}
- Anti-Copyright: Completely rename characters and locations so YouTube cannot detect any copy.

REQUIRED JSON OUTPUT FORMAT:
{{
  "title": "{"Engaging English Title" if is_english else "عنوان مشوق بالعربية"}",
  "logline": "{"2-sentence dramatic hook" if is_english else "ملخص مشوق في سطرين"}",
  "language": "{"en" if is_english else "ar"}",
  "estimatedMinutes": {duration_min},
  "originalTitleDetected": "{fetched_title or 'Unknown'}",
  "style": "{data.style}",
  "thumbnailPrompt": "Cinematic YouTube thumbnail concept, extreme drama, high contrast, 8k, photorealistic face expression, mysterious lighting, highly detailed, text-less",
  "thumbnailDescription": "{"Visual description of thumbnail" if is_english else "وصف ما يظهر في الغلاف المصغر"}",
  "characterTransformations": [
    {{ "original": "الاسم القديم", "adapted": "{"New English Name" if is_english else "الاسم الجديد"}", "role": "دور الشخصية" }}
  ],
  "scenes": [
    {{
      "scene_number": 1,
      "title": "{"Scene 1 Title" if is_english else "عنوان المشهد الأول"}",
      "narration": "{"Deep, immersive English voiceover text..." if is_english else "نص التعليق الصوتي الفصيح المعبر لهذا المشهد..."}",
      "visual_description": "{"Camera movement and visual description" if is_english else "الوصف الإخراجي لما يظهر في هذا المشهد"}",
      "image_prompt": "Cinematic 8k photograph, dramatic lighting, detailed facial expressions, ultra-realistic, shot on 35mm lens...",
      "duration": "45-60 ثانية"
    }}
  ],
  "youtubeTags": ["tag1", "tag2", "tag3"],
  "closingCallToAction": "{"Compelling outro and call to subscribe" if is_english else "خاتمة الفيديو ونداء الاشتراك بالقناة"}"
}}

RAW SOURCE TEXT:
{text[:7500]}
"""

        candidate_models = [
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-3.8-flash",
            "gemini-2.5-pro",
        ]

        response_text = ""
        last_err = None

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    response_text = response.text
                    break
            except Exception as m_err:
                last_err = m_err
                continue

        if not response_text:
            raise Exception(f"فشلت جميع نماذج Gemini في توليد الرد: {str(last_err)}")

        # 3. استخراج الـ JSON
        parsed_json = None
        clean_text = response_text.strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```", 1)[1].split("```", 1)[0].strip()

        try:
            parsed_json = json.loads(clean_text)
        except Exception:
            # Fallback simple structure if markdown raw text returned
            parsed_json = {
                "title": fetched_title or "قصة يوتيوب سينمائية",
                "logline": "تم توليد السيناريو كاملاً بالذكاء الاصطناعي.",
                "language": "en" if is_english else "ar",
                "estimatedMinutes": duration_min,
                "scenes": [
                    {
                        "scene_number": 1,
                        "title": "السيناريو الكامل",
                        "narration": clean_text,
                        "visual_description": "مشهد سينمائي درامي",
                        "image_prompt": "Cinematic 8k photograph, dramatic lighting, photorealistic, 35mm",
                        "duration": f"{duration_min} دقيقة"
                    }
                ],
                "thumbnailPrompt": "Cinematic 8k YouTube thumbnail, high contrast, dramatic face expression",
                "youtubeTags": ["قصص", "يوتيوب", "سيناريو"]
            }

        # 4. إرسال إلى تيليجرام إن وُجد
        telegram_status = None
        if data.telegramToken and data.telegramChatId:
            try:
                tg_url = f"https://api.telegram.org/bot{data.telegramToken.strip()}/sendMessage"
                tg_text = f"🎬 تم توليد سيناريو جديد: {parsed_json.get('title', '')}\nالمدة: {duration_min} دقيقة\nعدد المشاهد: {len(parsed_json.get('scenes', []))}"
                requests.post(tg_url, json={"chat_id": data.telegramChatId.strip(), "text": tg_text}, timeout=5)
                telegram_status = {"sent": True, "message": "تم إرسال إشعار للتيليجرام بنجاح"}
            except Exception as tg_err:
                telegram_status = {"sent": False, "message": f"تعذر إرسال تيليجرام: {str(tg_err)}"}

        return {
            "success": True,
            "result": parsed_json,
            "telegramStatus": telegram_status,
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"خطأ في السيرفر: {str(e)}"}
        )

@app.post("/api/test-telegram")
def test_telegram(payload: dict):
    token = (payload.get("token") or "").strip()
    chat_id = (payload.get("chatId") or "").strip()
    if not token or not chat_id:
        return {"success": False, "error": "يرجى إدخال التوكن ومعرف المحادثة"}
    try:
        r = requests.get(f"https://api.telegram.org/bot{token}/getMe", timeout=5).json()
        if not r.get("ok"):
            return {"success": False, "error": "توكن البوت غير صحيح"}
        send_r = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": "🔔 اختبار اتصال الوكيل بنجاح!"},
            timeout=5
        ).json()
        return {"success": send_r.get("ok", False), "botUsername": r.get("result", {}).get("username")}
    except Exception as e:
        return {"success": False, "error": str(e)}
