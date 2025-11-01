import React, { useState, useMemo } from 'react';
import { UserProfile, MediaItem, PostPerformanceReport } from '../types';
import * as instagramService from '../services/instagramService';
import * as geminiService from '../services/geminiService';
import { SearchIcon, SparklesIcon, ChartBarIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

type SortKey = 'latest' | 'likes' | 'comments' | 'engagement';

const PostPerformance: React.FC = () => {
    const [query, setQuery] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [analysis, setAnalysis] = useState<PostPerformanceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('latest');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setProfile(null);
        setMedia([]);
        setAnalysis(null);

        try {
            const user = await instagramService.searchUser(query);
            if (!user || user.is_private) {
                setError('User not found or profile is private.');
                setIsLoading(false);
                return;
            }
            setProfile(user);
            const mediaResponse = await instagramService.getUserMedia(user.id);
            setMedia(mediaResponse?.items || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnalyze = async () => {
        if (!media || media.length === 0) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await geminiService.getPostPerformanceAnalysis(media);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to generate AI analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const sortedMedia = useMemo(() => {
        const getEngagement = (item: MediaItem) => {
            if (!profile?.follower_count) return 0;
            return ((item.like_count ?? 0) + (item.comment_count ?? 0)) / profile.follower_count * 100;
        };
        
        return [...media].sort((a, b) => {
            switch (sortKey) {
                case 'likes':
                    return (b.like_count ?? 0) - (a.like_count ?? 0);
                case 'comments':
                    return (b.comment_count ?? 0) - (a.comment_count ?? 0);
                case 'engagement':
                    return getEngagement(b) - getEngagement(a);
                case 'latest':
                default:
                    return b.taken_at - a.taken_at;
            }
        });
    }, [media, sortKey, profile]);

    const performanceMetrics = useMemo(() => {
        if (!media.length || !profile?.follower_count) return null;
        const totalLikes = media.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
        const totalComments = media.reduce((sum, item) => sum + (item.comment_count ?? 0), 0);
        const avgLikes = totalLikes / media.length;
        const avgComments = totalComments / media.length;
        const engagementRate = ((avgLikes + avgComments) / profile.follower_count) * 100;
        return { avgLikes, avgComments, engagementRate };
    }, [media, profile]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <ChartBarIcon className="w-8 h-8 text-indigo-400" />
                    Post Performance Dashboard
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Analyze recent post performance, identify top content, and get AI insights on what's working.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
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

            {profile && media.length > 0 && performanceMetrics && (
                <div className="space-y-6 animate-fade-in">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-800/50 p-4 rounded-lg"><p className="text-2xl font-bold text-white">{performanceMetrics.avgLikes.toFixed(0)}</p><p className="text-sm text-gray-400">Avg. Likes</p></div>
                        <div className="bg-gray-800/50 p-4 rounded-lg"><p className="text-2xl font-bold text-white">{performanceMetrics.avgComments.toFixed(0)}</p><p className="text-sm text-gray-400">Avg. Comments</p></div>
                        <div className="bg-gray-800/50 p-4 rounded-lg"><p className="text-2xl font-bold text-indigo-400">{performanceMetrics.engagementRate.toFixed(2)}%</p><p className="text-sm text-gray-400">Engagement Rate</p></div>
                    </div>
                    
                    {/* AI Analysis Section */}
                    <div className="text-center">
                        <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto">
                           {isAnalyzing ? <><div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>Analyzing...</> : <><SparklesIcon className="w-5 h-5"/>Get AI "What's Working" Analysis</>}
                        </button>
                    </div>

                    {analysis && (
                        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                            <h3 className="text-xl font-bold text-white mb-4">AI Performance Insights</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-green-400 mb-2">What's Working</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-300">{analysis.what_is_working.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-indigo-400 mb-2">Suggestions</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-300">{analysis.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sortable Media List */}
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Recent Posts</h3>
                            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:outline-none">
                                <option value="latest">Sort by: Latest</option>
                                <option value="likes">Sort by: Likes</option>
                                <option value="comments">Sort by: Comments</option>
                                <option value="engagement">Sort by: Engagement</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            {sortedMedia.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg">
                                    <img src={item.image_versions2?.candidates[0].url} className="w-20 h-20 object-cover rounded-md" alt="post"/>
                                    <div className="flex-1 text-sm">
                                        <p className="text-gray-400 line-clamp-2">{item.caption?.text || "No caption"}</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 text-center font-mono">
                                        <div className="text-sm"><span className="font-bold text-white">{(item.like_count ?? 0).toLocaleString()}</span><span className="text-gray-400"> Likes</span></div>
                                        <div className="text-sm"><span className="font-bold text-white">{(item.comment_count ?? 0).toLocaleString()}</span><span className="text-gray-400"> Comments</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostPerformance;
