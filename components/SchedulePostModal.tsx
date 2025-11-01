import React, { useState } from 'react';
import { PostIdea } from '../types';

interface SchedulePostModalProps {
    idea: PostIdea;
    onClose: () => void;
    onSchedule: (scheduledAt: string) => void;
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({ idea, onClose, onSchedule }) => {
    const now = new Date();
    // Prevent scheduling in the past by default
    now.setMinutes(now.getMinutes() + 5);

    const [date, setDate] = useState(now.toISOString().split('T')[0]);
    const [time, setTime] = useState(now.toTimeString().substring(0, 5));

    const handleSubmit = () => {
        const scheduledAt = new Date(`${date}T${time}`);
        onSchedule(scheduledAt.toISOString());
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-[#1a2035] rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-lg w-full">
                <h3 className="text-xl font-bold text-white mb-2">Schedule Post</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-1">"{idea.ideaTitle}"</p>
                <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-300">Choose a date and time:</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="date"
                            value={date}
                            min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                        Confirm Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchedulePostModal;
