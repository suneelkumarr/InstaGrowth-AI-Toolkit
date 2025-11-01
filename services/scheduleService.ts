import { ScheduledPost } from '../types';

const STORAGE_KEY = 'instaGrowthScheduledPosts';

export const getScheduledPosts = (): ScheduledPost[] => {
    try {
        const postsJson = localStorage.getItem(STORAGE_KEY);
        if (!postsJson) return [];
        const posts = JSON.parse(postsJson) as ScheduledPost[];
        // Sort by date, soonest first
        return posts.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    } catch (error) {
        console.error("Failed to parse scheduled posts from localStorage", error);
        return [];
    }
};

export const schedulePost = (post: ScheduledPost): void => {
    const currentPosts = getScheduledPosts();
    // Prevent duplicates
    if (currentPosts.some(p => p.id === post.id)) return;
    const updatedPosts = [...currentPosts, post];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const unschedulePost = (postId: string): void => {
    const currentPosts = getScheduledPosts();
    const updatedPosts = currentPosts.filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};
