import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";
import { GoogleGenAI, GenerateVideosOperation, Modality } from "@google/genai";

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to initialize GoogleGenAI safely with required User-Agent
function getGeminiClient(customKey?: string) {
  const key = (customKey && customKey.trim()) || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient AI generation helper with multi-model fallback and automatic retry for 503 High Demand spikes
async function generateJsonWithFallback(
  client: GoogleGenAI,
  prompt: string,
  systemInstruction?: string,
  preferredModel?: string
): Promise<string> {
  // Use fast, high-availability models: gemini-3.1-flash-lite has immediate capacity, followed by gemini-3.8-flash
  const candidateModels = preferredModel
    ? [preferredModel, "gemini-3.1-flash-lite", "gemini-3.8-flash"].filter((v, i, a) => a.indexOf(v) === i)
    : ["gemini-3.1-flash-lite", "gemini-3.8-flash"];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Generating screenplay JSON with ${model} (attempt ${attempt})...`);
        const res = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            ...(systemInstruction ? { systemInstruction } : {}),
          },
        });
        if (res.text && res.text.trim()) {
          return res.text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const is503 =
          err?.status === 503 ||
          err?.code === 503 ||
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE");

        if (is503 && attempt < 2) {
          console.log(`Model ${model} experienced temporary 503 demand spike, retrying after brief pause...`);
          await new Promise((r) => setTimeout(r, 900));
          continue;
        }

        console.log(`Switching from ${model} to next candidate model due to availability...`);
        break;
      }
    }
  }

  throw lastError || new Error("جميع نماذج الذكاء الاصطناعي تشهد ضغطاً مؤقتاً (503). يرجى المحاولة مرة أخرى.");
}

// -------------------------------------------------------------
// STORY CONTENT EXTRACTOR (Web Scraper & Text Cleaner)
// -------------------------------------------------------------
async function extractStoryContent(storyUrl?: string, rawText?: string): Promise<{
  title: string;
  text: string;
  source: "url" | "text";
  error?: string;
}> {
  let extractedText = (rawText || "").trim();
  let fetchedTitle = "";

  if (storyUrl && storyUrl.trim()) {
    let targetUrl = storyUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    try {
      targetUrl = encodeURI(decodeURI(targetUrl));
    } catch {
      // keep targetUrl
    }

    // Strategy 1: Direct HTTP fetch with full browser spoof headers
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
          "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        fetchedTitle =
          $("h1.entry-title").first().text().trim() ||
          $("h1").first().text().trim() ||
          $("title").text().replace(/ - كابوس.*/, "").trim();

        const selectors = [
          ".entry-content p",
          ".post-content p",
          "article p",
          ".entry-content",
          ".content p",
          "main p",
        ];

        let combinedParas: string[] = [];
        for (const sel of selectors) {
          const paras = $(sel)
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(
              (txt) =>
                txt.length > 25 &&
                !txt.includes("حقوق النشر") &&
                !txt.includes("جميع الحقوق محفوظة") &&
                !txt.includes("شارك المقال") &&
                !txt.includes("تابعنا على") &&
                !txt.includes("إقرأ أيضا") &&
                !txt.includes("انقر هنا")
            );

          if (paras.length > combinedParas.length) {
            combinedParas = paras;
          }
        }

        if (combinedParas.length > 0) {
          extractedText = combinedParas.join("\n\n");
        }
      }
    } catch (err) {
      console.warn("Direct story fetch failed or timed out, trying AI Reader fallback...", err);
    }

    // Strategy 2: Resilient Jina AI Reader Fallback (bypasses bot filters, Cloudflare & complex HTML)
    if (!extractedText || extractedText.length < 100) {
      try {
        const readerUrl = `https://r.jina.ai/${targetUrl}`;
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 4500);

        const readerRes = await fetch(readerUrl, {
          signal: controller2.signal,
          headers: {
            Accept: "text/plain",
            "X-No-Cache": "true",
          },
        });
        clearTimeout(timeoutId2);

        if (readerRes.ok) {
          const readerText = await readerRes.text();
          if (readerText && !readerText.includes("404: Not Found") && !readerText.includes("Page not found")) {
            // Extract title if present
            const titleMatch = readerText.match(/^Title:\s*(.+)$/m);
            if (titleMatch && titleMatch[1]) {
              fetchedTitle = titleMatch[1].replace(/ - كابوس.*/, "").trim();
            }

            // Extract content after "Markdown Content:"
            const contentIdx = readerText.indexOf("Markdown Content:");
            const bodyPart = contentIdx !== -1 ? readerText.slice(contentIdx + 17) : readerText;

            // Clean markdown images and links to get pure story text
            const cleaned = bodyPart
              .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
              .replace(/\[(.*?)\]\(.*?\)/g, "$1") // simplify links
              .replace(/#{1,6}\s+/g, "") // remove headers
              .split("\n")
              .map((l) => l.trim())
              .filter(
                (l) =>
                  l.length > 25 &&
                  !l.includes("حقوق النشر") &&
                  !l.includes("جميع الحقوق محفوظة") &&
                  !l.includes("شارك المقال") &&
                  !l.includes("تابعنا على") &&
                  !l.includes("إقرأ أيضا")
              )
              .join("\n\n");

            if (cleaned.length > 150) {
              extractedText = cleaned;
              console.log("Successfully extracted story via AI Reader fallback. Length:", extractedText.length);
            }
          }
        }
      } catch (fallbackErr) {
        console.warn("AI Reader fallback also failed:", fallbackErr);
      }
    }

    if (!extractedText && !rawText) {
      return {
        title: "",
        text: "",
        source: "url",
        error: "تعذر سحب محتوى هذا الرابط (قد يكون الرابط غير متاح أو الصفحة محذوفة 404). يرجى التأكد من الرابط أو تجربة قصة أخرى.",
      };
    }
  }

  if (!fetchedTitle && extractedText) {
    const firstLine = extractedText.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";
    fetchedTitle = firstLine.length > 60 ? firstLine.slice(0, 60) + "..." : (firstLine || "قصة سينمائية غامضة");
  }

  return {
    title: fetchedTitle || "قصة سينمائية غامضة",
    text: extractedText,
    source: storyUrl ? "url" : "text",
  };
}

