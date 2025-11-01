export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  biography: string;
  profile_pic_url: string;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_private: boolean;
  is_verified: boolean;
  external_url?: string;
}

export interface MediaImageVersion {
    url: string;
    width: number;
    height: number;
}

export interface MediaItem {
  id: string;
  pk: string;
  code: string;
  user: {
    username: string;
    pk: string;
    profile_pic_url: string;
  };
  image_versions2?: {
      candidates: MediaImageVersion[];
  };
  video_versions?: { url: string }[];
  caption: {
    text: string;
  } | null;
  like_count?: number;
  comment_count?: number;
  play_count?: number;
  view_count?: number;
  taken_at: number;
  media_type: number; // 1 for Photo, 2 for Video, 8 for Carousel
}

export interface Hashtag {
    id: string;
    name: string;
    media_count: number;
}

// Types for the Competitor Analysis feature
export interface CompetitorProfileAnalysis {
    username: string;
    strengths: string[];
    weaknesses: string[];
    content_themes: string[];
}

export interface CompetitorReport {
    summary: string;
    profiles: CompetitorProfileAnalysis[];
}

// Types for the Best Time to Post feature
export interface HeatmapDataPoint {
    day: number; // 0 for Sunday, 6 for Saturday
    hour: number; // 0-23
    engagementScore: number; // 0-100
}

export interface BestTimeToPostReport {
    heatmapData: HeatmapDataPoint[];
    recommendations: string[];
}

// Types for the Influencer Discovery feature
export interface DiscoveredUser {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  follower_count: number;
  is_verified: boolean;
}

// Types for AI Hashtag Generator
export interface HashtagGroups {
    niche: string[];
    broad: string[];
    community: string[];
}

// Types for Post Performance Analysis
export interface PostPerformanceReport {
    what_is_working: string[];
    suggestions: string[];
}

// Types for AI Collab Matcher
export interface CollabAnalysisReport {
    compatibility_score: number; // A score from 0 to 100
    match_verdict: string; // e.g., "Excellent Match", "Good Fit", "Potential Mismatch"
    analysis_points: string[]; // Key reasons for the verdict
    collaboration_ideas: string[]; // Actionable, creative ideas for a collaboration
}

// Types for AI Hook Analyser
export interface HookAnalysisReport {
    hook_score: number; // A score from 0 to 100
    verdict: string; // e.g., "Strong Hook", "Good Start", "Needs Improvement"
    analysis: string; // A brief explanation for the score and verdict
    suggestions: string[]; // 2-3 alternative hook suggestions
    alternative_styles: string[]; // Top 3 alternative hook styles to try
}

// Types for AI Post Idea Generator
export interface PostIdea {
    id: string;
    ideaTitle: string;
    caption: string;
    hashtags: string[];
}

export interface ScheduledPost extends PostIdea {
    scheduledAt: string; // ISO date string
}