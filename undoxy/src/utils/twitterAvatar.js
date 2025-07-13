/**
 * Fetches avatar URL from Twitter username like a digital magician ✨
 * @param {string} username - Twitter username (with or without @)
 * @returns {string} Avatar URL (or magic fallback)
 */
export const getTwitterAvatar = (username) => {
  try {
    // Clean up that @ symbol like we're tidying up
    const cleanUsername = username.replace(/^@/, '').trim();
    
    // Empty username check (nobody likes emptiness)
    if (!cleanUsername) {
      return getDefaultAvatar();
    }
    
    // Fetch Twitter avatar from Unavatar.io (using X format because rebrand happened)
    return `https://unavatar.io/x/${cleanUsername}`;
  } catch (error) {
    console.error('Error fetching Twitter avatar (oops!):', error);
    return getDefaultAvatar();
  }
};

/**
 * Converts avatar to CORS-safe blob URL (because CORS is evil)
 * @param {string} originalUrl - Original avatar URL
 * @returns {Promise<string>} Blob URL (the safe way)
 */
export const createCorsFreeBlobUrl = async (originalUrl) => {
  // Try direct URL first (fingers crossed!)
  try {
    const response = await fetch(originalUrl);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.log('Direct fetch failed, trying proxy magic:', error);
  }

  // Try CORS proxies one by one (because we don't give up!)
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/'
  ];

  for (const proxy of proxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(originalUrl);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.log(`Proxy ${proxy} failed (moving on!):`, error);
    }
  }

  // Last resort: return original URL (better than nothing!)
  console.warn('All proxy attempts failed, returning original URL (we tried!)');
  return originalUrl;
};

/**
 * Returns default avatar URL (our trusty fallback friend)
 * @returns {string} Default avatar URL
 */
const getDefaultAvatar = () => {
  // CORS friendly default avatar with more reliable source
  return `https://unavatar.io/github/github`;
};

/**
 * Creates CORS proxy URL (because CORS is still evil)
 * @param {string} url - URL to be proxied
 * @returns {string} Proxy URL (the workaround hero)
 */
export const getCorsProxyUrl = (url) => {
  // CORS proxy for GitHub Pages and other static hosting
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ];
  
  // Try first proxy (optimistic approach!)
  return corsProxies[0] + encodeURIComponent(url);
};

/**
 * Checks if avatar URL is valid (quality control!)
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} Is URL valid? (yes/no/maybe)
 */
export const validateAvatarUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Avatar URL validation failed (oh well!):', error);
    return false;
  }
}; 