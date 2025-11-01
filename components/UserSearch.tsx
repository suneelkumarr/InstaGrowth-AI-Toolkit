import React, { useState, useCallback } from 'react';
import { UserProfile, MediaItem } from '../types';
import * as instagramService from '../services/instagramService';
import * as geminiService from '../services/geminiService';
import { SearchIcon, SparklesIcon, TagIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';
import UserProfileCard from './common/UserProfileCard';
import MediaGrid from './common/MediaGrid';
import Tooltip from './common/Tooltip';

type MediaTab = 'posts' | 'reels' | 'tagged';

const AIAnalysisDisplay: React.FC<{ analysis: any; engagementRate: number }> = ({ analysis, engagementRate }) => {
    const renderList = (items: string[]) => (
        <ul className="list-disc list-inside space-y-2 text-gray-300">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    );

    const HashtagCategory: React.FC<{ title: string; tags: string[]; icon: string; }> = ({ title, tags, icon }) => (
        <div className="bg-gray-900/40 p-4 rounded-lg">
            <h5 className="font-semibold text-indigo-300 mb-2">{icon} {title}</h5>
            <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 text-indigo-300 text-xs font-mono rounded">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-indigo-400" />
                AI Growth Analysis
            </h3>
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg text-center">
                <Tooltip text="Average likes and comments on recent posts, divided by the total number of followers.">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Recent Post Engagement Rate</p>
                        <p className="text-3xl font-bold text-indigo-400">{engagementRate.toFixed(2)}%</p>
                    </div>
                </Tooltip>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 className="font-semibold text-lg text-indigo-400 mb-2">Profile Optimization</h4>
                    {renderList(analysis.profileOptimization)}
                </div>
                <div>
                    <h4 className="font-semibold text-lg text-indigo-400 mb-2">Content Strategy</h4>
                    {renderList(analysis.contentStrategy)}
                </div>
            </div>

            {analysis.suggestedHashtags && (
                <div>
                    <h4 className="font-semibold text-lg text-indigo-400 mb-3 flex items-center gap-2">
                        <TagIcon className="w-5 h-5" />
                        AI Hashtag Suggestions
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        <HashtagCategory title="Niche Specific" tags={analysis.suggestedHashtags.niche || []} icon="🎯" />
                        <HashtagCategory title="Broad Reach" tags={analysis.suggestedHashtags.broad || []} icon="🚀" />
                        <HashtagCategory title="Community" tags={analysis.suggestedHashtags.community || []} icon="🤝" />
                    </div>
                </div>
            )}
        </div>
    );
};

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<MediaTab>('posts');
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [viewingMedia, setViewingMedia] = useState(false);
  const [engagementRate, setEngagementRate] = useState<number | null>(null);

  const fetchMedia = useCallback(async (userId: string, tab: MediaTab) => {
    setIsMediaLoading(true);
    setEngagementRate(null);
    try {
      let response;
      if (tab === 'posts') response = await instagramService.getUserMedia(userId);
      else if (tab === 'reels') response = await instagramService.getUserReels(userId);
      else if (tab === 'tagged') response = await instagramService.getTaggedMedia(userId);
      
      const items = response?.items || [];
      setMedia(items);

      // Calculate engagement rate for posts tab
      if (tab === 'posts' && profile && items.length > 0 && profile.follower_count) {
        const totalLikes = items.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
        const totalComments = items.reduce((sum, item) => sum + (item.comment_count ?? 0), 0);
        const avgInteractions = (totalLikes + totalComments) / items.length;
        const rate = (avgInteractions / profile.follower_count) * 100;
        setEngagementRate(rate);
      } else if (tab === 'posts') {
        setEngagementRate(0);
      }

    } catch (err) {
      setError('Failed to fetch media.');
      setMedia([]);
    } finally {
      setIsMediaLoading(false);
    }
  }, [profile]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    setError(null);
    setProfile(null);
    setMedia([]);
    setAnalysis(null);
    setViewingMedia(false);
    setEngagementRate(null);

    try {
      const user = await instagramService.searchUser(query);
       if (!user || !user.id) {
        setError('User not found or API returned invalid data.');
        return;
      }
      setProfile(user);
      setActiveTab('posts');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tab: MediaTab) => {
    if (profile && tab !== activeTab) {
      setActiveTab(tab);
      fetchMedia(profile.id, tab);
    }
  };
  
  const handleAnalyze = async () => {
    if (!profile) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      let mediaForAnalysis = media;

      // Prioritize fetching media using the 'user-feeds' endpoint if it hasn't been loaded yet.
      // This ensures the AI analysis has content to work with.
      if (mediaForAnalysis.length === 0) {
        setViewingMedia(true);
        setIsMediaLoading(true);
        try {
          const response = await instagramService.getUserMedia(profile.id);
          mediaForAnalysis = response?.items || [];
          setMedia(mediaForAnalysis);
        } finally {
          // Correctly manage the media-specific loading state.
          setIsMediaLoading(false);
        }
      }
      
      // Always calculate the engagement rate based on the media being analyzed.
      // This ensures the data is consistent, especially if media was just fetched
      // or if the user was on a different tab (e.g., Reels) before analyzing.
      if (profile.follower_count && mediaForAnalysis.length > 0) {
          const totalLikes = mediaForAnalysis.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
          const totalComments = mediaForAnalysis.reduce((sum, item) => sum + (item.comment_count ?? 0), 0);
          const avgInteractions = (totalLikes + totalComments) / mediaForAnalysis.length;
          const rate = (avgInteractions / profile.follower_count) * 100;
          setEngagementRate(rate);
      } else {
          setEngagementRate(0);
      }
      
      // Proceed with the AI analysis using the prepared media.
      const result = await geminiService.getProfileAnalysis(profile, mediaForAnalysis);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to generate AI analysis. Please check your Gemini API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleInitialMediaLoad = () => {
    if (profile) {
      setViewingMedia(true);
      fetchMedia(profile.id, 'posts');
    }
  };

  const TabButton = ({ tab, label, tooltipText }: { tab: MediaTab, label: string, tooltipText: string }) => (
    <Tooltip text={tooltipText}>
      <button
        onClick={() => handleTabClick(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        {label}
      </button>
    </Tooltip>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Instagram username..."
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
      </form>
      
      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {profile && (
        <div className="animate-fade-in space-y-6">
          <UserProfileCard profile={profile} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} engagementRate={engagementRate} />

          {analysis && engagementRate !== null && <AIAnalysisDisplay analysis={analysis} engagementRate={engagementRate} />}
          
          {!viewingMedia ? (
            <div className="text-center pt-4">
              <button
                onClick={handleInitialMediaLoad}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                View User's Media
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <TabButton tab="posts" label="Posts" tooltipText="View the user's photo and video posts" />
                <TabButton tab="reels" label="Reels" tooltipText="View the user's Reels" />
                <TabButton tab="tagged" label="Tagged" tooltipText="View posts the user is tagged in" />
              </div>
              {isMediaLoading ? <LoadingSpinner /> : <MediaGrid media={media} />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;