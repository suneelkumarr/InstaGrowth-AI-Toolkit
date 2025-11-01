import { API_BASE_URL, RAPIDAPI_HOST } from '../constants';
import { UserProfile, MediaItem, Hashtag, DiscoveredUser } from '../types';

const fetchApi = async <T,>(endpoint: string, params: Record<string, string>): Promise<T> => {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const apiKey = localStorage.getItem('rapidApiKey');
  if (!apiKey) {
    throw new Error('RapidAPI key not provided. Please enter your key in the configuration section.');
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  };

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An API error occurred');
    }
    return await response.json() as T;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};

// Raw API response type for the 'web-profile' endpoint
interface WebProfileApiResponse {
  data: {
    user: {
      biography: string;
      edge_followed_by: { count: number };
      edge_follow: { count: number };
      edge_owner_to_timeline_media: { count: number };
      full_name: string;
      id: string; // This is the user ID we need for other calls
      is_private: boolean;
      is_verified: boolean;
      profile_pic_url: string;
      username: string;
      external_url?: string;
    }
  }
}

interface RawDiscoveredUser {
    pk: string;
    username: string;
    full_name: string;
    is_private: boolean;
    profile_pic_url: string;
    is_verified: boolean;
    follower_count: number;
}

export const searchUser = async (username: string): Promise<UserProfile> => {
  // Use the 'web-profile' endpoint for a more structured and reliable response.
  const response = await fetchApi<WebProfileApiResponse>('web-profile', { username });

  if (!response?.data?.user) {
    throw new Error('User not found or API response format is unexpected.');
  }

  const apiUser = response.data.user;

  // Map the raw API response to our internal, consistent UserProfile type.
  // This acts as an adapter and protects our app from API structure changes.
  const userProfile: UserProfile = {
    id: apiUser.id,
    username: apiUser.username,
    full_name: apiUser.full_name,
    biography: apiUser.biography,
    profile_pic_url: apiUser.profile_pic_url,
    follower_count: apiUser.edge_followed_by.count,
    following_count: apiUser.edge_follow.count,
    media_count: apiUser.edge_owner_to_timeline_media.count,
    is_private: apiUser.is_private,
    is_verified: apiUser.is_verified,
    external_url: apiUser.external_url,
  };
  
  return userProfile;
};

export const getUserMedia = (id: string): Promise<{ items: MediaItem[], status: string }> => {
  return fetchApi<{ items: MediaItem[], status: string }>('user-feeds', { id, count: '24' });
};

export const getUserReels = (id: string): Promise<{ items: MediaItem[], status: string }> => {
  return fetchApi<{ items: MediaItem[], status: string }>('reels', { id, count: '24' });
};

export const getTaggedMedia = (id: string): Promise<{ items: MediaItem[], status: string }> => {
  return fetchApi<{ items: MediaItem[], status: string }>('user-tags', { id, count: '24' });
};

export const searchHashtags = (query: string): Promise<{hashtags: Hashtag[]}> => {
  return fetchApi<{hashtags: Hashtag[]}>('search', { query, select: 'hashtags' });
};

export const getMediaByHashtag = async (query: string): Promise<MediaItem[]> => {
  const response = await fetchApi<{ items: MediaItem[], status: string }>('tag-feeds', { query });
  
  if (!response?.items) {
    console.warn('No items found in hashtag feed response:', response);
    return [];
  }
  
  return response.items;
};

export const discoverInfluencers = async (query: string): Promise<DiscoveredUser[]> => {
    const response = await fetchApi<{ users: RawDiscoveredUser[] }>('search', { query, select: 'users' });
    if (!response.users) {
        return [];
    }
    // Map the raw API response to our clean DiscoveredUser type
    return response.users
        .filter(user => !user.is_private)
        .map(user => ({
            id: user.pk,
            username: user.username,
            full_name: user.full_name,
            profile_pic_url: user.profile_pic_url,
            follower_count: user.follower_count,
            is_verified: user.is_verified,
        }));
};
