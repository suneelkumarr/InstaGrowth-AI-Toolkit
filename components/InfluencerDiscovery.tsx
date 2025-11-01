import React, { useState } from 'react';
import { DiscoveredUser } from '../types';
import * as instagramService from '../services/instagramService';
import { SearchIcon, MagnifyingGlassCircleIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';

const InfluencerDiscovery: React.FC = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<DiscoveredUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setUsers([]);

        try {
            const results = await instagramService.discoverInfluencers(query);
            setUsers(results);
            if (results.length === 0) {
              setError("No public profiles found for this query.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <MagnifyingGlassCircleIcon className="w-8 h-8 text-indigo-400" />
                    Influencer Discovery
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Find public profiles and potential influencers by searching for keywords or niches.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'sustainable fashion', 'london foodie', 'tech reviewer'"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </form>

            {isLoading && <LoadingSpinner />}
            {error && !isLoading && users.length === 0 && <p className="text-center text-red-400">{error}</p>}

            {users.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                    {users.map(user => (
                        <div key={user.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-4 border border-gray-700/50">
                            <img src={user.profile_pic_url} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-white">{user.full_name}</p>
                                <p className="text-sm text-gray-400">@{user.username}</p>
                                <p className="text-sm font-mono text-indigo-400 mt-1">{user.follower_count.toLocaleString()} followers</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InfluencerDiscovery;
