import React, { useState } from 'react';
import { UserProfile, CollabAnalysisReport } from '../types';
import * as instagramService from '../services/instagramService';
import * as geminiService from '../services/geminiService';
import { HandshakeIcon, SparklesIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const CollabMatcher: React.FC = () => {
    const [username1, setUsername1] = useState('');
    const [username2, setUsername2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<CollabAnalysisReport | null>(null);
    const [profiles, setProfiles] = useState<{ p1: UserProfile, p2: UserProfile } | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username1 || !username2) {
            setError('Please enter two usernames to compare.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setProfiles(null);

        try {
            const [profile1, profile2] = await Promise.all([
                instagramService.searchUser(username1),
                instagramService.searchUser(username2)
            ]);

            if (!profile1 || !profile2) {
                throw new Error('Could not fetch data for one or both users.');
            }
            
            if(profile1.is_private || profile2.is_private) {
                throw new Error('Cannot analyze private profiles.');
            }

            setProfiles({ p1: profile1, p2: profile2 });

            const aiReport = await geminiService.getCollabAnalysis(profile1, profile2);
            setAnalysis(aiReport);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <HandshakeIcon className="w-8 h-8 text-indigo-400" />
                    AI Collab Matcher
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Analyze the collaboration potential between two public Instagram profiles to find the perfect match.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                        type="text"
                        value={username1}
                        onChange={(e) => setUsername1(e.target.value)}
                        placeholder="Username 1"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-gray-400 font-bold">VS</span>
                     <input
                        type="text"
                        value={username2}
                        onChange={(e) => setUsername2(e.target.value)}
                        placeholder="Username 2"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Compatibility'}
                </button>
            </form>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400">{error}</p>}

            {analysis && profiles && (
                <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                    {/* Score and Verdict */}
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 text-center">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Compatibility Score</p>
                        <p className={`text-6xl font-bold my-2 ${getScoreColor(analysis.compatibility_score)}`}>{analysis.compatibility_score}<span className="text-3xl text-gray-500">/100</span></p>
                        <p className="text-xl font-semibold text-white">{analysis.match_verdict}</p>
                    </div>

                    {/* Profiles */}
                    <div className="grid md:grid-cols-2 gap-6 text-center">
                         <div className="bg-gray-800/30 p-4 rounded-lg"><img src={profiles.p1.profile_pic_url} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-indigo-500" /><p className="font-bold text-white">@{profiles.p1.username}</p><p className="text-sm text-gray-400">{profiles.p1.follower_count?.toLocaleString()} followers</p></div>
                         <div className="bg-gray-800/30 p-4 rounded-lg"><img src={profiles.p2.profile_pic_url} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-indigo-500" /><p className="font-bold text-white">@{profiles.p2.username}</p><p className="text-sm text-gray-400">{profiles.p2.follower_count?.toLocaleString()} followers</p></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Analysis Points */}
                        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                             <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-indigo-400" />
                                AI Analysis
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {analysis.analysis_points.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                         {/* Collaboration Ideas */}
                        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                             <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-indigo-400" />
                                Collaboration Ideas
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {analysis.collaboration_ideas.map((idea, i) => <li key={i}>{idea}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollabMatcher;