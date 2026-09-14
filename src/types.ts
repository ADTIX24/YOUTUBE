export interface PlannedSceneCadence {
  scene_index: number;
  stage_name: string;
  media_type: "video" | "image";
  rationale: string;
  tension_level?: "low" | "medium" | "high" | "peak";
}

export interface StoryProposal {
  storyTitle: string;
  storySummary: string;
  genre: string;
  narrativeDensity: "light" | "medium" | "dense" | "epic";
  recommendedMinutes: number; // 5 to 40
  recommendedScenesCount: number;
  recommendedVideoScenesCount: number;
  recommendedImageScenesCount: number;
  retentionStrategy: string;
  cadenceMap: PlannedSceneCadence[];
  extractedTextPreview?: string;
  sourceUrl?: string;
  estimatedWords?: number;
}

export interface CharacterTransformation {
  original: string;
  adapted: string;
  role: string;
}

export interface StoryScene {
  scene_id: number;
  scene_number?: number;
  narrative_stage?: string;
  title?: string;
  voiceover: string;
  narration?: string;
  image_prompt: string;
  media_type: "image" | "video";
  motion_prompt?: string;
  visual_description?: string;
  duration?: string;
  // Generated Media
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  generatedAudioUrl?: string;
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
  isGeneratingAudio?: boolean;
  videoOperationName?: string;
}

export interface StoryResult {
  title: string;
  description?: string;
  logline?: string;
  thumbnail_prompt?: string;
  thumbnailPrompt?: string;
  thumbnail_text?: string;
  thumbnailDescription?: string;
  generatedThumbnailUrl?: string;
  originalTitleDetected?: string;
  language?: "ar" | "en";
  estimatedMinutes?: number;
  style?: string;
  characterTransformations?: CharacterTransformation[];
  scenes: StoryScene[];
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

export interface FacebookConfig {
  pageId: string;
  accessToken: string;
  pageName?: string;
  autoPostVideo: boolean;
}

export interface InstagramConfig {
  instagramAccountId: string;
  accessToken: string;
  accountUsername?: string;
  autoPostReel: boolean;
}

export interface McpServerConfig {
  id: string;
  name: string;
  serverUrl: string;
  authToken?: string;
  description?: string;
  status?: "connected" | "disconnected" | "testing";
  toolsCount?: number;
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
