import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { SparklesIcon, BoltIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const HOOK_STYLES = [
    'Curiosity Gap',
    'Bold Statement',
    'Question',
    'Storytelling',
    'Problem/Solution',
    'Relatable',
    'Educational',
    'Cliffhanger',
    'Humorous',
    'Surprising Fact',
    'Direct Call to Action',
];

const HookCreator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState(HOOK_STYLES[0]);
    const [hooks, setHooks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedHook, setCopiedHook] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsLoading(true);
        setError(null);
        setHooks([]);
        try {
            const result = await geminiService.generateHooks(topic, style);
            setHooks(result);
        } catch (err) {
            setError('Failed to generate hooks. Please check your Gemini API key.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (hookText: string) => {
        navigator.clipboard.writeText(hookText);
        setCopiedHook(hookText);
        setTimeout(() => setCopiedHook(null), 2000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <BoltIcon className="w-8 h-8 text-indigo-400" />
                    AI Hook Creator
                </h2>
                <p className="text-gray-400 mt-2">Generate viral-worthy hooks for your content. Just provide a topic.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Post Topic</label>
                    <textarea
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'My simple 3-step morning routine that doubled my productivity'"
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
                    />
                </div>
                 <div>
                    <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Hook Style</label>
                    <select
                        id="style"
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        {HOOK_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                <button
                    type="submit"
                    disabled={isLoading || !topic}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5"/>Generate Hooks</>}
                </button>
            </form>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400">{error}</p>}

            {hooks.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    {hooks.map((hook, index) => (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center gap-4">
                           <p className="text-gray-200 flex-grow">"{hook}"</p>
                           <button 
                             onClick={() => handleCopy(hook)}
                             className="text-xs px-3 py-1 bg-gray-700 hover:bg-indigo-600 text-white font-semibold rounded-md transition-colors flex-shrink-0"
                           >
                            {copiedHook === hook ? 'Copied!' : 'Copy'}
                           </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HookCreator;