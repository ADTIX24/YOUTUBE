export interface ArtStyleOption {
  id: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  tagAr: string;
  tagEn: string;
  category: "kids" | "cinematic" | "art" | "dark";
  sampleImage: string;
  promptSignature: string;
}

export interface NarrationStyleOption {
  id: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  tagAr: string;
  tagEn: string;
}

export interface CameraMotionOption {
  id: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  tagAr?: string;
}

export interface AiStoryPreset {
  title: string;
  details: string;
  artStyle: string;
  narrationStyle: string;
  aspectRatio: "16:9" | "9:16";
  duration: number;
}

export const ART_STYLES: ArtStyleOption[] = [
  // --- Kids & Family Styles ---
  {
    id: "رسوم 3D للأطفال (بيكسار وديزني)",
    labelAr: "رسوم 3D للأطفال (بيكسار وديزني)",
    labelEn: "Kids 3D Pixar & Disney Style",
    descAr: "شخصيات كرتونية معبرة، ألوان زاهية ومبهجة، إضاءة دافئة ناعمة ثلاثية الأبعاد للأطفال",
    descEn: "Cute expressive characters, vibrant cheerful palette, whimsical lighting, Disney/Pixar 3D animation",
    icon: "🧸",
    tagAr: "مخصص للأطفال",
    tagEn: "Kids & Family",
    category: "kids",
    sampleImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    promptSignature: "3D Disney Pixar cute animated character, magical colorful lighting, vibrant cheerful atmosphere, friendly expressive face, ultra high quality 3D render for children",
  },
  {
    id: "حكايات أطفال مائية (قصص مصورة)",
    labelAr: "حكايات أطفال مائية (قصص مصورة)",
    labelEn: "Classic Storybook Watercolor",
    descAr: "رسم كتب الأطفال الكلاسيكية، ألوان مائية دافئة وناعمة، إحساس قصص ما قبل النوم والحكايات الخرافية",
    descEn: "Classic fairytale storybook illustration, delicate pastel watercolor, cozy bedtime tale aesthetic",
    icon: "📖",
    tagAr: "قصص أطفال هادئة",
    tagEn: "Bedtime Story",
    category: "kids",
    sampleImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Classic children storybook illustration, delicate watercolor and colored pencil, whimsical fairytale aesthetic, soft pastel colors, cozy bedtime story drawing",
  },
  {
    id: "أنمي سحري لطيف (ستوديو غيبلي)",
    labelAr: "أنمي سحري لطيف (ستوديو غيبلي)",
    labelEn: "Cute Ghibli Magical Anime",
    descAr: "عوالم خيالية ساحرة، مخلوقات لطيفة، سماء زرقاء وطبيعة غناء مشمسة بأسلوب أنمي الأطفال المحبوب",
    descEn: "Studio Ghibli inspired anime for children, cute friendly creatures, lush vibrant cheerful nature",
    icon: "✨",
    tagAr: "أنمي سحري للأطفال",
    tagEn: "Magical Anime",
    category: "kids",
    sampleImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Studio Ghibli aesthetic anime for kids, cute friendly characters, lush magical nature, sun-drenched enchanted forest, heartwarming fairytale anime",
  },
  {
    id: "كرتون مرح ملون (2D Cartoon)",
    labelAr: "كرتون مرح ملون (2D Cartoon)",
    labelEn: "Vibrant 2D Kids Cartoon",
    descAr: "رسوم متحركة كلاسيكية، خطوط واضحة عريضة، شخصيات كرتونية جذابة وحركات مضحكة ومغامرات مرحة",
    descEn: "Vibrant Saturday morning 2D cartoon, bold outlines, playful cheerful expression, joyful colorful palette",
    icon: "🎨",
    tagAr: "كرتون مرح",
    tagEn: "2D Adventure",
    category: "kids",
    sampleImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Vibrant Saturday morning 2D cartoon animation style for children, bold colorful outlines, cheerful playful characters, joyful bright colors",
  },

  // --- Cinematic & Realistic Styles ---
  {
    id: "سينمائي واقعي خارق 8K",
    labelAr: "سينمائي واقعي خارق 8K",
    labelEn: "Cinematic Hyper-Realistic 8K",
    descAr: "إضاءة تشياروسكورو درامية، مظهر فيلمي 35mm، دقة تفاصيل فوتوغرافية فائقة الواقعية",
    descEn: "Chiaroscuro lighting, 35mm film grain, hyper-detailed photorealistic texture",
    icon: "🎬",
    tagAr: "الأكثر طلباً",
    tagEn: "Most Popular",
    category: "cinematic",
    sampleImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Cinematic 8K, photorealistic, 35mm film texture, chiaroscuro lighting, masterwork depth of field",
  },
  {
    id: "غموض دارك نوار وظلال",
    labelAr: "غموض دارك نوار وظلال",
    labelEn: "Dark Atmospheric Noir",
    descAr: "أجواء ليلية ممطرة، تباين عالي بالأبيض والأسود والظلال الحادة، دخان وأزقة مظلمة",
    descEn: "Rain-slicked night streets, deep atmospheric shadows, smoky noir mood, high contrast",
    icon: "🌑",
    tagAr: "غموض وجريمة",
    tagEn: "Crime & Suspense",
    category: "dark",
    sampleImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Dark atmospheric film noir, deep heavy shadows, rain slicked cobblestones, dense fog, moody chiaroscuro",
  },
  {
    id: "لوحة زيتية كلاسيكية باروك",
    labelAr: "لوحة زيتية كلاسيكية (باروك)",
    labelEn: "Classical Baroque Oil Painting",
    descAr: "ضربات فرشاة فنية راقية كلوحات كارافاجيو ورامبرانت، ألوان دافئة وضوء شموع أثري",
    descEn: "Rembrandt and Caravaggio oil painting, warm candlelight, rich brush texture, museum historic aura",
    icon: "🏛️",
    tagAr: "تاريخي وأثري",
    tagEn: "Historical Art",
    category: "art",
    sampleImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Baroque oil painting style, Rembrandt lighting, rich canvas texture, classical masterpiece, dramatic warm glows",
  },
  {
    id: "أرشيفي وثائقي عتيق 1920",
    labelAr: "أرشيفي وثائقي عتيق 1920",
    labelEn: "Vintage 1920s Archival Film",
    descAr: "حبيبات فيلم قديمة (Film Grain)، نغمات السيبيا والرمادي، لقطات توثيقية كأنها وثائق أرشيفية نادرة",
    descEn: "Authentic aged film grain, sepia and monochrome tints, vintage 1920s historical footage look",
    icon: "📜",
    tagAr: "توثيق واقعي",
    tagEn: "Archival History",
    category: "cinematic",
    sampleImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Vintage 1920s archival documentary film footage, heavy authentic film grain, sepia tones, aged daguerreotype textures",
  },
  {
    id: "رعب سايكولوجي وتوتري",
    labelAr: "رعب سايكولوجي وتوتري",
    labelEn: "Psychological Horror & Tension",
    descAr: "زوايا تصوير مائلة، ألوان باردة ومقبضة، إضاءة كابوسية تثير القلق والرهبة من المجهول",
    descEn: "Dutch tilt angles, cold desaturated eerie palette, psychological dread, uncanny nightmarish mood",
    icon: "🩸",
    tagAr: "رعب نفسي",
    tagEn: "Psychological Dread",
    category: "dark",
    sampleImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Psychological horror cinematic shot, uncanny tension, desaturated cold colors, ominous backlight, dread atmosphere",
  },
  {
    id: "خيال علمي وسايبربانك كوني",
    labelAr: "خيال علمي وسايبربانك كوني",
    labelEn: "Sci-Fi Cyberpunk & Cosmic",
    descAr: "أضواء نيون زرقاء وحمراء، مدن مستقبلية، أجرام فضائية وأسرار كونية غامضة",
    descEn: "Neon reflections, cyberpunk architecture, cosmic nebula voids, mysterious futuristic sci-fi",
    icon: "🌌",
    tagAr: "مستقبلي وفضائي",
    tagEn: "Futuristic & Sci-Fi",
    category: "cinematic",
    sampleImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
    promptSignature: "Sci-fi mystery cinematic, subtle neon accents, futuristic technological ambiance, cosmic dust, anamorphic widescreen",
  },
];

