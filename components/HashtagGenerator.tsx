import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { HashtagGroups } from '../types';
import { SparklesIcon, TagIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const HashtagGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [hashtags, setHashtags] = useState<HashtagGroups | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsLoading(true);
        setError(null);
        setHashtags(null);
        try {
            const result = await geminiService.generateHashtags(topic);
            setHashtags(result);
        } catch (err) {
            setError('Failed to generate hashtags. Please check your Gemini API key.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (tags: string[]) => {
        const textToCopy = tags.map(t => `#${t}`).join(' ');
        navigator.clipboard.writeText(textToCopy);
        // Add visual feedback if desired
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <TagIcon className="w-8 h-8 text-indigo-400" />
                    AI Hashtag Generator
                </h2>
                <p className="text-gray-400 mt-2">Describe your post topic and get strategically categorized hashtags to maximize reach and engagement.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter post topic or caption, e.g., 'A vibrant photo of a homemade vegan pizza with fresh basil.'"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5"/>Generate Hashtags</>}
                </button>
            </form>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400">{error}</p>}

            {hashtags && (
                <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
                    <HashtagCategory title="🎯 Niche Specific" tags={hashtags.niche} onCopy={() => copyToClipboard(hashtags.niche)} />
                    <HashtagCategory title="🚀 Broad Reach" tags={hashtags.broad} onCopy={() => copyToClipboard(hashtags.broad)} />
                    <HashtagCategory title="🤝 Community" tags={hashtags.community} onCopy={() => copyToClipboard(hashtags.community)} />
                </div>
            )}
        </div>
    );
};

const HashtagCategory: React.FC<{ title: string; tags: string[]; onCopy: () => void; }> = ({ title, tags, onCopy }) => (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50">
        <h3 className="font-semibold text-lg text-indigo-400 mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-indigo-300 text-xs font-mono rounded">
                    #{tag}
                </span>
            ))}
        </div>
        <button onClick={onCopy} className="w-full text-center px-3 py-1.5 bg-gray-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-md transition-colors">
            Copy Group
        </button>
    </div>
);

export default HashtagGenerator;
