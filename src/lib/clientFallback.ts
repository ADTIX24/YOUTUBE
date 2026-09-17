// Client-side resilience and fallback engine
// Ensures the application NEVER fails even if Vercel serverless functions time out or encounter a 500 error

const CURATED_PRESETS_DATA: Record<string, { title: string; text: string }> = {
  "طاهر بك": {
    title: "لغز طاهر بك.. ساحر مصر الذي تحدّى الموت",
    text: `في ثلاثينيات القرن الماضي، هزّ الساحر المصري طاهر بك الأوساط العلمية والطبية في أوروبا بحيل وظواهر خارقة عجز الأطباء عن تفسيرها. كان يدّعي قدرته على إيقاف نبضات قلبه والدخول في غيبوبة تامة تشبه الموت، ثم الاستيقاظ منها بعد ساعات.
قام علماء وأطباء في باريس ولندن بوضعه في توابيت مغلقة ودفنه تحت الأرض وتحت الماء لأكثر من أربعين دقيقة دون أي أكسجين، وكان يخرج حياً معافى.
أثار طاهر بك حيرة واسعة بين من رآه ساحراً يمتلك قوى غامضة، ومن اعتبره خبيراً متمرساً في تقنيات التنفس الهندية القديمة (اليوجا).
انتهت حياته في ظروف غامضة، تاركاً وراءه واحداً من أكثر الألغاز إثارة في تاريخ الخوارق والتحقيقات الصحفية.`,
  },
  "الضلع": {
    title: "الضلع الزائد – ثقب في جدار النوايا",
    text: `تبدأ القصة في ليلة عاصفة حين وجد المحقق أوراقاً قديمة تعود لعائلة اختفت فجأة دون أن تترك أي أثر. كان هناك ضلع عظمي غريب محفور عليه رموز غير مفهومة داخل صندوق خرساني مغلق.
مع توالي التحقيقات والشهادات، اكتشف الجيران أن البيت القديم كان يشهد أصوات خطوات ونداءات في أوقات متأخرة، بينما الأبواب والنوافذ محكمة الإغلاق.
كل من حاول فك شفرة تلك الرموز عانى من كوابيس متكررة واضطرابات في الرؤية، كأن شيئاً ينظر إليهم من الجانب الآخر للمرآة.
كشفت الوثائق أن الحادثة لم تكن جريمة عادية، بل محاولة للتواصل مع عوالم أخرى انتهت بفتح ثقب لا يمكن إغلاقه في جدار النوايا.`,
  },
  "أقنعة": {
    title: "قضية أقنعة الرصاص المحيرة",
    text: `في عام 1966، تم العثور على جثتي فنيي إلكترونيات برازيليين على تلة فينتم في ريو دي جانيرو. كانا يرتديان بدلات رسمية، ومعاطف مقاومة للماء، وأقنعة غريبة مصنوعة من الرصاص تحمي العينين.
بجانب الجثتين كانت هناك زجاجة ماء فارغة ودفتر ملاحظات صغير كُتبت فيه تعليمات غامضة: في الساعة المحددة تناول الكبسولة، وعندما يبدأ التأثير ارتدِ قناع الرصاص وانتظر الإشارة.
لم تظهر على الجثتين أي آثار عنف أو تسمم، ولم تُسرق أموالهما التي كانت بحوزتهما.
حتى يومنا هذا، تظل قضية أقنعة الرصاص واحدة من أغرب ألغاز الوفيات في التاريخ الجنائي العالمي.`,
  },
  "ساعة": {
    title: "ساعة بلا عقارب .. لكن بضربات قلب!",
    text: `اشترى تاجر تحف ساعة جيب قديمة من مزاد أوروبي مغمور. الغريب أن الساعة لم تكن تحتوي على أي عقارب تدور، بل قرص أسود مصمت.
عند وضع الساعة على الأذن، لم تكن تصدر صوت التكتكة الميكانيكي المعتاد، بل صوت نبضات قلب بشرية منتظمة وسريعة.
لاحظ التاجر أن صوت النبضات يتسارع كلما شعر هو بالخوف أو التوتر، وأن الساعة تتوقف تماماً إذا كان الغرفة فارغة تماماً.
بعد أسابيع من مراقبة الساعة، بدأت تظهر نقوش مجهرية على حوافها تشير إلى اسم صانع ساعات إيطالي اختفى عام 1892 بعد أن ادعى أنه حبس روحه داخل آلة.`,
  },
  "لم يطلب": {
    title: "لم يطلب المال… بل طلب الشرطة",
    text: `في ظهيرة يوم هادئ، دخل رجل غامض إلى فرع أحد البنوك الكبرى في لندن. وقف أمام الموظف بهدوء ولم يُشهر سلاحاً ولم يطلب حقيبة نقود، بل سلّم ورقة مكتوب عليها جملة واحدة: اتصل بالشرطة فوراً واطلب منهم اعتقالي قبل أن تغرب الشمس.
عند وصول الشرطة، استسلم الرجل دون مقاومة، لكن التحقيقات كشفت أنه لا يحمل أي هوية، وبصماته غير مسجلة في أي قاعدة بيانات حول العالم.
الأغرب هو ما قاله للمحققين في غرفة الاستجواب: أنا لا أهرب منكم، بل أحاول الاحتماء داخل زنزانة فولاذية من الكيان الذي يتعقبني منذ ثلاثة أيام.
وفي منتصف الليل، انطفأت أضواء مركز الشرطة بالكامل لعشر ثوانٍ فقط، وعندما عادت، كانت الزنزانة فارغة تماماً دون كسر للأقفال.`,
  },
};