export const NARRATION_STYLES: NarrationStyleOption[] = [
  {
    id: "قصة أطفال دافئة ومشوقة (مرحة ومغامرات)",
    labelAr: "قصة أطفال دافئة ومرحة (للصغار)",
    labelEn: "Warm & Playful Children Storytelling",
    descAr: "نبرة ودودة ومرحة، مؤثرات صوتية تخيلية، تشويق لطيف ومناسب لعقول ومشاعر الأطفال",
    descEn: "Friendly, warm, expressive narration crafted specially for bedtime and kids adventures",
    icon: "🧸",
    tagAr: "مخصص للأطفال",
    tagEn: "Kids Story",
  },
  {
    id: "غموض سينمائي وتشويق حابس للأنفاس",
    labelAr: "غموض سينمائي حابس للأنفاس",
    labelEn: "Cinematic Mystery & Suspense",
    descAr: "وتيرة درامية متصاعدة، أسئلة معلقة، لغة حماسية تدفع المشاهد لمتابعة كل ثانية",
    descEn: "Rising dramatic tension, cliffhangers, high-stakes hook designed for viral retention",
    icon: "🕯️",
    tagAr: "الأعلى انتشاراً",
    tagEn: "High Retention",
  },
  {
    id: "وثائقي استقصائي تحليلي (True Crime & Mystery)",
    labelAr: "وثائقي استقصائي تحليلي",
    labelEn: "Investigative & Forensic Documentary",
    descAr: "سرد هادئ، رصين، تشريح منهجي للأدلة والشهادات بنبرة تحقيق جنائي احترافي",
    descEn: "Calm, objective, forensic examination of clues and testimonies with investigative weight",
    icon: "🕵️",
    tagAr: "تحقيق جنائي",
    tagEn: "True Crime",
  },
  {
    id: "رعب نفسي وبناء توتر تدريجي",
    labelAr: "رعب نفسي وبناء توتر تدريجي",
    labelEn: "Psychological Horror & Dread",
    descAr: "همسات سردية، تفاصيل غامضة ومخيفة، تصاعد الخوف والارتياب من المجهول الساحق",
    descEn: "Eerie narrative whispers, unsettling details, escalating terror of the unseen",
    icon: "💀",
    tagAr: "مرعب ومؤثر",
    tagEn: "Chilling Dread",
  },
  {
    id: "ملحمي تاريخي وثائقي",
    labelAr: "ملحمي تاريخي وثائقي",
    labelEn: "Epic Historical Chronicle",
    descAr: "لغة فصحى جزلة وقورة، استعراض الوقائع والصراعات كملحمة كبرى عبر العصور",
    descEn: "Monumental, stately prose treating lore and historical collisions as grand epics",
    icon: "⚔️",
    tagAr: "فصيح ووقور",
    tagEn: "Grand Classical",
  },
  {
    id: "فلسفي عميق وتأملي سريالي",
    labelAr: "فلسفي عميق وسريالي",
    labelEn: "Mind-Bending Philosophical",
    descAr: "استكشاف أسرار الوجود والزمن والكون والمفارقات العقلية والنفس البشرية المعقدة",
    descEn: "Deep exploration of time paradoxes, existential enigmas, and labyrinthine human psychology",
    icon: "🧠",
    tagAr: "عميق وتأملي",
    tagEn: "Thought Provoking",
  },
  {
    id: "إثارة وتشويق سريع الوتيرة",
    labelAr: "إثارة وتشويق سريع الوتيرة",
    labelEn: "High-Stakes Fast Action Thriller",
    descAr: "جمل مكثفة، إيقاع متسارع، نبضات قلب عالية وتتابع خاطف للمفاجآت والصدمات",
    descEn: "Punchy rhythmic delivery, relentless pacing, adrenaline bursts and quick plot twists",
    icon: "⚡",
    tagAr: "إيقاع سريع",
    tagEn: "Fast Paced",
  },
];

export const CAMERA_MOTIONS: CameraMotionOption[] = [
  {
    id: "slow_push_in",
    labelAr: "تقريب سينمائي تدريجي (Slow Push-In)",
    labelEn: "Slow Cinematic Push-In",
    descAr: "تقريب بطيء ثابت للكاميرا نحو الشخصية أو التفصيل الغامض لبناء الترقب والرهبة",
    descEn: "Slow, steady push-in building solemnity, intimacy, and tension",
    icon: "🔍",
    tagAr: "تركيز وتشويق",
  },
  {
    id: "slow_pull_out",
    labelAr: "ابتعاد تدريجي لكشف المشهد (Slow Pull-Out)",
    labelEn: "Slow Pull-Out & Reveal",
    descAr: "تراجع بطيء للكاميرا يكشف اتساع المكان، العزلة، أو ظهور خطر غير متوقع في الكادر",
    descEn: "Smooth backwards movement revealing isolation, massive environments, and surprises",
    icon: "⏪",
    tagAr: "كشف المفاجأة",
  },
  {
    id: "cinematic_pan",
    labelAr: "مسح أفقي بانورامي (Cinematic Pan Left/Right)",
    labelEn: "Cinematic Horizontal Pan",
    descAr: "حركة أفقية بطيئة وسلسة تستعرض المكان وتفاصيل البيئة المحيطة والآثار",
    descEn: "Smooth sweeping horizontal pan across landscapes and dramatic interiors",
    icon: "↔️",
    tagAr: "بانورامي عريض",
  },
  {
    id: "dolly_tracking",
    labelAr: "تتبع جانبي موازٍ (Dolly / Tracking Shot)",
    labelEn: "Dolly Lateral Tracking",
    descAr: "تحرك الكاميرا على مسار موازٍ لمواكبة خطوات الشخصيات ومطارداتهم وسير الأحداث",
    descEn: "Parallel tracking alongside moving characters, creating continuous cinematic momentum",
    icon: "🎥",
    tagAr: "مواكبة الحركة",
  },
  {
    id: "drone_aerial",
    labelAr: "تحليق جوي درامي (FPV Drone & Aerial Sweeps)",
    labelEn: "Epic Drone & Aerial Sweeps",
    descAr: "لقطات تحليق عالية ومسح واسع للموقع والطبيعة المعزولة والمباني والمدن الشاهقة",
    descEn: "High altitude vistas establishing isolated landscapes and vast mystery ruins",
    icon: "🛸",
    tagAr: "لقطات شاهقة",
  },
  {
    id: "dynamic_handheld",
    labelAr: "حركة يدوية مضطربة (Dynamic Handheld & Shaky Cam)",
    labelEn: "Dynamic Handheld & Kinetic",
    descAr: "اهتزازات واقعية حية تعكس الذعر، الملاحقة، الارتباك، واللحظات الحرجة الطارئة",
    descEn: "Live kinetic camera motion capturing panic, chaos, pursuits, and critical suspense",
    icon: "⚡",
    tagAr: "واقعي وتوتري",
  },
  {
    id: "crane_pedestal",
    labelAr: "صعود وهبوط رأسي رافع (Crane & Jib Shot)",
    labelEn: "Crane & Pedestal Up/Down",
    descAr: "حركة رأسية من مستوى الأرض صعوداً نحو السماء أو العكس لكشف أبعاد المشهد",
    descEn: "Dramatic vertical crane rising from ground level into the sky or descending slowly",
    icon: "🏗️",
    tagAr: "حركة رأسية",
  },
  {
    id: "orbit_360",
    labelAr: "دوران حلزوني 360 درجة (360° Orbit & Arc Shot)",
    labelEn: "360° Orbit Arc Shot",
    descAr: "دوران الكاميرا الدائري الكامل حول الشخصية في لحظة الصدمة أو اتخاذ القرار المصيري",
    descEn: "Circular orbit around the subject during shock, revelation, or dramatic climax",
    icon: "🔄",
    tagAr: "دوران سينمائي",
  },
  {
    id: "dutch_angle",
    labelAr: "زاوية مائلة مشدودة (Dutch Angle & Tilted Tension)",
    labelEn: "Dutch Angle & Tilted Tension",
    descAr: "إمالة زاوية الكاميرا أفقياً لإشعار المشاهد بعدم الاتزان والريبة والخطر الوشيك",
    descEn: "Canted camera horizon inducing psychological unease, imbalance, and rising dread",
    icon: "📐",
    tagAr: "إثارة نفسية",
  },
  {
    id: "rack_focus",
    labelAr: "انتقال بؤري حاد (Rack Focus & Depth Shift)",
    labelEn: "Rack Focus & Depth Shift",
    descAr: "تحويل التركيز البصري فجأة من الخلفية الضبابية إلى تفصيل أمامي صادم (مثل يد أو سلاح)",
    descEn: "Shifting optical focus sharply between foreground clue and background action",
    icon: "🎯",
    tagAr: "كشف التفاصيل",
  },
  {
    id: "smooth_glidecam",
    labelAr: "انزلاق عائم فائق النعومة (Steadicam Glide)",
    labelEn: "Smooth Steadicam Glide",
    descAr: "حركة انزلاقية عائمة وسلسة تخترق الممرات الضيقة وتتجاوز الأبواب كعين خفية تترصد",
    descEn: "Floating steadicam glide traveling seamlessly through corridors and forest paths",
    icon: "🕊️",
    tagAr: "انسيابي عائم",
  },
  {
    id: "crash_zoom",
    labelAr: "اندفاع زووم خاطف وسريع (Crash Zoom & Whip Pan)",
    labelEn: "Crash Zoom & Whip Pan",
    descAr: "اندفاع بصري مفاجئ وخاطف نحو عيني الشخصية أو دليل جريمة عند وقوع صدمة كبرى",
    descEn: "Aggressive snap zoom into an unexpected clue or facial shock, sudden adrenaline pulse",
    icon: "💥",
    tagAr: "صدمة بصرية خاطفة",
  },
];

