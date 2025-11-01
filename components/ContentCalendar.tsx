import React, { useState, useEffect } from 'react';
import { ScheduledPost } from '../types';
import * as scheduleService from '../services/scheduleService';
import { CalendarIcon } from './common/icons';

const ContentCalendar: React.FC = () => {
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

    useEffect(() => {
        setScheduledPosts(scheduleService.getScheduledPosts());
    }, []);

    const handleUnschedule = (postId: string) => {
        scheduleService.unschedulePost(postId);
        setScheduledPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-indigo-400" />
                    Content Calendar
                </h2>
                <p className="text-gray-400 mt-2">
                    Here are your scheduled posts. Note: This is a planner and does not post automatically.
                </p>
            </div>
            
            {scheduledPosts.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-800/20 rounded-lg">
                    <p className="text-lg">Your calendar is empty.</p>
                    <p>Go to "AI Content Ideas" to generate and schedule your first post!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {scheduledPosts.map(post => (
                        <div key={post.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                            <div className="flex-grow">
                                <p className="font-bold text-white">{post.ideaTitle}</p>
                                <p className="text-sm text-gray-400 line-clamp-2">{post.caption}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-4 sm:gap-1 text-right w-full sm:w-auto">
                                <p className="text-indigo-400 font-semibold text-sm bg-indigo-900/50 px-3 py-1 rounded-full whitespace-nowrap">
                                    {new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                                <button onClick={() => handleUnschedule(post.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                    Unschedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContentCalendar;
