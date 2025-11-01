import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { HookAnalysisReport } from '../types';
import { SparklesIcon, BoltIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const HookAnalyser: React.FC = () => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<HookAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await geminiService.getHookAnalysis(text);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze hook. Please check your Gemini API key.');
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
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <BoltIcon className="w-8 h-8 text-indigo-400" />
                    AI Hook Analyzer
                </h2>
                <p className="text-gray-400 mt-2">Test your opening line. A strong hook is the key to stopping the scroll.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your caption's opening line or Reel idea here..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[120px]"
                />
                <button
                    type="submit"
                    disabled={isLoading || !text}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Analyzing...' : <><SparklesIcon className="w-5 h-5"/>Analyze Hook</>}
                </button>
            </form>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400">{error}</p>}

            {analysis && (
                <div className="space-y-6 animate-fade-in">
                     <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 text-center">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Hook Score</p>
                        <p className={`text-6xl font-bold my-2 ${getScoreColor(analysis.hook_score)}`}>{analysis.hook_score}<span className="text-3xl text-gray-500">/100</span></p>
                        <p className="text-xl font-semibold text-white">{analysis.verdict}</p>
                    </div>

                    <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-3">Analysis</h3>
                        <p className="text-gray-300">{analysis.analysis}</p>
                    </div>

                    <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-3">Suggestions</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>

                    {analysis.alternative_styles && analysis.alternative_styles.length > 0 && (
                        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                Try These Hook Styles
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                For a different approach, try creating a hook using one of these styles in the AI Hook Creator.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.alternative_styles.map((style) => (
                                    <span key={style} className="px-3 py-1.5 bg-gray-700 text-indigo-300 text-sm font-medium rounded-full">
                                        {style}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HookAnalyser;