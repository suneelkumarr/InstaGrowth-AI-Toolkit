import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MediaItem, CompetitorReport, BestTimeToPostReport, HashtagGroups, PostPerformanceReport, CollabAnalysisReport, HookAnalysisReport } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd have a more robust way to handle this,
  // but for this environment we'll assume it's set.
  console.warn("Gemini API key not found in process.env.API_KEY. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        profileOptimization: {
            type: Type.ARRAY,
            description: "Actionable tips to improve the user's profile bio, name, and picture.",
            items: { type: Type.STRING }
        },
        contentStrategy: {
            type: Type.ARRAY,
            description: "Suggestions for content themes, pillars, and post formats.",
            items: { type: Type.STRING }
        },
        suggestedHashtags: {
            type: Type.OBJECT,
            description: "A list of suggested hashtags based on the profile's content and niche.",
            properties: {
                niche: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 very specific hashtags for the target audience." },
                broad: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 broader hashtags to increase reach." },
                community: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 community-focused hashtags." }
            },
            required: ['niche', 'broad', 'community']
        }
    }
};

export const getProfileAnalysis = async (profile: UserProfile, media: MediaItem[]): Promise<any> => {
    const recentCaptions = media.slice(0, 10).map(item => item.caption?.text || '').join('\n- ');
    const prompt = `
        Analyze the following Instagram profile for growth opportunities.
        
        **Profile Data:**
        - Username: @${profile.username}
        - Full Name: ${profile.full_name}
        - Bio: "${profile.biography}"
        - Followers: ${profile.follower_count}
        - Following: ${profile.following_count}
        - Posts: ${profile.media_count}
        
        **Recent Post Captions:**
        - ${recentCaptions}
        
        Based on this data, provide a detailed growth strategy covering profile optimization and content strategy. Give concise, actionable advice.
        
        Also, based on your analysis of the profile's niche and content, generate a strategic set of hashtags for this profile. You MUST provide three categories of hashtags: 'niche', 'broad', and 'community'.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate AI analysis.");
    }
};


const postIdeasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            ideaTitle: { type: Type.STRING, description: "A catchy title for the post idea." },
            caption: { type: Type.STRING, description: "A well-written, engaging caption for the post." },
            hashtags: { 
                type: Type.ARRAY, 
                description: "An array of 10-15 relevant hashtags.",
                items: { type: Type.STRING }
            }
        }
    }
};


export const generatePostIdeas = async (niche: string, numIdeas: number): Promise<any> => {
    const prompt = `
        I'm an Instagram content creator in the "${niche}" niche.
        Generate ${numIdeas} creative and engaging post ideas for me.
        For each idea, provide a compelling caption and a list of 10-15 relevant hashtags.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: postIdeasSchema,
            },
        });

        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate post ideas.");
    }
};

const competitorAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A high-level summary comparing all competitors and identifying the key strategic takeaway for the user."
        },
        profiles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    username: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 key strengths of this competitor's strategy." },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 potential weaknesses or opportunities to outperform them." },
                    content_themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The main content pillars or themes they focus on." }
                }
            }
        }
    }
};

