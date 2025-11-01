import React, { useState, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import { SparklesIcon, CalendarIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';
import Tooltip from './common/Tooltip';
import { PostIdea } from '../types';
import * as scheduleService from '../services/scheduleService';
import SchedulePostModal from './SchedulePostModal';


const PostIdeaGenerator: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [numIdeas, setNumIdeas] = useState(5);
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<PostIdea | null>(null);

  useEffect(() => {
    const scheduled = scheduleService.getScheduledPosts();
    setScheduledIds(new Set(scheduled.map(p => p.id)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) return;

    setIsLoading(true);
    setError(null);
    setIdeas([]);
    try {
      const result = await geminiService.generatePostIdeas(niche, numIdeas);
      const ideasWithIds: PostIdea[] = result.map((idea: Omit<PostIdea, 'id'>) => ({
        ...idea,
        id: crypto.randomUUID(),
      }));
      setIdeas(ideasWithIds);
    } catch (err) {
      setError('Failed to generate ideas. Please check your Gemini API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenScheduler = (idea: PostIdea) => {
    setSelectedIdea(idea);
    setIsScheduling(true);
  };

  const handleCloseScheduler = () => {
    setSelectedIdea(null);
    setIsScheduling(false);
  };

  const handleConfirmSchedule = (scheduledAt: string) => {
    if (!selectedIdea) return;
    scheduleService.schedulePost({ ...selectedIdea, scheduledAt });
    setScheduledIds(prev => new Set(prev).add(selectedIdea.id));
    handleCloseScheduler();
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <SparklesIcon className="w-8 h-8 text-indigo-400"/>
            AI Content Idea Generator
        </h2>
        <p className="text-gray-400 mt-2">Never run out of content ideas again. Describe your niche and let AI do the work.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g., 'Vegan cooking for beginners', 'Street photography', 'Personal finance tips'"
          className="flex-grow px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <Tooltip text="Number of ideas to generate (1-10)">
            <input
              type="number"
              value={numIdeas}
              onChange={(e) => setNumIdeas(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
              min="1"
              max="10"
              aria-label="Number of ideas to generate"
              className="w-full sm:w-24 text-center px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
        </Tooltip>
        <button 
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </form>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {ideas.length > 0 && (
          <div className="space-y-6 animate-fade-in">
              {ideas.map((idea) => (
                  <div key={idea.id} className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-bold text-indigo-400 mb-2 flex-grow">{idea.ideaTitle}</h3>
                         <Tooltip text={scheduledIds.has(idea.id) ? "This post is already scheduled" : "Add this post to your content calendar"}>
                            <button
                                onClick={() => handleOpenScheduler(idea)}
                                disabled={scheduledIds.has(idea.id)}
                                className="flex-shrink-0 px-3 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                {scheduledIds.has(idea.id) ? 'Scheduled' : 'Schedule'}
                            </button>
                        </Tooltip>
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{idea.caption}</p>
                      <div className="flex flex-wrap gap-2">
                          {idea.hashtags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-700 text-indigo-300 text-xs font-mono rounded">
                                  #{tag}
                              </span>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      )}
       {isScheduling && selectedIdea && (
        <SchedulePostModal
            idea={selectedIdea}
            onClose={handleCloseScheduler}
            onSchedule={handleConfirmSchedule}
        />
      )}
    </div>
  );
};

export default PostIdeaGenerator;