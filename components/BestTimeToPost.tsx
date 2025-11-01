import React, { useState } from 'react';
import { UserProfile, MediaItem, BestTimeToPostReport } from '../types';
import * as instagramService from '../services/instagramService';
import * as geminiService from '../services/geminiService';
import { ClockIcon, SparklesIcon, SearchIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const Heatmap: React.FC<{ data: BestTimeToPostReport['heatmapData'] }> = ({ data }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getScore = (day: number, hour: number) => {
        const point = data.find(d => d.day === day && d.hour === hour);
        return point ? point.engagementScore : 0;
    };

    const getColor = (score: number) => {
        if (score === 0) return 'bg-gray-800/50';
        const hue = (1 - (score / 100)) * 240; // Blue to Red
        const lightness = 40 + (score / 100) * 30; // Adjust lightness
        const saturation = 70 + (score / 100) * 30; // Adjust saturation
        // Using HSL for better color scaling
        // Let's use a simpler scale for tailwind compatibility
        if (score > 85) return 'bg-yellow-400';
        if (score > 70) return 'bg-yellow-500';
        if (score > 55) return 'bg-indigo-400';
        if (score > 40) return 'bg-indigo-500';
        if (score > 20) return 'bg-indigo-700';
        return 'bg-gray-700';
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="grid grid-cols-[auto_1fr] gap-1 text-xs text-gray-400">
                {/* Corner */}
                <div />
                {/* Day Headers */}
                <div className="grid grid-cols-7">
                    {days.map(day => <div key={day} className="text-center font-semibold p-1">{day}</div>)}
                </div>

                {/* Hour Labels */}
                <div className="grid grid-rows-24 gap-px pr-2">
                    {hours.map(hour => (
                        <div key={hour} className="text-right h-5 flex items-center justify-end">
                            {hour % 2 === 0 ? `${hour.toString().padStart(2, '0')}:00` : ''}
                        </div>
                    ))}
                </div>
                
                {/* Heatmap Grid */}
                <div className="grid grid-cols-7 grid-rows-24 gap-px">
                    {days.map((_, dayIndex) => (
                        <React.Fragment key={dayIndex}>
                            {hours.map((_, hourIndex) => (
                                <div key={`${dayIndex}-${hourIndex}`} className="relative group h-5">
                                    <div className={`w-full h-full rounded-[2px] ${getColor(getScore(dayIndex, hourIndex))}`} />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                        Score: {getScore(dayIndex, hourIndex)}
                                    </span>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
             <div className="flex justify-end items-center gap-4 mt-4 text-xs text-gray-400">
                <span>Less Active</span>
                <div className="flex">
                    <div className="w-4 h-4 rounded-sm bg-gray-700"></div>
                    <div className="w-4 h-4 rounded-sm bg-indigo-700"></div>
                    <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>
                    <div className="w-4 h-4 rounded-sm bg-indigo-400"></div>
                    <div className="w-4 h-4 rounded-sm bg-yellow-500"></div>
                    <div className="w-4 h-4 rounded-sm bg-yellow-400"></div>
                </div>
                <span>More Active</span>
            </div>
        </div>
    );
};

const BestTimeToPost: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<BestTimeToPostReport | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setUser(null);

        try {
            const profile = await instagramService.searchUser(query);
            if (!profile || profile.is_private) {
                setError('Cannot analyze private profiles or user not found.');
                setIsLoading(false);
                return;
            }
            setUser(profile);

            const mediaResponse = await instagramService.getUserMedia(profile.id);
            const media = mediaResponse?.items || [];
            if (media.length < 10) {
                 setError('Not enough posts found for a reliable analysis (minimum 10 required).');
                 setIsLoading(false);
                 return;
            }

            const aiReport = await geminiService.getBestTimeToPostAnalysis(media);
            setAnalysis(aiReport);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred during analysis.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <ClockIcon className="w-8 h-8 text-indigo-400" />
                    Best Time to Post Analyzer
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Enter a public Instagram username to analyze their post engagement and discover the best times to post.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="relative max-w-lg mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter Instagram username..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400">{error}</p>}

            {analysis && user && (
                <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                    <Heatmap data={analysis.heatmapData} />
                    
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-indigo-400" />
                            AI-Powered Recommendations
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                           {analysis.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BestTimeToPost;