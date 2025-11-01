
import React, { useState } from 'react';
import { UserProfile, MediaItem, CompetitorReport } from '../types';
import * as instagramService from '../services/instagramService';
import * as geminiService from '../services/geminiService';
import { UsersGroupIcon, SparklesIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

interface ProfileWithStats extends UserProfile {
  engagementRate: number;
}

const CompetitorAnalysis: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompetitorReport | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernames = query.split(',').map(name => name.trim()).filter(Boolean);
    if (usernames.length === 0 || usernames.length > 3) {
      setError('Please enter 1 to 3 comma-separated usernames.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setProfiles([]);

    try {
      const fetchedProfiles: ProfileWithStats[] = [];
      const profilesWithMedia: { profile: UserProfile; media: MediaItem[] }[] = [];

      await Promise.all(usernames.map(async (username) => {
        try {
          const profile = await instagramService.searchUser(username);
          if (!profile.is_private) {
            const mediaResponse = await instagramService.getUserMedia(profile.id);
            const media = mediaResponse?.items || [];
            
            let engagementRate = 0;
            if (profile.follower_count && media.length > 0) {
              const totalLikes = media.reduce((sum, item) => sum + (item.like_count ?? 0), 0);
              const totalComments = media.reduce((sum, item) => sum + (item.comment_count ?? 0), 0);
              const avgInteractions = (totalLikes + totalComments) / media.length;
              engagementRate = (avgInteractions / profile.follower_count) * 100;
            }
            
            fetchedProfiles.push({ ...profile, engagementRate });
            profilesWithMedia.push({ profile, media });
          }
        } catch (err) {
          console.warn(`Could not fetch data for user: ${username}`);
          // Silently fail for individual users to not block the whole analysis
        }
      }));

      if (profilesWithMedia.length === 0) {
        throw new Error('Could not fetch data for any of the provided public profiles.');
      }

      setProfiles(fetchedProfiles.sort((a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0)));
      
      const aiReport = await geminiService.getCompetitorAnalysis(profilesWithMedia);
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
          <UsersGroupIcon className="w-8 h-8 text-indigo-400" />
          Competitor Analysis
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Enter up to 3 public Instagram usernames to compare their stats and get an AI-powered strategic analysis.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., username1, username2, username3"
          className="flex-grow px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Competitors'}
        </button>
      </form>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {analysis && profiles.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Table */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Stats at a Glance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-3 text-sm font-semibold text-gray-400 uppercase">Profile</th>
                    <th className="p-3 text-sm font-semibold text-gray-400 uppercase text-right">Followers</th>
                    <th className="p-3 text-sm font-semibold text-gray-400 uppercase text-right">Posts</th>
                    <th className="p-3 text-sm font-semibold text-gray-400 uppercase text-right">Eng. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-gray-800 last:border-b-0">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.profile_pic_url} alt={p.username} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-medium text-white">@{p.username}</span>
                      </td>
                      <td className="p-3 text-right font-mono text-gray-300">{(p.follower_count ?? 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-gray-300">{(p.media_count ?? 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-indigo-400">{p.engagementRate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-indigo-400" />
              AI Summary & Strategy
            </h3>
            <p className="text-gray-300">{analysis.summary}</p>
          </div>

          {/* Individual Analysis */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.profiles.map(profileAnalysis => (
              <div key={profileAnalysis.username} className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                <h4 className="font-bold text-lg text-white mb-4">@{profileAnalysis.username}</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-indigo-400 mb-1">Strengths</h5>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {profileAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-orange-400 mb-1">Weaknesses</h5>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {profileAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                   <div>
                    <h5 className="font-semibold text-green-400 mb-1">Content Themes</h5>
                     <div className="flex flex-wrap gap-2 mt-2">
                       {profileAnalysis.content_themes.map((t, i) => <span key={i} className="px-2 py-1 bg-gray-700 text-green-300 text-xs font-mono rounded">{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;
