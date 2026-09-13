export interface CharacterTransformation {
  original: string;
  adapted: string;
  role: string;
}

export interface StoryScene {
  scene_number: number;
  title: string;
  narration: string;
  visual_description: string;
  image_prompt: string;
  duration?: string;
  generatedImageUrl?: string;
  generatedAudioUrl?: string;
}

export interface StoryResult {
  title: string;
  logline: string;
  originalTitleDetected?: string;
  language?: "ar" | "en";
  estimatedMinutes?: number;
  style?: string;
  characterTransformations?: CharacterTransformation[];
  scenes: StoryScene[];
  thumbnailPrompt?: string;
  thumbnailDescription?: string;
  generatedThumbnailUrl?: string;
  youtubeTags?: string[];
  closingCallToAction?: string;
  rawStory?: string;
}

export interface YouTubeChannelConfig {
  id: string;
  name: string;
  language: "ar" | "en";
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  channelId?: string;
  autoUpload: boolean;
  privacyStatus: "private" | "unlisted" | "public";
}

export interface AgentRunResponse {
  success: boolean;
  result?: StoryResult;
  rawOutput?: string;
  telegramStatus?: {
    sent: boolean;
    message?: string;
  } | null;
  youtubeStatus?: {
    uploaded: boolean;
    channelName?: string;
    videoUrl?: string;
    message?: string;
  } | null;
  error?: string;
  sourceLength?: number;
}

export interface VercelFile {
  name: string;
  path: string;
  lang: string;
  content: string;
  description: string;
}