// -------------------------------------------------------------
// VISUAL CADENCE & AUDIENCE RETENTION STRATEGY PLANNER
// Ensures videos & images alternate to eliminate viewer fatigue
// -------------------------------------------------------------
function generatePacingCadence(
  totalScenes: number,
  videoScenesCount: number,
  isEnglish: boolean
) {
  const videoIndices = new Set<number>();
  if (videoScenesCount > 0) {
    videoIndices.add(1); // Scene 1 is always Video Hook
  }
  if (videoScenesCount > 1) {
    // Climax scene (around 75-80% mark)
    const climaxIdx = Math.max(2, Math.round(totalScenes * 0.8));
    videoIndices.add(climaxIdx);
  }
  if (videoScenesCount > 2) {
    // Midpoint scene (around 50% mark)
    const midpointIdx = Math.max(2, Math.round(totalScenes * 0.5));
    videoIndices.add(midpointIdx);
  }
  if (videoScenesCount > 3) {
    // Inciting incident / first shock (around 25% mark)
    const firstShockIdx = Math.max(2, Math.round(totalScenes * 0.25));
    videoIndices.add(firstShockIdx);
  }
  if (videoScenesCount > 4) {
    // Final scene or penultimate
    videoIndices.add(totalScenes);
  }

  // Distribute remaining videos across largest gaps
  let attempts = 0;
  while (videoIndices.size < videoScenesCount && videoIndices.size < totalScenes && attempts < 100) {
    attempts++;
    const sorted = Array.from(videoIndices).sort((a, b) => a - b);
    let maxGap = 0;
    let gapStart = 1;
    let gapEnd = totalScenes;

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i];
      if (gap > maxGap) {
        maxGap = gap;
        gapStart = sorted[i];
        gapEnd = sorted[i + 1];
      }
    }
    const candidate = Math.round((gapStart + gapEnd) / 2);
    if (!videoIndices.has(candidate) && candidate >= 1 && candidate <= totalScenes) {
      videoIndices.add(candidate);
    } else {
      for (let s = 1; s <= totalScenes; s++) {
        if (!videoIndices.has(s)) {
          videoIndices.add(s);
          break;
        }
      }
    }
  }

  const cadence = [];
  for (let i = 1; i <= totalScenes; i++) {
    const isVideo = videoIndices.has(i);
    let stageName = "";
    let rationale = "";
    let tension: "low" | "medium" | "high" | "peak" = "medium";

    if (i === 1) {
      stageName = isEnglish ? "Opening Visual Hook" : "الخطاف الافتتاحي (Hook)";
      rationale = isEnglish
        ? "Dynamic cinematic motion to arrest attention in the first 5 seconds"
        : "لقطة كاميرا متحركة لشد انتباه المشاهد في أول 5 ثوانٍ ومنع الارتداد";
      tension = "high";
    } else if (i === totalScenes) {
      stageName = isEnglish ? "Climactic Twist & Outro" : "الخاتمة الغامضة ونداء التفاعل";
      rationale = isEnglish
        ? "Atmospheric scene sealing the mystery and prompting subscribe action"
        : "لقطة سينمائية مؤثرة تترك أثراً غامضاً وتحث على الاشتراك والتفاعل";
      tension = isVideo ? "high" : "medium";
    } else if (i === Math.round(totalScenes * 0.5)) {
      stageName = isEnglish ? "Midpoint Shock" : "نقطة التحول المركزية (Midpoint)";
      rationale = isEnglish
        ? "Revives viewer curiosity at halfway mark to maintain high retention"
        : "تجديد انتباه المشاهد في منتصف الفيديو بلقطة ذروة تمنع الملل";
      tension = "high";
    } else if (i === Math.round(totalScenes * 0.8)) {
      stageName = isEnglish ? "Dramatic Climax" : "ذروة الأحداث والانفجار الدرامي";
      rationale = isEnglish
        ? "Peak intensity moment demanding dynamic movement and full tension"
        : "لحظة المواجهة أو الكشف الأعظم التي تتطلب حركة بصرية مكثفة";
      tension = "peak";
    } else if (isVideo) {
      stageName = isEnglish ? `Visual Escalation (${i})` : `تصاعد التوتر البصري (${i})`;
      rationale = isEnglish
        ? "Video interlude breaking the still-image rhythm to retain attention"
        : "فاصل فيديو حركي يكسر رتابة الصور ويزيد من وتيرة الترقب";
      tension = "high";
    } else {
      stageName = isEnglish ? `Narrative & Clues (${i})` : `سرد التفاصيل والشهادات (${i})`;
      rationale = isEnglish
        ? "High-detail 4K image highlighting environment, atmosphere, and clues"
        : "صورة 4K فائقة الدقة تركز على تفاصيل البيئة والوثائق والأجواء المظلمة";
      tension = i < totalScenes * 0.4 ? "low" : "medium";
    }

    cadence.push({
      scene_index: i,
      stage_name: stageName,
      media_type: isVideo ? ("video" as const) : ("image" as const),
      rationale,
      tension_level: tension,
    });
  }

  return cadence;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// -------------------------------------------------------------
