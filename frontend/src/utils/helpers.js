// Single source of truth for the API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3099';

/**
 * Resolves a service image path to a full URL.
 * - Full HTTP/S URLs (e.g. Unsplash) → returned as-is.
 * - Local /uploads/... paths            → prefixed with API base URL.
 * - Falsy (null / undefined / '')      → returns null (caller decides the fallback UI).
 */
export const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
};
