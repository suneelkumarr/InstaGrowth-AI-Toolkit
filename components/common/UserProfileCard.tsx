import React from 'react';
import { UserProfile } from '../../types';
import { SparklesIcon } from './icons';
import Tooltip from './Tooltip';

interface UserProfileCardProps {
  profile: UserProfile;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  engagementRate: number | null;
}

const StatItem = ({ label, value }: { label: string; value?: number | string }) => (
    <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-white">
            {typeof value === 'number' ? (value ?? 0).toLocaleString() : value ?? 'N/A'}
        </p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);


const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, onAnalyze, isAnalyzing, engagementRate }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img src={profile.profile_pic_url} alt={profile.username} className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover" />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
            {profile.is_verified && <span className="text-blue-500 text-xs">(Verified)</span>}
          </div>
          <p className="text-lg text-gray-400">@{profile.username}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 my-4">
              <StatItem label="Posts" value={profile.media_count} />
              <StatItem label="Followers" value={profile.follower_count} />
              <StatItem label="Following" value={profile.following_count} />
              {engagementRate !== null && (
                <Tooltip text="Avg. interactions per post / followers, based on recent posts.">
                  <div>
                    <StatItem label="Eng. Rate" value={`${engagementRate.toFixed(2)}%`} />
                  </div>
                </Tooltip>
              )}
          </div>
          <p className="text-gray-300 whitespace-pre-wrap max-w-xl mx-auto md:mx-0">{profile.biography}</p>
        </div>
        <Tooltip text="Generate a detailed growth strategy for this profile using AI.">
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
               <>
                 <SparklesIcon className="w-5 h-5" />
                 Get AI Analysis
               </>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default UserProfileCard;