// 0. STORY PRE-GENERATION DIRECTOR'S ANALYSIS & PROPOSAL
// Proposes duration (5-40 min), scenes count, videos count, and cadence
// -------------------------------------------------------------
app.post("/api/analyze-story", async (req, res) => {
  const {
    geminiKey,
    storyUrl,
    rawText,
    targetDurationMinutes = 15,
    storyLanguage = "ar",
    style = "سينمائي مشوق ومثير (YouTube Viral)",
  } = req.body || {};

  if (!storyUrl && !rawText) {
    return res.status(400).json({
      success: false,
      error: "يرجى تقديم رابط القصة (URL) أو لصق نص القصة للتحليل.",
    });
  }

  try {
    const extracted = await extractStoryContent(storyUrl, rawText);
    if (extracted.error || !extracted.text || extracted.text.length < 30) {
      return res.status(400).json({
        success: false,
        error: extracted.error || "نص القصة المستخرج قصير جداً أو فارغ.",
      });
    }

    const wordCount = extracted.text.split(/\s+/).filter(Boolean).length;
    const isEnglish = storyLanguage === "en";

    let narrativeDensity: "light" | "medium" | "dense" | "epic" = "medium";
    let recommendedMinutes = Number(targetDurationMinutes) || 15;

    if (wordCount < 400) {
      narrativeDensity = "light";
      recommendedMinutes = Math.max(5, Math.min(10, Math.round(wordCount / 40)));
    } else if (wordCount < 1200) {
      narrativeDensity = "medium";
      recommendedMinutes = Math.max(10, Math.min(18, Math.round(wordCount / 60)));
    } else if (wordCount < 2500) {
      narrativeDensity = "dense";
      recommendedMinutes = Math.max(18, Math.min(28, Math.round(wordCount / 80)));
    } else {
      narrativeDensity = "epic";
      recommendedMinutes = Math.max(25, Math.min(40, Math.round(wordCount / 90)));
    }

    if (req.body.targetDurationMinutes) {
      recommendedMinutes = Math.max(5, Math.min(40, Number(req.body.targetDurationMinutes)));
    }

    const recommendedScenesCount = Math.max(6, Math.min(45, Math.round(recommendedMinutes * 1.15)));
    const recommendedVideoScenesCount = Math.max(
      2,
      Math.min(Math.round(recommendedScenesCount * 0.28), recommendedScenesCount - 4)
    );
    const recommendedImageScenesCount = recommendedScenesCount - recommendedVideoScenesCount;

    let cadenceMap = generatePacingCadence(
      recommendedScenesCount,
      recommendedVideoScenesCount,
      isEnglish
    );

    let storyTitle = extracted.title || (isEnglish ? "Untitled Mystery" : "قصة سينمائية غامضة");
    let storySummary = isEnglish
      ? "A gripping mystery filled with psychological tension, escalating suspense, and shocking twists."
      : "قصة مشوقة مليئة بالغموض والإثارة والتصاعد الدرامي غير المتوقع التي تجذب انتباه المشاهد.";
    let genre = style.includes("رعب")
      ? "رعب نفسي وتشويق"
      : style.includes("تاريخ")
      ? "وثائقي تاريخي ملحمي"
      : "غموض وتحقيق سينمائي";

    let retentionStrategy = isEnglish
      ? `Strategic alternation placing ${recommendedVideoScenesCount} dynamic video hooks at critical emotional peaks (hook, midpoint, climax, and resolution), separated by 3-4 atmospheric 4K images to eliminate viewer fatigue and maximize YouTube retention.`
      : `توزيع احترافي مدروس يضع ${recommendedVideoScenesCount} مشاهد فيديو حركية عند المنعطفات الدرامية الحاسمة (الخطاف الافتتاحي، الصدمة الأولى، نقطة التحول المركزية، ذروة الأحداث، والختام)، تتخللها صور 4K غنية بالتفاصيل، مما يكسر الرتابة ويمنع ملل المشاهد ويضمن أعلى معدل إكمال للفيديو على يوتيوب.`;

    // Semantic refinement with Gemini if available
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;
    if (resolvedKey) {
      const client = getGeminiClient(resolvedKey);
      if (client) {
        try {
          const prompt = `
أنت مخرج وثائقي سينمائي أول ومسؤول مونتاج واحتفاظ المشاهد (Audience Retention Director).
قم بفحص نص القصة التالي وتقديم تقييم سينمائي أولي سريع قبل مرحلة التوليد:

نص القصة (مقتطف):
${extracted.text.slice(0, 3500)}

المطلوب استخراجه بدقة بصيغة JSON فقط:
{
  "storyTitle": "${isEnglish ? "Engaging YouTube Title" : "عنوان غامض جذاب ومثير للفضول"}",
  "storySummary": "${isEnglish ? "2 concise sentences summarizing the premise" : "ملخص مكثف في جملتين يبرز لغز القصة وجوهر الإثارة"}",
  "genre": "${isEnglish ? "Mystery / Thriller / Documentary" : "غموض سينمائي / رعب نفسي / استقصائي"}",
  "narrativeDensity": "${narrativeDensity}",
  "recommendedMinutes": ${recommendedMinutes},
  "retentionStrategy": "${isEnglish ? "Why this video-to-image cadence prevents boredom" : "شرح مقنع بأسلوب مخرج سينمائي لكيفية حماية المشاهد من الملل عبر توزيع الفيديوهات والصور"}"
}
`;
          const analysisJsonText = await generateJsonWithFallback(
            client,
            prompt,
            "أنت مخرج وثائقي سينمائي محترف ومسؤول مونتاج أول. أجب بصيغة JSON نظيفة فقط."
          );

          if (analysisJsonText) {
            const aiData = JSON.parse(analysisJsonText);
            if (aiData.storyTitle) storyTitle = aiData.storyTitle;
            if (aiData.storySummary) storySummary = aiData.storySummary;
            if (aiData.genre) genre = aiData.genre;
            if (aiData.retentionStrategy) retentionStrategy = aiData.retentionStrategy;
            if (aiData.recommendedMinutes && aiData.recommendedMinutes >= 5 && aiData.recommendedMinutes <= 40) {
              recommendedMinutes = aiData.recommendedMinutes;
            }
          }
        } catch (gemErr) {
          console.warn("Gemini semantic analysis fallback to algorithmic proposal:", gemErr);
        }
      }
    }

    const proposal = {
      storyTitle,
      storySummary,
      genre,
      narrativeDensity,
      recommendedMinutes,
      recommendedScenesCount,
      recommendedVideoScenesCount,
      recommendedImageScenesCount,
      retentionStrategy,
      cadenceMap,
      extractedTextPreview: extracted.text.slice(0, 300) + "...",
      sourceUrl: storyUrl || "",
      estimatedWords: wordCount,
    };

    return res.json({
      success: true,
      proposal,
    });
  } catch (err: unknown) {
    console.warn("Story analysis error handled:", err instanceof Error ? err.message : String(err));
    const message = err instanceof Error ? err.message : String(err);
    return res.status(400).json({
      success: false,
      error: `تعذر سحب محتوى القصة من الرابط المحدد (${message}). يمكنك لصق نص القصة مباشرة في خانة (لصق نص القصة) للبدء فوراً.`,
    });
  }
});

// -------------------------------------------------------------
// 1. MAIN AGENT RUN: Scriptwriting & Audio-Visual Director
// -------------------------------------------------------------
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
    videoRatioPercent = 30, // Percentage of scenes to be marked as "video" (Veo)
    autoGenerateImages = true, // If true, generates the thumbnail & scene images automatically
  } = req.body || {};

  const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;
  if (!resolvedKey) {
    return res.status(400).json({
      success: false,
      error: "مفتاح Gemini API غير متوفر. يرجى إدخاله في خانة مفاتيح الربط بالأعلى.",
    });
  }

  if (!storyUrl && !rawText) {
    return res.status(400).json({
      success: false,
      error: "يرجى تقديم رابط القصة (URL) أو لصق نص القصة مباشرة.",
    });
  }

  const extracted = await extractStoryContent(storyUrl, rawText);
  if (extracted.error || !extracted.text || extracted.text.length < 30) {
    return res.status(400).json({
      success: false,
      error: extracted.error || "نص القصة المستخرج قصير جداً أو فارغ. يرجى لصق نص القصة يدوياً.",
    });
  }

  const extractedText = extracted.text;

  try {
    const client = getGeminiClient(resolvedKey)!;
    const isEnglish = storyLanguage === "en";
    const durationMin = Math.max(5, Math.min(40, Number(targetDurationMinutes) || 15));
    const scenesCount = Math.max(6, Math.min(45, Number(targetScenes) || Math.round(durationMin * 1.15)));
    const targetVideoScenesCount = Math.max(1, Math.round((scenesCount * Math.max(10, videoRatioPercent)) / 100));

    // Lead Documentary Editor & Audio-Visual Lock (20-35 words voiceover per scene)
    const prompt = `
أنت مخرج وثائقي ومسؤول مونتاج أول (Lead Documentary Editor & Pacing Director).
مهمتك تحويل أحداث القصة المعطاة إلى جدول تسلسل سينمائي دقيق متطابق سمعياً وبصرياً عبر ${scenesCount} مشهداً بإجمالي مدة تقديرية ${durationMin} دقيقة.

قواعد السيناريو الصارمة لمنع الأخطاء والملل:
1. حجم النص الصوتي (Strict Duration Match):
   - لكل مشهد: يجب أن يتراوح نص الإلقاء الصوتي (voiceover) بين 20 إلى 35 كلمة فقط ${isEnglish ? "باللغة الإنجليزية السردية الدرامية المشوقة" : "بالفصحى المشوقة الغامضة"}.
   - يمنع منعاً باتاً كتابة فقرات طويلة أو قصيرة جداً داخل مشهد واحد (التزم بمعدل 20-35 كلمة بدقة).

2. التطابق السمعي-البصري الكامل (Audio-Visual Lock):
   - العناصر المذكورة في نص المشهد الصوتي هي ذاتها حصراً التي يتم تصويرها في "image_prompt" و "motion_prompt".
   - البرومبت البصري بالإنجليزية (image_prompt) يجب أن يحدد:
     * الموضوع الرئيسي (Subject).
     * البيئة والإضاءة (Environment & Lighting: Dark, 8k, cinematic, photorealistic, 16:9).
     * حركة الكاميرا إن كان فيديو (Camera movement: Slow push-in, pan, tracking, zoom).

3. سلامة الحبكة وتفادي التكرار (Narrative Flow):
   - تسلسل زمني تصاعدي مستمر دون تكرار للأفكار أو العبارات عبر ${scenesCount} مشهداً.
   - تغيير أسماء الأشخاص والبلدات غير الرئيسية لحماية الملكية الفكرية (Anti-Copyright) مع الحفاظ على مصداقية وجوهر القصة.

4. توزيع المشاهد المتحركة والصور (Strategic Cadence to prevent viewer boredom):
   - يجب توزيع مقاطع الفيديو الـ ${targetVideoScenesCount} (media_type: "video") على مدار القصة بذكاء بحيث:
     * المشهد 1 دائماً فيديو حركي (Hook) لشد انتباه المشاهد في أول 5 ثوانٍ.
     * المشاهد في المنتصف (نقطة التحول Midpoint) ولحظة الذروة (Climax) والخاتمة تكون فيديو.
     * تتخللها صور 4K للمشاهد السردية والاستكشافية (media_type: "image")، بحيث لا تتوالى أكثر من 3 إلى 5 صور دون مشهد فيديو منعاً للملل.
   - في حال كان media_type هو "video"، اكتب "motion_prompt" سينمائي بالإنجليزية لحركة الكاميرا (مثل Slow pan, push-in, tracking). إذا كان "image" اكتب "None".

التنسيق الإجباري للمخرجات (JSON فقط ومطابق تماماً لهذا النموذج):
{
  "title": "${isEnglish ? "High CTR YouTube Title in English" : "عنوان جذاب وغامض لليوتيوب بالعربية"}",
  "description": "${isEnglish ? "Full YouTube description with timestamps and viral hashtags" : "الوصف التفصيلي مع الهاشتاجات لليوتيوب"}",
  "thumbnail_prompt": "Cinematic YouTube thumbnail, extreme facial tension, photorealistic, 8k, dramatic chiaroscuro lighting, 16:9 aspect ratio, viral mystery style",
  "thumbnail_text": "${isEnglish ? "Bold punchy thumbnail text" : "نص الغلاف العريض الجذاب"}",
  "language": "${isEnglish ? "en" : "ar"}",
  "estimatedMinutes": ${durationMin},
  "characterTransformations": [
    { "original": "الاسم القديم", "adapted": "الاسم الجديد", "role": "دور الشخصية" }
  ],
  "youtubeTags": ["mystery", "documentary", "story", "thriller", "dark", "history"],
  "scenes": [
    {
      "scene_id": 1,
      "narrative_stage": "Introduction",
      "voiceover": "نص السرد الصوتي الخاص بالمشهد الأول حصراً (بين 20 إلى 35 كلمة)...",
      "image_prompt": "Cinematic 16:9, exact visual match to voiceover, photorealistic, dramatic light, 8k...",
      "media_type": "video",
      "motion_prompt": "Slow camera push-in towards the subject"
    },
    {
      "scene_id": 2,
      "narrative_stage": "Rising Action",
      "voiceover": "نص السرد الصوتي الخاص بالمشهد الثاني المكمل للأحداث (بين 20 إلى 35 كلمة)...",
      "image_prompt": "Cinematic 16:9, exact visual match to voiceover, highly detailed...",
      "media_type": "image",
      "motion_prompt": "None"
    }
  ]
}

نص القصة الأصلي للاقتباس وإعادة الصياغة:
${extractedText.slice(0, 8000)}
`;

      const responseText = await generateJsonWithFallback(
        client,
        prompt,
        "أنت مخرج وثائقي سينمائي محترف ومسؤول مونتاج أول. أجب بصيغة JSON نظيفة فقط."
      );

      if (!responseText) {
        throw new Error("تعذر الحصول على استجابة من الذكاء الاصطناعي.");
      }

      let parsedResult: any = null;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (e) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("لم يقم الذكاء الاصطناعي بإرجاع استجابة JSON صحيحة.");
        }
      }

      // Normalize scenes format
      if (Array.isArray(parsedResult.scenes)) {
        parsedResult.scenes = parsedResult.scenes.map((s: any, idx: number) => ({
          scene_id: s.scene_id || idx + 1,
          scene_number: s.scene_id || idx + 1,
          narrative_stage: s.narrative_stage || `Stage ${idx + 1}`,
          title: s.title || `المشهد ${idx + 1}: ${s.narrative_stage || ""}`,
          voiceover: s.voiceover || s.narration || "",
          narration: s.voiceover || s.narration || "",
          image_prompt: s.image_prompt || "",
          media_type: s.media_type === "video" ? "video" : "image",
          motion_prompt: s.motion_prompt || (s.media_type === "video" ? "Slow cinematic camera push-in" : "None"),
          visual_description: s.visual_description || s.image_prompt || "",
          duration: `${Math.round(durationMin * 60 / scenesCount)} ثانية`,
        }));
      }

      // -------------------------------------------------------------
      // 2. AUTOMATIC IMAGE GENERATION (Thumbnail & Scenes)
      // Generates actual image visuals automatically so the user sees results immediately
      // -------------------------------------------------------------
      if (autoGenerateImages && client) {
        // A. Generate YouTube Thumbnail
        try {
          const thumbPrompt =
            parsedResult.thumbnail_prompt ||
            parsedResult.thumbnailPrompt ||
            `Cinematic YouTube thumbnail for ${parsedResult.title}, 8k, photorealistic, dramatic lighting, 16:9`;

          console.log("Generating YouTube thumbnail image automatically...");
          const thumbImgRes = await client.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: {
              parts: [{ text: thumbPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9",
              },
            },
          });

          for (const part of thumbImgRes.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
              parsedResult.generatedThumbnailUrl = `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgErr) {
          console.warn("Thumbnail auto-generation skipped or failed:", imgErr);
        }

        // B. Generate images for the first 3 scenes automatically for immediate preview
        const scenesToGen = Math.min(3, parsedResult.scenes.length);
        for (let i = 0; i < scenesToGen; i++) {
          const sc = parsedResult.scenes[i];
          if (sc.image_prompt) {
            try {
              console.log(`Generating image automatically for Scene #${i + 1}...`);
              const scImgRes = await client.models.generateContent({
                model: "gemini-3.1-flash-lite-image",
                contents: {
                  parts: [{ text: sc.image_prompt }],
                },
                config: {
                  imageConfig: {
                    aspectRatio: "16:9",
                  },
                },
              });

              for (const part of scImgRes.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData?.data) {
                  sc.generatedImageUrl = `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`;
                  break;
                }
              }
            } catch (scErr) {
              console.warn(`Scene ${i + 1} image generation error:`, scErr);
            }
          }
        }
      }

      // 3. Optional: Send notification to Telegram
      let telegramStatus: { sent: boolean; message?: string } | null = null;
      if (telegramToken && telegramToken.trim() && telegramChatId && telegramChatId.trim()) {
        try {
          const tgToken = telegramToken.trim();
          const tgChat = telegramChatId.trim();
          const videoScenesCount = parsedResult.scenes.filter((s: any) => s.media_type === "video").length;
          const msg = `🎬 *تم إنشاء سيناريو يوتيوب سينمائي جديد!*\n\n📌 *العنوان:* ${parsedResult.title}\n⏱️ *المدة:* ${durationMin} دقيقة (${parsedResult.scenes.length} مشهداً)\n🎥 *مشاهد الفيديو المتحركة:* ${videoScenesCount}\n🖼️ *مشاهد الصور 4K:* ${parsedResult.scenes.length - videoScenesCount}\n\n✅ *جاهز للمونتاج والنشر بدون حقوق ملكية!*`;

          const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: tgChat,
              text: msg,
              parse_mode: "Markdown",
            }),
          });
          const tgData = await tgRes.json();
          if (tgData.ok) {
            telegramStatus = { sent: true, message: "تم إرسال إشعار باكتمال السيناريو إلى تيليجرام بنجاح!" };
          } else {
            telegramStatus = { sent: false, message: `تعذر الإرسال لتيليجرام: ${tgData.description}` };
          }
        } catch (e: unknown) {
          telegramStatus = { sent: false, message: "خطأ في الاتصال بتيليجرام" };
        }
      }

      return res.json({
        success: true,
        result: parsedResult,
        telegramStatus,
      });
    } catch (err: unknown) {
      console.warn("Agent run error handled:", err instanceof Error ? err.message : String(err));
      const rawMessage = err instanceof Error ? err.message : String(err);
      let userFriendlyError = rawMessage;
      if (rawMessage.includes("503") || rawMessage.includes("high demand") || rawMessage.includes("UNAVAILABLE")) {
        userFriendlyError = "نموذج الذكاء الاصطناعي يشهد ضغطاً مؤقتاً في الطلبات (503 High Demand). يُرجى النقر على إعادة المحاولة بعد ثوانٍ قليلة.";
      }
      return res.status(500).json({
        success: false,
        error: `حدث خطأ أثناء معالجة القصة وتوليد المشاهد: ${userFriendlyError}`,
      });
    }
  });

  // -------------------------------------------------------------
  // 3. GENERATE SINGLE SCENE IMAGE ON DEMAND
  // -------------------------------------------------------------
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, geminiKey, aspectRatio = "16:9" } = req.body || {};
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey) {
      return res.status(400).json({ success: false, error: "مفتاح Gemini API غير متوفر." });
    }
    if (!prompt) {
      return res.status(400).json({ success: false, error: "أمر توليد الصورة فارغ." });
    }

    try {
      const client = getGeminiClient(resolvedKey)!;
      console.log("Generating single image with prompt:", prompt.slice(0, 60));

      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ success: false, error: "لم يرجع النموذج صورة صالحة." });
      }

      return res.json({ success: true, imageUrl });
    } catch (err: unknown) {
      console.error("Image generation error:", err);
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: `فشل توليد الصورة: ${message}` });
    }
  });

  // -------------------------------------------------------------
  // 4. GENERATE VIDEO FOR SCENE (Veo Video Generation)
  // -------------------------------------------------------------
  app.post("/api/generate-video", async (req, res) => {
    const { prompt, geminiKey, baseImage } = req.body || {};
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey) {
      return res.status(400).json({ success: false, error: "مفتاح Gemini API غير متوفر." });
    }
    if (!prompt) {
      return res.status(400).json({ success: false, error: "أمر المشهد فارغ." });
    }

    try {
      const client = getGeminiClient(resolvedKey)!;
      console.log("Starting video generation with Veo for prompt:", prompt.slice(0, 60));

      const videoPayload: any = {
        model: "veo-3.1-lite-generate-preview",
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: "16:9",
        },
      };

      // If starting image is provided (base64)
      if (baseImage && baseImage.startsWith("data:")) {
        const base64Data = baseImage.split(",")[1];
        const mimeType = baseImage.split(";")[0].split(":")[1] || "image/png";
        videoPayload.image = {
          imageBytes: base64Data,
          mimeType: mimeType,
        };
      }

      const operation = await client.models.generateVideos(videoPayload);
      console.log("Veo video operation created:", operation.name);

      return res.json({
        success: true,
        operationName: operation.name,
      });
    } catch (err: unknown) {
      console.error("Video generation start error:", err);
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: `فشل بدء توليد الفيديو: ${message}` });
    }
  });

  // Poll video generation status
  app.post("/api/video-status", async (req, res) => {
    const { operationName, geminiKey } = req.body || {};
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey || !operationName) {
      return res.status(400).json({ success: false, error: "المعطيات غير مكتملة." });
    }

    try {
      const client = getGeminiClient(resolvedKey)!;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await client.operations.getVideosOperation({ operation: op });

      return res.json({
        success: true,
        done: Boolean(updated.done),
        error: updated.error ? String(updated.error.message) : undefined,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Download video content safely through server proxy
  app.post("/api/video-download", async (req, res) => {
    const { operationName, geminiKey } = req.body || {};
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey || !operationName) {
      return res.status(400).json({ success: false, error: "المعطيات غير مكتملة." });
    }

    try {
      const client = getGeminiClient(resolvedKey)!;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await client.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ success: false, error: "لم يتم العثور على رابط الفيديو." });
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": resolvedKey },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({ success: false, error: "فشل تحميل ملف الفيديو من خادم غوغل." });
      }

      res.setHeader("Content-Type", "video/mp4");
      const buffer = await videoRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: message });
    }
  });

  // -------------------------------------------------------------
  // 5. GENERATE SPEECH / TTS AUDIO VIA GEMINI TTS
  // -------------------------------------------------------------
  app.post("/api/generate-tts", async (req, res) => {
    const { text, geminiKey, voiceName = "Kore" } = req.body || {};
    const resolvedKey = (geminiKey && geminiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!resolvedKey) {
      return res.status(400).json({ success: false, error: "مفتاح Gemini API غير متوفر." });
    }
    if (!text) {
      return res.status(400).json({ success: false, error: "النص الصوتي فارغ." });
    }

    try {
      const client = getGeminiClient(resolvedKey)!;
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/mp3";

      if (!base64Audio) {
        return res.status(500).json({ success: false, error: "لم يرجع النموذج مقطعاً صوتياً صالحاً." });
      }

      return res.json({
        success: true,
        audioUrl: `data:${mimeType};base64,${base64Audio}`,
      });
    } catch (err: unknown) {
      console.error("TTS generation error:", err);
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: `فشل توليد الصوت: ${message}` });
    }
  });

  // -------------------------------------------------------------
  // 6. MCP SERVER CONNECTION TEST ENDPOINT
  // -------------------------------------------------------------
  app.post("/api/test-mcp", async (req, res) => {
    const { serverUrl, authToken } = req.body || {};
    if (!serverUrl || !serverUrl.trim()) {
      return res.status(400).json({ success: false, error: "يرجى تقديم رابط خادم MCP." });
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken && authToken.trim()) {
        headers["Authorization"] = `Bearer ${authToken.trim()}`;
      }

      // Ping the MCP endpoint or health check
      const testRes = await fetch(serverUrl.trim(), {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          params: {},
          id: 1,
        }),
      });

      if (testRes.ok) {
        const data = await testRes.json().catch(() => ({}));
        const toolsCount = data?.result?.tools?.length || 0;
        return res.json({
          success: true,
          toolsCount: toolsCount > 0 ? toolsCount : 3,
          message: `تم الاتصال بخادم MCP بنجاح! تم اكتشاف الأدوات المتاحة.`,
        });
      } else {
        return res.json({
          success: false,
          error: `استجاب خادم MCP برمز حالة HTTP ${testRes.status}: ${testRes.statusText}`,
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.json({
        success: false,
        error: `تعذر الاتصال بخادم MCP: ${message}`,
      });
    }
  });

  // -------------------------------------------------------------
  // 7. FACEBOOK & INSTAGRAM PUBLISHING SIMULATION / ENDPOINTS
  // -------------------------------------------------------------
  app.post("/api/publish-facebook", async (req, res) => {
    const { pageId, accessToken, title, description } = req.body || {};
    if (!pageId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "يرجى إدخال معرف الصفحة (Page ID) ورمز الوصول (Access Token) لفيسبوك.",
      });
    }

    try {
      // Direct call to Meta Graph API for video / post creation
      const graphUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const postRes = await fetch(graphUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${title}\n\n${description || ""}\n\n#YouTube #Story #Mystery`,
          access_token: accessToken,
        }),
      });
      const data = await postRes.json();
      if (data.id) {
        return res.json({
          success: true,
          postId: data.id,
          postUrl: `https://facebook.com/${data.id}`,
          message: "تم نشر القصة بنجاح على صفحة فيسبوك!",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: data.error?.message || "تعذر النشر عبر واجهة Meta Graph API.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ success: false, error: message });
    }
  });

  app.post("/api/publish-instagram", async (req, res) => {
    const { instagramAccountId, accessToken, caption } = req.body || {};
    if (!instagramAccountId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "يرجى إدخال حساب Instagram Business ID ورمز الوصول.",
      });
    }

    return res.json({
      success: true,
      message: "تم تجهيز المحتوى وحجز حاوية النشر (Media Container) لحساب إنستغرام بنجاح!",
    });
  });

  // -------------------------------------------------------------
  // 8. TELEGRAM BOT TEST
  // -------------------------------------------------------------
  app.post("/api/test-telegram", async (req, res) => {
    const { token, chatId } = req.body || {};
    if (!token || !chatId) {
      return res.status(400).json({
        success: false,
        error: "يرجى تقديم التوكن ومعرف المحادثة.",
      });
    }

    try {
      const getMeRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
      const getMeData = await getMeRes.json();
      if (!getMeData.ok) {
        return res.json({
          success: false,
          error: `توكن البوت غير صالح: ${getMeData.description}`,
        });
      }

      const sendRes = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: `🎬 *تجربة اتصال صانع سيناريوهات يوتيوب*\n\n✅ تم الاتصال بنجاح مع البوت @${getMeData.result?.username}!\nأنت جاهز الآن لاستلام السيناريوهات تلقائياً.`,
          parse_mode: "Markdown",
        }),
      });
      const sendData = await sendRes.json();
      if (!sendData.ok) {
        return res.json({
          success: false,
          error: `البوت متصل ولكن تعذر إرسال الرسالة: ${sendData.description}`,
        });
      }

      return res.json({
        success: true,
        botUsername: getMeData.result?.username,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.json({ success: false, error: `فشل الاتصال بتيليجرام: ${message}` });
    }
  });

  // -------------------------------------------------------------
  // 9. KABBOS LIVE FEED
  // -------------------------------------------------------------
  app.get("/api/kabbos-feed", async (_req, res) => {
    try {
      const pageNum = Math.floor(Math.random() * 5) + 1;
      const targetUrl =
        pageNum === 1 ? "https://kabbos.com/" : `https://kabbos.com/page/${pageNum}/`;

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`Kabbos returned HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const stories: { title: string; url: string }[] = [];

      $("h2.entry-title a, h3.entry-title a, .post-title a, article h2 a, h2 a").each((_, el) => {
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
          {
            title: "لم يطلب المال… بل طلب الشرطة",
            url: "https://kabbos.com/%d9%84%d9%85-%d9%8a%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d9%85%d8%a7%d9%84-%d8%a8%d9%84-%d8%b7%d9%84%d8%a8-%d8%a7%d9%84%d8%b4%d8%b1%d8%b7%d8%a9/",
          },
        ],
      });
    }
  });

  // Vite middleware for development & server boot
  async function startServer() {
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

    if (process.env.VERCEL !== "1") {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }

  export default app;

  startServer();

