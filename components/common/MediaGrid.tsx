import React from 'react';
import { MediaItem } from '../../types';

interface MediaGridProps {
  media: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  if (!media || media.length === 0) {
    return <p className="text-center text-gray-400 py-8">No media found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
      {media.map((item) => {
        const imageUrl = item.image_versions2?.candidates?.[0]?.url;

        // If a media item doesn't have a valid image URL, don't render it.
        if (!imageUrl) {
          return null;
        }

        return (
          <div key={item.id} className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={item.caption?.text || 'Instagram media'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
              <div className="flex items-center gap-4 text-sm">
                  <span>❤️ {(item.like_count ?? 0).toLocaleString()}</span>
                  <span>💬 {(item.comment_count ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;