export function buildClientSideProposal(
  text: string,
  userStoryUrl = "",
  targetDurationMinutes = 15,
  style = "سينمائي مشوق ومثير (YouTube Viral)",
  storyLanguage: "ar" | "en" = "ar"
) {
  const isEnglish = storyLanguage === "en";
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let narrativeDensity: "light" | "medium" | "dense" | "epic" = "medium";
  let recommendedMinutes = Math.max(5, Math.min(40, Number(targetDurationMinutes) || 15));

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

  if (targetDurationMinutes) {
    recommendedMinutes = Math.max(5, Math.min(40, targetDurationMinutes));
  }

  const recommendedScenesCount = Math.max(6, Math.min(45, Math.round(recommendedMinutes * 1.15)));
  const recommendedVideoScenesCount = Math.max(
    2,
    Math.min(Math.round(recommendedScenesCount * 0.28), recommendedScenesCount - 4)
  );
  const recommendedImageScenesCount = recommendedScenesCount - recommendedVideoScenesCount;

  // Strategic Cadence Distribution
  const videoIndices = new Set<number>();
  videoIndices.add(1); // Hook
  videoIndices.add(Math.round(recommendedScenesCount * 0.5)); // Midpoint
  videoIndices.add(Math.round(recommendedScenesCount * 0.8)); // Climax
  videoIndices.add(recommendedScenesCount); // Outro

  let attempts = 0;
  while (videoIndices.size < recommendedVideoScenesCount && attempts < 100) {
    attempts++;
    for (let s = 2; s < recommendedScenesCount; s++) {
      if (!videoIndices.has(s)) {
        videoIndices.add(s);
        if (videoIndices.size >= recommendedVideoScenesCount) break;
      }
    }
  }

  const cadenceMap = [];
  for (let i = 1; i <= recommendedScenesCount; i++) {
    const isVideo = videoIndices.has(i);
    let stageName = "";
    let rationale = "";
    let tension: "low" | "medium" | "high" | "peak" = "medium";

    if (i === 1) {
      stageName = isEnglish ? "Opening Visual Hook" : "الخطاف الافتتاحي (Hook)";
      rationale = isEnglish ? "Dynamic camera motion to arrest attention" : "لقطة كاميرا متحركة لشد انتباه المشاهد في أول 5 ثوانٍ";
      tension = "high";
    } else if (i === recommendedScenesCount) {
      stageName = isEnglish ? "Climactic Twist & Outro" : "الخاتمة الغامضة ونداء التفاعل";
      rationale = isEnglish ? "Atmospheric scene prompting subscription" : "لقطة سينمائية مؤثرة تترك أثراً غامضاً وتحث على الاشتراك";
      tension = isVideo ? "high" : "medium";
    } else if (i === Math.round(recommendedScenesCount * 0.5)) {
      stageName = isEnglish ? "Midpoint Shock" : "نقطة التحول المركزية (Midpoint)";
      rationale = isEnglish ? "Revives viewer curiosity at halfway mark" : "تجديد انتباه المشاهد في منتصف الفيديو بلقطة ذروة تمنع الملل";
      tension = "high";
    } else if (i === Math.round(recommendedScenesCount * 0.8)) {
      stageName = isEnglish ? "Dramatic Climax" : "ذروة الأحداث والانفجار الدرامي";
      rationale = isEnglish ? "Peak intensity moment demanding dynamic movement" : "لحظة المواجهة أو الكشف الأعظم التي تتطلب حركة بصرية مكثفة";
      tension = "peak";
    } else if (isVideo) {
      stageName = isEnglish ? `Visual Escalation (${i})` : `تصاعد التوتر البصري (${i})`;
      rationale = isEnglish ? "Video interlude breaking still-image rhythm" : "فاصل فيديو حركي يكسر رتابة الصور ويزيد من وتيرة الترقب";
      tension = "high";
    } else {
      stageName = isEnglish ? `Narrative & Clues (${i})` : `سرد التفاصيل والشهادات (${i})`;
      rationale = isEnglish ? "High-detail 4K image highlighting environment" : "صورة 4K فائقة الدقة تركز على تفاصيل البيئة والوثائق";
      tension = i < recommendedScenesCount * 0.4 ? "low" : "medium";
    }

    cadenceMap.push({
      scene_index: i,
      stage_name: stageName,
      media_type: isVideo ? ("video" as const) : ("image" as const),
      rationale,
      tension_level: tension,
    });
  }

  // Extract or synthesize clean title
  const firstLine = text.trim().split("\n")[0] || "";
  const storyTitle = firstLine.replace(/^[#*\-•\s]+/, "").slice(0, 60) || (isEnglish ? "Cinematic Mystery" : "قصة سينمائية غامضة");

  const storySummary = isEnglish
    ? "A gripping documentary mystery structured for dramatic audio-visual pacing and maximum retention."
    : "قصة مشوقة مليئة بالغموض والإثارة والتصاعد الدرامي تم تنظيمها وفق وتيرة إخراجية متوازنة تمنع الملل.";

  const genre = style.includes("رعب")
    ? "رعب نفسي وتشويق"
    : style.includes("تاريخ")
    ? "وثائقي تاريخي ملحمي"
    : "غموض وتحقيق سينمائي";

  const retentionStrategy = isEnglish
    ? `Strategic distribution alternating ${recommendedVideoScenesCount} dynamic video scenes with atmospheric 4K images to maximize YouTube retention.`
    : `توزيع احترافي مدروس يضع ${recommendedVideoScenesCount} مشاهد فيديو حركية عند المنعطفات الدرامية الحاسمة، تتخللها صور 4K لمنع الملل وتحقيق أعلى معدل إكمال للفيديو على يوتيوب.`;

  return {
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
    extractedTextPreview: text.slice(0, 300) + "...",
    sourceUrl: userStoryUrl,
    estimatedWords: wordCount,
    extractedText: text,
  };
}

export async function fetchStoryClientFallback(url: string): Promise<{ title: string; text: string } | null> {
  const decoded = decodeURIComponent(url).toLowerCase();

  // Check internal cache
  for (const [key, val] of Object.entries(CURATED_PRESETS_DATA)) {
    if (decoded.includes(key.toLowerCase())) {
      return val;
    }
  }

  // Try Jina Reader directly from client
  try {
    const cleanUrl = url.replace(/^https?:\/\//i, "");
    const jinaRes = await fetch(`https://r.jina.ai/https://${cleanUrl}`, {
      headers: { Accept: "text/plain" },
    });
    if (jinaRes.ok) {
      const markdown = await jinaRes.text();
      if (markdown && markdown.length > 100) {
        const lines = markdown.split("\n").filter((l) => l.trim().length > 0);
        const title = lines[0]?.replace(/^#*\s*/, "").slice(0, 60) || "قصة مستخرجة";
        return { title, text: markdown.slice(0, 12000) };
      }
    }
  } catch {
    // ignore
  }

  // Try CORS proxy
  try {
    const proxyRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    if (proxyRes.ok) {
      const html = await proxyRes.text();
      if (html && html.length > 200) {
        const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length > 100) {
          return { title: "قصة مستخرجة عبر البروكسي", text: text.slice(0, 10000) };
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

// Client-side direct Gemini generation if server times out or returns 500
export async function runClientGeminiScriptGeneration(params: {
  geminiKey: string;
  storyText: string;
  storyTitle?: string;
  targetScenes: number;
  targetDurationMinutes: number;
  videoRatioPercent: number;
  storyLanguage: "ar" | "en";
  style: string;
}): Promise<any> {
  const isEnglish = params.storyLanguage === "en";
  const durationMin = params.targetDurationMinutes || 15;
  const scenesCount = params.targetScenes || 15;
  const targetVideoScenesCount = Math.max(1, Math.round((scenesCount * Math.max(10, params.videoRatioPercent)) / 100));

  const prompt = `
أنت مخرج وثائقي ومسؤول مونتاج أول (Lead Documentary Editor & Pacing Director).
حول أحداث القصة المعطاة إلى جدول تسلسل سينمائي دقيق متطابق سمعياً وبصرياً عبر ${scenesCount} مشهداً بإجمالي مدة تقديرية ${durationMin} دقيقة.

قواعد السيناريو:
1. حجم النص الصوتي: لكل مشهد بين 20 إلى 35 كلمة صوتية ${isEnglish ? "باللغة الإنجليزية الدرامية" : "بالفصحى المشوقة الغامضة"}.
2. التطابق السمعي-البصري الكامل: عناصر المشهد الصوتي هي ذاتها حصراً المصورة في البرومبت.
3. التوزيع الحركي: خصص ${targetVideoScenesCount} مشهداً لتكون فيديو حركي (media_type: "video") مع "motion_prompt" سينمائي لحركة الكاميرا. باقي المشاهد (media_type: "image") صور 4K فائقة الدقة.
4. المشهد 1 دائماً فيديو حركي (Hook)، والمشهد الأخير فيديو أو صورة خاتمة مؤثرة.

نص القصة:
${params.storyText.slice(0, 5000)}

التنسيق الإجباري (JSON فقط):
{
  "title": "${isEnglish ? "Engaging Mystery Title" : "عنوان غامض وجذاب لليوتيوب بالعربية"}",
  "description": "${isEnglish ? "YouTube description with chapters" : "وصف تفصيلي للفيديو لليوتيوب"}",
  "thumbnail_prompt": "Cinematic YouTube thumbnail, extreme facial tension, photorealistic, 8k, dramatic chiaroscuro lighting, 16:9",
  "thumbnail_text": "${isEnglish ? "Shocking Mystery" : "اللغز المحيّر"}",
  "language": "${params.storyLanguage}",
  "estimatedMinutes": ${durationMin},
  "totalScenes": ${scenesCount},
  "videoScenesCount": ${targetVideoScenesCount},
  "scenes": [
    {
      "scene_number": 1,
      "media_type": "video",
      "voiceover_arabic": "نص الإلقاء الصوتي بين 20 و35 كلمة بالفصحى الغامضة.",
      "image_prompt": "Cinematic photorealistic 8k scene, dramatic lighting, 16:9",
      "motion_prompt": "Slow tracking forward camera motion, suspenseful atmosphere"
    }
  ]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(params.geminiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`خطأ استجابة Gemini (${response.status}): ${errText.slice(0, 150)}`);
  }

  const jsonResult = await response.json();
  const textOutput = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error("لم يُرجع نموذج Gemini أي محتوى نصي.");
  }

  const cleanJson = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsedData = JSON.parse(cleanJson);

  // Generate thumbnail data URL
  const promptEncoded = encodeURIComponent(parsedData.thumbnail_prompt || "mystery story documentary 8k");
  const thumbnailUrl = `https://image.pollinations.ai/prompt/${promptEncoded}?width=1280&height=720&nologo=true`;

  const rawScenes = Array.isArray(parsedData.scenes) ? parsedData.scenes : [];
  const scenes = rawScenes.map((sc: any, idx: number) => ({
    scene_id: sc.scene_id || sc.scene_number || idx + 1,
    scene_number: sc.scene_number || sc.scene_id || idx + 1,
    narrative_stage: sc.narrative_stage || `المشهد ${idx + 1}`,
    title: sc.title || `المشهد ${idx + 1}`,
    voiceover: sc.voiceover || sc.voiceover_arabic || sc.narration || "",
    narration: sc.voiceover || sc.voiceover_arabic || sc.narration || "",
    image_prompt: sc.image_prompt || "",
    media_type: sc.media_type === "video" ? ("video" as const) : ("image" as const),
    motion_prompt: sc.motion_prompt || (sc.media_type === "video" ? "Slow cinematic camera push-in" : "None"),
    visual_description: sc.visual_description || sc.image_prompt || "",
    duration: `${Math.round((durationMin * 60) / scenesCount)} ثانية`,
  }));

  return {
    title: parsedData.title || params.storyTitle || "قصة وثائقية سينمائية",
    description: parsedData.description || "",
    thumbnail_prompt: parsedData.thumbnail_prompt || "",
    thumbnail_text: parsedData.thumbnail_text || "",
    generatedThumbnailUrl: thumbnailUrl,
    scenes,
    estimatedMinutes: durationMin,
    totalScenes: scenesCount,
    videoScenesCount: targetVideoScenesCount,
    sourceTextPreview: params.storyText.slice(0, 200) + "...",
  };
}
