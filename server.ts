import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Main run endpoint matching api/run.py
  app.post("/api/run", async (req, res) => {
    const {
      geminiKey,
      storyUrl,
      rawText,
      telegramToken,
      telegramChatId,
      style = "سينمائي مشوق ومثير (YouTube Viral)",
      targetScenes = 15,
      storyLanguage = "ar",
      targetDurationMinutes = 15,
      selectedChannelId,
    } = req.body || {};

    // 1. Resolve API key
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey) {
      return res.status(400).json({
        success: false,
        error: "مفتاح Gemini API غير متوفر. يرجى إدخاله في الخانة المخصصة.",
      });
    }

    if (!storyUrl && !rawText) {
      return res.status(400).json({
        success: false,
        error: "يرجى تقديم رابط القصة (URL) أو لصق نص القصة مباشرة.",
      });
    }

    let extractedText = (rawText || "").trim();
    let fetchedTitle = "";

    // 2. Fetch and scrape content from URL if provided
    if (storyUrl && storyUrl.trim()) {
      try {
        const targetUrl = storyUrl.trim();
        const response = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
          },
          signal: AbortSignal.timeout(12000),
        });

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);

          // Remove script, style, nav, footer, header elements, sidebars and comments
          $(
            "script, style, nav, footer, header, noscript, iframe, svg, aside, .sidebar, #sidebar, .comments-area, #comments, .sharedaddy, .yarpp-related, .post-meta, .breadcrumb, nav"
          ).remove();

          fetchedTitle =
            $("h1.post-title").first().text().trim() ||
            $("h1.entry-title").first().text().trim() ||
            $("h1").first().text().trim() ||
            $("title").text().replace(/- كابوس.*/, "").trim();

          const paragraphs: string[] = [];

          // Targeted selector: kabbos and standard blog articles use .entry-content p or .post-content p
          $(
            ".entry-content p, .post-content p, article .entry p, article p, main p, .article-body p, p"
          ).each((_i, el) => {
            const text = $(el).text().trim();
            // Filter out short navigational bits or copyright disclaimers
            if (
              text.length > 20 &&
              !text.includes("حقوق النشر") &&
              !text.includes("أكمل القراءة") &&
              !text.includes("شارك المقالة") &&
              !text.includes("جميع الحقوق محفوظة")
            ) {
              paragraphs.push(text);
            }
          });

          const scraped = paragraphs.join("\n\n").slice(0, 8000);
          if (scraped.length > 50) {
            extractedText = scraped;
          }
        }
      } catch (err: unknown) {
        console.warn("Could not fetch story URL:", err);
        // If we don't have rawText either, fail with helpful message
        if (!extractedText) {
          const message = err instanceof Error ? err.message : String(err);
          return res.status(400).json({
            success: false,
            error: `تعذر جلب المحتوى من الرابط (${message}). يرجى التحقق من الرابط أو لصق نص القصة في خانة النص مباشرة.`,
          });
        }
      }
    }

    if (!extractedText || extractedText.length < 30) {
      return res.status(400).json({
        success: false,
        error: "نص القصة المستخرج قصير جداً أو فارغ. يرجى لصق نص القصة يدوياً.",
      });
    }

    try {
      // 3. Call Gemini with automatic retry & fallback for high-demand spikes (503/429)
      const client = new GoogleGenAI({
        apiKey: resolvedKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const isEnglish = storyLanguage === "en";
      const scenesCount = Math.max(10, Math.min(30, Number(targetScenes) || 15));
      const durationMin = Math.max(10, Math.min(30, Number(targetDurationMinutes) || 15));

      const prompt = `
You are a master Hollywood YouTube Director and Scriptwriter specializing in creating viral, copyright-free long-form videos (${durationMin} minutes long).

TASK:
Take the provided story source (scraped from web/Kabbos) and adapt it completely into a 100% ORIGINAL, COPYRIGHT-FREE, captivating YouTube story script.

TARGET SPECIFICATIONS:
- Language for Narration & Title: ${isEnglish ? "ENGLISH (fluent, engaging, dramatic native American/British English)" : "ARABIC (فصحى سينمائية مؤثرة ومشوقة)"}
- Target Video Duration: ${durationMin} MINUTES (Expand details, build suspense, elaborate on atmosphere and character feelings so it sustains a ${durationMin}-minute production).
- Number of Scenes: Generate EXACTLY ${scenesCount} detailed scenes.
- Directing Style: ${style}
- Copyright Protection (Anti-Copyright): Completely rename characters, change specific towns/landmarks into fictional or alternate names, rephrase all events so YouTube content ID cannot detect any verbatim copying.

REQUIRED JSON OUTPUT FORMAT:
{
  "title": "${isEnglish ? "Engaging YouTube Video Title in English" : "عنوان يوتيوب مشوق وجذاب بالعربية"}",
  "logline": "${isEnglish ? "2-sentence dramatic hook logline in English" : "ملخص مشوق للقصة في سطرين"}",
  "language": "${isEnglish ? "en" : "ar"}",
  "estimatedMinutes": ${durationMin},
  "originalTitleDetected": "${fetchedTitle || "Unknown"}",
  "style": "${style}",
  "thumbnailPrompt": "Cinematic YouTube thumbnail concept, extreme drama, high contrast, 8k, photorealistic face expression, mysterious lighting, highly detailed, text-less",
  "thumbnailDescription": "${isEnglish ? "Visual description of thumbnail" : "وصف ما يظهر في الغلاف المصغر لليوتيوب"}",
  "characterTransformations": [
    { "original": "الاسم القديم", "adapted": "${isEnglish ? "New English Name" : "الاسم الجديد"}", "role": "دور الشخصية" }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "title": "${isEnglish ? "Scene Title in English" : "عنوان المشهد بالعربية"}",
      "narration": "${isEnglish ? "Deep, immersive English voiceover text for this scene (around 60-80 words)..." : "نص التعليق الصوتي الفصيح المعبر والمفصل لهذا المشهد..."}",
      "visual_description": "${isEnglish ? "Camera movement and visual description" : "الوصف الإخراجي لما يظهر في هذا المشهد"}",
      "image_prompt": "Cinematic 8k photograph, dramatic lighting, detailed facial expressions, ultra-realistic, shot on 35mm lens, photorealistic...",
      "duration": "45-60 ثانية"
    }
  ],
  "youtubeTags": ["tag1", "tag2", "tag3"],
  "closingCallToAction": "${isEnglish ? "Compelling outro and call to subscribe in English" : "خاتمة الفيديو ونداء الاشتراك بالقناة"}"
}

RAW SOURCE TEXT:
${extractedText.slice(0, 7500)}
`;

      // Robust multi-model fallback cascade to guard against temporary 503 high-demand surges
      const candidateModels = [
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.1-pro-preview",
      ];
      let responseText = "";
      let lastErr: unknown = null;

      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          try {
            attempts++;
            console.log(`Sending generation request to model: ${modelName} (attempt ${attempts})...`);
            const genRes = await client.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                systemInstruction:
                  "أنت مخرج سينمائي وكاتب سيناريو خبير. كل إجاباتك تكون بتنسيق JSON نظيف وصالح.",
              },
            });
            responseText = genRes.text || "";
            if (responseText) {
              console.log(`Successfully received story generation from model: ${modelName}`);
              break;
            }
          } catch (err: unknown) {
            lastErr = err;
            console.warn(`Attempt ${attempts} with model ${modelName} failed:`, err);
            // Exponential backoff before retry or switching model on 503 / 429
            const delayMs = attempts === 1 ? 1500 : 2500;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }

        if (responseText) break;
      }

      if (!responseText) {
        throw lastErr || new Error("تعذر الحصول على استجابة من نموذج Gemini.");
      }

      const rawResultText = responseText;
      let parsedResult: any = null;

      try {
        parsedResult = JSON.parse(rawResultText);
      } catch (parseErr) {
        // Fallback: search for json block if markdown formatting was included
        const jsonMatch = rawResultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = {
            title: "سيناريو القصة المقتبسة",
            rawStory: rawResultText,
            scenes: [],
          };
        }
      }

      // 4. Optional: Send to Telegram if tokens provided
      let telegramStatus: { sent: boolean; message?: string } | null = null;
      if (telegramToken && telegramToken.trim() && telegramChatId && telegramChatId.trim()) {
        try {
          const tgToken = telegramToken.trim();
          const tgChat = telegramChatId.trim();

          const messageText = `🎬 *تم تجهيز قصة يوتيوب جديدة بنجاح!*\n\n*العنوان:* ${parsedResult.title || "قصة جديدة"}\n\n*الملخص:* ${parsedResult.logline || ""}\n\n*عدد المشاهد:* ${parsedResult.scenes?.length || 0}\n\nجاهز للإنتاج!`;

          const tgRes = await fetch(
            `https://api.telegram.org/bot${tgToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: tgChat,
                text: messageText,
                parse_mode: "Markdown",
              }),
            }
          );

          const tgData = await tgRes.json();
          if (tgData.ok) {
            telegramStatus = { sent: true, message: "تم إرسال الإشعار والملخص لقناة/محادثة تيليجرام بنجاح!" };
          } else {
            telegramStatus = {
              sent: false,
              message: `خطأ تيليجرام: ${tgData.description || "تعذر الإرسال"}`,
            };
          }
        } catch (tgErr: unknown) {
          const errStr = tgErr instanceof Error ? tgErr.message : String(tgErr);
          telegramStatus = { sent: false, message: `تعذر الاتصال بتيليجرام: ${errStr}` };
        }
      }

      return res.json({
        success: true,
        result: parsedResult,
        rawOutput: rawResultText,
        telegramStatus,
        sourceLength: extractedText.length,
      });
    } catch (apiError: unknown) {
      console.error("Gemini API error:", apiError);
      const errorMessage =
        apiError instanceof Error ? apiError.message : String(apiError);

      let userFriendlyError = `خطأ في معالجة الذكاء الاصطناعي: ${errorMessage}`;
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
        userFriendlyError =
          "النموذج يواجه ضغطاً مؤقتاً في خوادم Google (503 Service Unavailable). يرجى المحاولة بعد بضع ثوانٍ أو التحقق من مفتاح Gemini الخاص بك في زر مفاتيح الربط.";
      } else if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        userFriendlyError =
          "تم استهلاك الحصة المجانية المؤقتة لمفتاحك (Rate Limit / Quota Exceeded). يرجى الانتظار دقيقة أو وضع مفتاحك الخاص من aistudio.google.com في زر مفاتيح الربط.";
      }

      return res.status(500).json({
        success: false,
        error: userFriendlyError,
      });
    }
  });

  // Telegram test endpoint
  app.post("/api/test-telegram", async (req, res) => {
    const { token, chatId } = req.body || {};
    if (!token || !chatId) {
      return res.status(400).json({
        success: false,
        error: "يرجى إدخال توكن البوت ومعرّف المحادثة Chat ID",
      });
    }
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
      const meData = await tgRes.json();
      if (!meData.ok) {
        return res.json({ success: false, error: "توكن البوت غير صحيح" });
      }

      const sendRes = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: `🔔 اختبار اتصال وكيل صناعة القصص بنجاح!\nالبوت: @${meData.result.username}`,
        }),
      });
      const sendData = await sendRes.json();
      if (sendData.ok) {
        return res.json({ success: true, botUsername: meData.result.username });
      } else {
        return res.json({ success: false, error: sendData.description });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.json({ success: false, error: msg });
    }
  });

  // Kabbos.com live stories feed endpoint
  app.get("/api/kabbos-feed", async (_req, res) => {
    try {
      const response = await fetch("https://kabbos.com/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return res.json({ success: false, stories: [] });
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const stories: { title: string; url: string; excerpt?: string }[] = [];

      $("h2.post-title a, h3.post-title a, .post-title a").each((_i, el) => {
        const title = $(el).text().trim();
        const url = $(el).attr("href");
        if (
          title &&
          url &&
          url.startsWith("https://kabbos.com/") &&
          !url.includes("/category/") &&
          !url.includes("/author/") &&
          !url.includes("/tag/") &&
          !stories.some((s) => s.url === url)
        ) {
          stories.push({ title, url });
        }
      });

      return res.json({
        success: true,
        stories: stories.slice(0, 15),
      });
    } catch (err: unknown) {
      console.warn("Could not fetch kabbos feed:", err);
      // Return preset fallback list if network fails
      return res.json({
        success: true,
        stories: [
          {
            title: "لغز طاهر بك.. ساحر مصر الذي تحدّى الموت",
            url: "https://kabbos.com/%d9%84%d8%ba%d8%b2-%d8%b7%d8%a7%d9%87%d8%b1-%d8%a8%d9%83-%d8%b3%d8%a7%d8%ad%d8%b1-%d9%85%d8%b5%d8%b1-%d8%a7%d9%84%d8%b0%d9%8a-%d8%aa%d8%ad%d8%af%d9%91%d9%89-%d8%a7%d9%84%d9%85%d9%88%d8%aa/",
          },
          {
            title: "3906: شهادة رجل عاد من المستقبل",
            url: "https://kabbos.com/3906-%d8%b4%d9%87%d8%a7%d8%af%d8%a9-%d8%b1%d8%ac%d9%84-%d8%b9%d8%a7%d8%af-%d9%85%d8%b6%d8%aa%d9%82%d8%a8%d9%84/",
          },
          {
            title: "ساعة بلا عقارب .. لكن بضربات قلب!",
            url: "https://kabbos.com/%d8%b3%d8%a7%d8%b9%d8%a9-%d8%a8%d9%84%d8%a7-%d8%b9%d9%82%d8%a7%d8%b1%d8%a8-%d9%84%d9%83%d9%86-%d8%a8%d8%b6%d8%b1%d8%a8%d8%a7%d8%aa-%d9%82%d9%84%d8%a8/",
          },
        ],
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