export const AI_STORY_IDEAS: AiStoryPreset[] = [
  {
    title: "لغز اختفاء حراس منارة إيلين مور عام 1900",
    details: "ثلاثة حراس اختفوا فجأة من جزيرة صخرية معزولة في اسكتلندا، تاركين وجبة طعام نصف مأكولة وساعة حائط متوقفة وسجلاً يصف عاصفة لم يشهدها أحد.",
    artStyle: "غموض دارك نوار وظلال",
    narrationStyle: "وثائقي استقصائي تحليلي (True Crime & Mystery)",
    aspectRatio: "16:9",
    duration: 15,
  },
  {
    title: "سفينة ماري سيليست: شبح المحيط الأطلسي العائم",
    details: "العثور على سفينة شراعية تبحر بكامل شراعها ومؤنها سليمة في وسط المحيط الأطلسي دون وجود أي فرد من طاقمها ولا قوارب النجاة ولا آثار عنف.",
    artStyle: "سينمائي واقعي خارق 8K",
    narrationStyle: "غموض سينمائي وتشويق حابس للأنفاس",
    aspectRatio: "16:9",
    duration: 20,
  },
  {
    title: "حادثة ممر دياتلوف: لغز المتزلجين التسعة في جبال الأورال",
    details: "تسعة متزلجين سوفييت مزقوا خيمتهم من الداخل وهربوا حفاة في صقيع 30 تحت الصفر ليموتوا في ظروف غامضة، مع إصابات داخلية لا يمكن إحداثها بقوة بشرية.",
    artStyle: "رعب سايكولوجي وتوتري",
    narrationStyle: "رعب نفسي وبناء توتر تدريجي",
    aspectRatio: "16:9",
    duration: 18,
  },
  {
    title: "سر مدينة الذهب المفقودة في أعماق غابات الأمازون",
    details: "اكتشاف أطلال معابد حجرية عملاقة ونقوش فلكية معقدة مدفونة تحت الغطاء النباتي لا تنتمي لأي من حضارات الإنكا أو المايا المعروفة.",
    artStyle: "لوحة زيتية كلاسيكية باروك",
    narrationStyle: "ملحمي تاريخي وثائقي",
    aspectRatio: "16:9",
    duration: 15,
  },
  {
    title: "المسافر الغامض من كوكب تاوريد في مطار طوكيو",
    details: "رجل وصل مطار طوكيو يحمل جواز سفر رسمي من دولة لا وجود لها في التاريخ، وعند احتجازه في غرفة فندقية محاطة بالحراسة تبخر تماماً دون أثر.",
    artStyle: "خيال علمي وسايبربانك كوني",
    narrationStyle: "فلسفي عميق وتأملي سريالي",
    aspectRatio: "9:16",
    duration: 10,
  },
  {
    title: "جريمة القصر الإنجليزي المغلق عام 1924",
    details: "العثور على لورد إنجليزي مقتولاً داخل مكتبه المغلق بمزلاج من الداخل دون نافذة مفتوحة، بينما عائلته تحتفل في القاعة الرئيسية بالأسفل.",
    artStyle: "أرشيفي وثائقي عتيق 1920",
    narrationStyle: "وثائقي استقصائي تحليلي (True Crime & Mystery)",
    aspectRatio: "16:9",
    duration: 15,
  },
];
