import React, { useState, useEffect } from 'react';
import { getTwitterAvatar, validateAvatarUrl, createCorsFreeBlobUrl } from '../utils/twitterAvatar';

const TwitterAvatar = ({ 
  username, 
  size = 128, 
  onAvatarLoad,
  className = '',
  style = {} 
}) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (username) {
      loadAvatar(username);
    }
  }, [username]);

  const loadAvatar = async (user) => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const originalUrl = getTwitterAvatar(user);
      
      // CORS-free blob URL oluştur
      const blobUrl = await createCorsFreeBlobUrl(originalUrl);
      setAvatarUrl(blobUrl);
      
      // Avatar yüklendiğinde parent component'e bildir
      if (onAvatarLoad) {
        onAvatarLoad(blobUrl);
      }
    } catch (error) {
      console.error('Avatar yüklenirken hata:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setHasError(true);
    const fallbackUrl = `https://unavatar.io/fallback?size=${size}`;
    setAvatarUrl(fallbackUrl);
  };

  const handleImageLoad = () => {
    setHasError(false);
  };

  return (
    <div className={`twitter-avatar ${className}`} style={style}>
      {isLoading && (
        <div 
          className="loading-placeholder"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666'
          }}
        >
          Yükleniyor...
        </div>
      )}
      
      {!isLoading && avatarUrl && (
        <img
          src={avatarUrl}
          alt={`@${username} profil fotoğrafı`}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #1da1f2',
            backgroundColor: '#f0f0f0'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {hasError && !isLoading && (
        <div 
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#e1e8ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#657786'
          }}
        >
          👤
        </div>
      )}
    </div>
  );
};

export default TwitterAvatar; 