import React, { useState, useEffect } from 'react';
import { createCorsFreeBlobUrl } from '../utils/twitterAvatar';

const LayerPanel = ({ 
  avatars, 
  selectedAvatarId,
  selectedLayerType,
  backgroundImage,
  backgroundSettings,
  onAvatarSelect,
  onAvatarUpdate,
  onAvatarRemove,
  onAvatarVisibilityToggle,
  onMoveUp,
  onMoveDown,
  onBackgroundSelect,
  onBackgroundUpdate,
  onBackgroundVisibilityToggle
}) => {
  const [avatarBlobUrls, setAvatarBlobUrls] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Avatar blob URL'lerini oluştur
  useEffect(() => {
    const loadAvatarBlobs = async () => {
      const newBlobUrls = {};
      
      for (const avatar of avatars) {
        if (!avatarBlobUrls[avatar.id]) {
          try {
            const originalUrl = `https://unavatar.io/x/${avatar.username}`;
            const blobUrl = await createCorsFreeBlobUrl(originalUrl);
            newBlobUrls[avatar.id] = blobUrl;
          } catch (error) {
            console.error('Avatar blob creation failed:', error);
            newBlobUrls[avatar.id] = `https://unavatar.io/twitter/${avatar.username}`;
          }
        }
      }
      
      if (Object.keys(newBlobUrls).length > 0) {
        setAvatarBlobUrls(prev => ({ ...prev, ...newBlobUrls }));
      }
    };

    if (avatars.length > 0) {
      loadAvatarBlobs();
    }
  }, [avatars, avatarBlobUrls]);

  // Auto-expand when layers are added (mobile UX)
  useEffect(() => {
    if (avatars.length > 0 || backgroundImage) {
      setIsExpanded(true);
    }
  }, [avatars.length, backgroundImage]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)'
  };

  const layerItemStyle = (isSelected) => ({
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: isSelected ? 'var(--accent-primary)15' : 'transparent',
    border: isSelected ? '2px solid var(--accent-primary)' : '2px solid transparent',
    margin: '2px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const thumbnailStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '12px',
    objectFit: 'cover',
    border: '2px solid #ddd'
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    width: '50px',
    padding: '4px 6px',
    border: '1px solid var(--border-color)',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'Sora, sans-serif',
    fontWeight: '200',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  };

  const buttonStyle = {
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'Sora, sans-serif',
    fontWeight: '200',
    minHeight: '32px',
    minWidth: '32px'
  };

  const iconButtonStyle = {
    ...buttonStyle,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  };

  const handlePositionChange = (id, axis, value) => {
    const numValue = parseInt(value) || 0;
    const avatar = avatars.find(a => a.id === id);
    if (avatar) {
      const newPosition = { ...avatar.position, [axis]: numValue };
      onAvatarUpdate(id, { position: newPosition });
    }
  };

  const handleSizeChange = (id, value) => {
    const numValue = parseInt(value) || 32;
    const clampedValue = Math.max(32, Math.min(300, numValue));
    onAvatarUpdate(id, { size: clampedValue });
  };

  // Background Layer Handlers
  const handleBackgroundPositionChange = (axis, value) => {
    const numValue = parseInt(value) || 0;
    const newPosition = { ...backgroundSettings.position, [axis]: numValue };
    onBackgroundUpdate({ position: newPosition });
  };

  const handleBackgroundScaleChange = (value) => {
    const numValue = parseInt(value) || 100;
    const clampedValue = Math.max(10, Math.min(500, numValue));
    onBackgroundUpdate({ scale: clampedValue });
  };

  const layerCount = avatars.length + (backgroundImage ? 1 : 0);

  return (
    <div className={`layer-panel ${isExpanded ? 'expanded' : ''}`}>
      {/* Mobile Handle */}
      <div className="layer-panel-handle" onClick={toggleExpanded}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          Layers ({layerCount})
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)' 
        }}>
          {isExpanded ? 'Tap to minimize' : 'Tap to open layers'}
        </div>
      </div>

      {/* Header (Desktop only) */}
      <div style={headerStyle} className="desktop-only">
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Layers
        </h3>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {layerCount} layer{layerCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Layer List */}
      <div style={{ padding: '10px' }}>
        {avatars.length === 0 && !backgroundImage ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            No layers yet, buddy!<br/>
            Add some avatars to get started! 🎭
          </div>
        ) : (
          <>
            {/* Avatar Layers */}
            {avatars.map((avatar, index) => (
            <div
              key={avatar.id}
              style={layerItemStyle(selectedAvatarId === avatar.id)}
              onClick={() => onAvatarSelect(avatar.id)}
            >
              {/* Layer Header */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={avatarBlobUrls[avatar.id] || `https://unavatar.io/twitter/${avatar.username}`}
                  alt={`@${avatar.username}`}
                  style={thumbnailStyle}
                  onError={(e) => {
                    e.target.src = 'https://unavatar.io/fallback?size=40';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>
                    @{avatar.username}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {avatar.size}px • Z:{avatars.length - index}
                  </div>
                </div>
                
                {/* Visibility Toggle */}
                <button
                  style={{
                    ...iconButtonStyle,
                    backgroundColor: avatar.visible !== false ? '#e8f4f8' : '#f0f0f0'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAvatarVisibilityToggle(avatar.id);
                  }}
                  title={avatar.visible !== false ? 'Hide this layer' : 'Show this layer'}
                >
                  {avatar.visible !== false ? '👁️' : '🚫'}
                </button>
              </div>

              {/* Controls (only show for selected layer) */}
              {selectedAvatarId === avatar.id && (
                <div style={controlsStyle}>
                  {/* Position Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#666' }}>X:</span>
                    <input
                      type="number"
                      value={avatar.position.x}
                      onChange={(e) => handlePositionChange(avatar.id, 'x', e.target.value)}
                      style={inputStyle}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span style={{ fontSize: '11px', color: '#666' }}>Y:</span>
                    <input
                      type="number"
                      value={avatar.position.y}
                      onChange={(e) => handlePositionChange(avatar.id, 'y', e.target.value)}
                      style={inputStyle}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Size Control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#666' }}>Size:</span>
                    <input
                      type="number"
                      min="32"
                      max="300"
                      value={avatar.size}
                      onChange={(e) => handleSizeChange(avatar.id, e.target.value)}
                      style={inputStyle}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Layer Order Controls */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      style={iconButtonStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(avatar.id);
                      }}
                      disabled={index === 0}
                      title="Bring forward"
                    >
                      ⬆️
                    </button>
                    <button
                      style={iconButtonStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(avatar.id);
                      }}
                      disabled={index === avatars.length - 1}
                      title="Send backward"
                    >
                      ⬇️
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#ff4757',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAvatarRemove(avatar.id);
                    }}
                    title="Delete layer (bye bye!)"
                  >
                    🗑️
                  </button>
                </div>
                             )}
             </div>
           ))}

           {/* Background Layer */}
           {backgroundImage && (
             <div
               style={layerItemStyle(selectedLayerType === 'background')}
               onClick={onBackgroundSelect}
             >
               {/* Background Layer Header */}
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <img
                   src={backgroundImage}
                   alt="Background"
                   style={thumbnailStyle}
                 />
                 <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: '500', fontSize: '14px' }}>
                     Background Image
                   </div>
                   <div style={{ fontSize: '11px', color: '#666' }}>
                     {backgroundSettings.scale}% • Z:0
                   </div>
                 </div>
                 
                 {/* Visibility Toggle */}
                 <button
                   style={{
                     ...iconButtonStyle,
                     backgroundColor: backgroundSettings.visible ? '#e8f4f8' : '#f0f0f0'
                   }}
                   onClick={(e) => {
                     e.stopPropagation();
                     onBackgroundVisibilityToggle();
                   }}
                   title={backgroundSettings.visible ? 'Hide background' : 'Show background'}
                 >
                   {backgroundSettings.visible ? '👁️' : '🚫'}
                 </button>
               </div>

               {/* Background Controls (only show for selected background layer) */}
               {selectedLayerType === 'background' && (
                 <div style={controlsStyle}>
                   {/* Position Controls */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <span style={{ fontSize: '11px', color: '#666' }}>X:</span>
                     <input
                       type="number"
                       value={backgroundSettings.position.x}
                       onChange={(e) => handleBackgroundPositionChange('x', e.target.value)}
                       style={inputStyle}
                       onClick={(e) => e.stopPropagation()}
                     />
                     <span style={{ fontSize: '11px', color: '#666' }}>Y:</span>
                     <input
                       type="number"
                       value={backgroundSettings.position.y}
                       onChange={(e) => handleBackgroundPositionChange('y', e.target.value)}
                       style={inputStyle}
                       onClick={(e) => e.stopPropagation()}
                     />
                   </div>

                   {/* Scale Control */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <span style={{ fontSize: '11px', color: '#666' }}>Scale:</span>
                     <input
                       type="number"
                       min="10"
                       max="500"
                       value={backgroundSettings.scale}
                       onChange={(e) => handleBackgroundScaleChange(e.target.value)}
                       style={inputStyle}
                       onClick={(e) => e.stopPropagation()}
                     />
                     <span style={{ fontSize: '10px', color: '#999' }}>%</span>
                   </div>
                 </div>
               )}
             </div>
           )}
           </>
         )}
       </div>
     </div>
   );
 };
 
 export default LayerPanel; 