export const getCompetitorAnalysis = async (
    profilesWithMedia: { profile: UserProfile, media: MediaItem[] }[]
): Promise<CompetitorReport> => {
    const competitorData = profilesWithMedia.map(({ profile, media }) => {
        const recentCaptions = media.slice(0, 5).map(item => item.caption?.text || '').join('\n  - ');
        return `
            **Competitor: @${profile.username}**
            - Bio: "${profile.biography}"
            - Followers: ${profile.follower_count}
            - Posts: ${profile.media_count}
            - Recent Post Captions:
              - ${recentCaptions || "No captions available."}
        `;
    }).join('\n');

    const prompt = `
        As an expert Instagram strategist, analyze the following competitor profiles.
        
        ${competitorData}

        Based on this data, provide a comparative analysis.
        1. Write a brief summary of the overall competitive landscape.
        2. For each competitor, identify their key strengths, weaknesses, and primary content themes.
        Be concise and strategic.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: competitorAnalysisSchema,
            },
        });

        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate competitor analysis.");
    }
};


const bestTimeToPostSchema = {
    type: Type.OBJECT,
    properties: {
        heatmapData: {
            type: Type.ARRAY,
            description: "Data for a 7x24 heatmap. Day is 0 (Sun) to 6 (Sat). Hour is 0 to 23 (UTC). Engagement score is from 0 (low) to 100 (high).",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER },
                    hour: { type: Type.NUMBER },
                    engagementScore: { type: Type.NUMBER }
                }
            }
        },
        recommendations: {
            type: Type.ARRAY,
            description: "3-5 actionable recommendations for the best posting times, including specific days and time slots.",
            items: { type: Type.STRING }
        }
    }
};

export const getBestTimeToPostAnalysis = async (media: MediaItem[]): Promise<BestTimeToPostReport> => {
    const postData = media.map(item => ({
        timestamp: item.taken_at,
        likes: item.like_count ?? 0,
        comments: item.comment_count ?? 0
    }));

    const prompt = `
        Analyze the following Instagram post data to determine the best times to post. The data consists of a list of posts, each with a Unix timestamp (UTC) and engagement metrics (likes, comments).
        
        Post Data:
        ${JSON.stringify(postData.slice(0, 50))} // Limit to 50 posts to keep prompt concise
        
        Based on this data:
        1. Create a 7x24 heatmap dataset. The week starts on Sunday (day 0). For each hour of each day, calculate a normalized engagement score from 0 (lowest) to 100 (highest). If there's no data for a slot, give it a low score.
        2. Provide a list of 3-5 clear, actionable recommendations for the best days and time windows to post for maximum engagement.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: bestTimeToPostSchema,
            },
        });

        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
// FIX: Added missing curly braces to the catch block
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate posting time analysis.");
    }
};

const hashtagGeneratorSchema = {
    type: Type.OBJECT,
    properties: {
        niche: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 very specific hashtags for the target audience." },
        broad: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 broader hashtags to increase reach." },
        community: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 community-focused hashtags (e.g., #creators, #communityname)." }
    }
};

export const generateHashtags = async (topic: string): Promise<HashtagGroups> => {
    const prompt = `
        As an Instagram hashtag expert, generate a strategic set of hashtags for a post about: "${topic}".
        
        Provide three categories of hashtags:
        1. Niche: Specific tags that directly relate to the topic.
        2. Broad: More general tags to reach a wider audience.
        3. Community: Tags that engage with a specific community on Instagram.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hashtagGeneratorSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate hashtags.");
    }
};


const postPerformanceSchema = {
    type: Type.OBJECT,
    properties: {
        what_is_working: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-4 bullet points identifying common themes or characteristics of the top-performing posts (e.g., 'Posts featuring faces get more likes', 'Questions in captions drive comments')."
        },
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 actionable suggestions for future content based on the analysis of top posts."
        }
    }
};

export const getPostPerformanceAnalysis = async (media: MediaItem[]): Promise<PostPerformanceReport> => {
    // Sort by engagement (likes + comments) and take the top 5
    const topPosts = [...media]
        .sort((a, b) => ((b.like_count ?? 0) + (b.comment_count ?? 0)) - ((a.like_count ?? 0) + (a.comment_count ?? 0)))
        .slice(0, 5);
    
    const topPostData = topPosts.map(p => ({
        caption: p.caption?.text.substring(0, 150) || "No caption",
        likes: p.like_count,
        comments: p.comment_count,
        media_type: p.media_type === 1 ? 'Photo' : p.media_type === 2 ? 'Video' : 'Carousel'
    }));

    const prompt = `
        Analyze this list of a user's top 5 performing Instagram posts.
        
        Top Posts Data:
        ${JSON.stringify(topPostData, null, 2)}
        
        Based on this data, identify patterns and provide strategic advice.
        1. What is working? Find common themes in these successful posts.
        2. Suggestions: Give actionable advice for future content.
        Be concise and helpful.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: postPerformanceSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze post performance.");
    }
};


const collabAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        compatibility_score: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 indicating how well these profiles would work together. 100 is a perfect match."
        },
        match_verdict: {
            type: Type.STRING,
            description: "A short, clear verdict like 'Excellent Match', 'Good Fit', or 'Potential Mismatch'."
        },
        analysis_points: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-4 bullet points explaining the reasoning behind the score, considering audience overlap, content synergy, and brand alignment."
        },
        collaboration_ideas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 creative, actionable collaboration ideas tailored to these two specific accounts."
        }
    }
};

export const getCollabAnalysis = async (profile1: UserProfile, profile2: UserProfile): Promise<CollabAnalysisReport> => {
    const prompt = `
        As an expert influencer marketing strategist, analyze the collaboration potential between these two Instagram profiles.

        **Profile 1: @${profile1.username}**
        - Followers: ${profile1.follower_count}
        - Bio: "${profile1.biography}"
        - Content Niche (Implied): Focuses on topics related to their bio and name.

        **Profile 2: @${profile2.username}**
        - Followers: ${profile2.follower_count}
        - Bio: "${profile2.biography}"
        - Content Niche (Implied): Focuses on topics related to their bio and name.

        Based on this data, provide a detailed collaboration analysis. Consider their potential audience overlap, content synergy, and brand alignment.
        1.  **Compatibility Score:** A numerical score from 0-100.
        2.  **Match Verdict:** A short, clear summary.
        3.  **Analysis Points:** Key reasons for your verdict.
        4.  **Collaboration Ideas:** Specific, creative ideas for how they could collaborate effectively.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: collabAnalysisSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate collaboration analysis.");
    }
};

const hookAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        hook_score: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 on how effective the hook is at capturing attention."
        },
        verdict: {
            type: Type.STRING,
            description: "A short, clear verdict like 'Strong Hook', 'Good Start', or 'Needs Improvement'."
        },
        analysis: {
            type: Type.STRING,
            description: "A brief explanation for the score, highlighting what works and what doesn't."
        },
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 alternative hook suggestions to improve the original."
        },
        alternative_styles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the top 3 most suitable alternative hook styles from the provided list, based on the hook's implied topic."
        }
    }
};

export const getHookAnalysis = async (text: string): Promise<HookAnalysisReport> => {
    const hookStyles = [
        'Curiosity Gap', 'Bold Statement', 'Question', 'Storytelling',
        'Problem/Solution', 'Relatable', 'Educational', 'Cliffhanger',
        'Humorous', 'Surprising Fact', 'Direct Call to Action'
    ].join(', ');

    const prompt = `
        Analyze the following 'hook' from an Instagram post or Reel. A hook is the first sentence or two designed to grab the reader's attention.
        
        **Hook to Analyze:**
        "${text}"
        
        As an expert social media copywriter, evaluate its effectiveness. Consider clarity, curiosity, emotion, and its ability to make someone stop scrolling.
        
        Provide your analysis based on the schema. The score should reflect its potential to engage a broad audience on platforms like Instagram or TikTok.

        Additionally, based on the analyzed hook's implied topic and goal, suggest the top 3 most suitable alternative hook styles from the following list that would offer a different creative approach: ${hookStyles}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hookAnalysisSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate hook analysis.");
    }
};


const hookCreatorSchema = {
    type: Type.OBJECT,
    properties: {
        hooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 5-7 catchy, engaging hooks."
        }
    }
};


export const generateHooks = async (topic: string, style: string): Promise<string[]> => {
    const prompt = `
        As an expert social media copywriter, generate 5-7 viral hooks for an Instagram Reel or post about the following topic.
        
        **Topic:**
        "${topic}"
        
        **Desired Style:**
        "${style}"
        
        The hooks should be short, punchy, and designed to make people stop scrolling. They should be highly engaging and create curiosity.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hookCreatorSchema,
            },
        });
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        return result.hooks || [];
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate hooks.");
    }
};