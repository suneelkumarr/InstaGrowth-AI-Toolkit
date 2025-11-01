
import React, { useState } from 'react';
import { MediaItem } from '../types';
import * as instagramService from '../services/instagramService';
import { HashtagIcon } from './common/icons';
import LoadingSpinner from './common/LoadingSpinner';
import MediaGrid from './common/MediaGrid';

const HashtagSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedTag, setSearchedTag] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setMedia([]);
    setSearchedTag(query);

    try {
      // The service now returns the clean media array directly.
      const mediaItems = await instagramService.getMediaByHashtag(query);
      setMedia(mediaItems);
    } catch (err) {
      setError('Could not fetch media for this hashtag.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font.bold text-white">Hashtag Research</h2>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a hashtag (without #)..."
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <HashtagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
      </form>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {media.length > 0 && (
          <div className="animate-fade-in">
              <h3 className="text-xl font-semibold mb-4 text-white">Top Posts for #{searchedTag}</h3>
              <MediaGrid media={media} />
          </div>
      )}
    </div>
  );
};

export default HashtagSearch;