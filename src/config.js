// Global API Configuration
// Resolves hardcoded localhost issues across different networks and hosting providers.

const getApiBaseUrl = () => {
    // If hosting on Vercel or similar, VITE_API_BASE_URL can point to the live backend.
    // If running locally, but accessed via IP on a phone (e.g. 192.168.x.x), 
    // we want to dynamically point to the same hostname, but on port 3001.
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback for local network access (allows testing on mobile via LAN)
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
};

export const API_BASE_URL = getApiBaseUrl();
