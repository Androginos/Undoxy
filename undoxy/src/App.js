import React, { useState } from 'react';
import CanvasWrapper from './components/CanvasWrapper';
import DraggableAvatar from './components/DraggableAvatar';
import ImageUpload from './components/ImageUpload';
import LayerPanel from './components/LayerPanel';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('desktop');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundSettings, setBackgroundSettings] = useState({
    scale: 100, // %100 = normal boyut
    position: { x: 0, y: 0 }, // center offset
    visible: true
  });
  const [avatars, setAvatars] = useState([]);
  const [twitterInput, setTwitterInput] = useState('');
  const [nextAvatarId, setNextAvatarId] = useState(1);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [selectedLayerType, setSelectedLayerType] = useState(null); // 'background' or 'avatar'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme preference from LocalStorage
    const savedTheme = localStorage.getItem('undoxy-theme');
    return savedTheme === 'dark';
  });

  // Avatar adding magic
  const handleAddAvatar = () => {
    if (!twitterInput.trim()) return;

    const newAvatar = {
      id: nextAvatarId,
      username: twitterInput.trim(),
      position: { 
        x: Math.random() * 200 + 50, 
        y: Math.random() * 200 + 100 
      },
      size: 128,
      visible: true
    };

    setAvatars(prev => [...prev, newAvatar]);
    setSelectedAvatarId(nextAvatarId); // Select the newly added avatar
    setNextAvatarId(prev => prev + 1);
    setTwitterInput('');
  };

  // Avatar removal (goodbye!)
  const handleRemoveAvatar = (id) => {
    setAvatars(prev => prev.filter(avatar => avatar.id !== id));
    if (selectedAvatarId === id) {
      setSelectedAvatarId(null);
    }
  };

  // Avatar position updates
  const handleAvatarPositionChange = (id, newPosition) => {
    setAvatars(prev => 
      prev.map(avatar => 
        avatar.id === id 
          ? { ...avatar, position: newPosition }
          : avatar
      )
    );
  };

  // Avatar size adjustments
  const handleAvatarSizeChange = (id, newSize) => {
    setAvatars(prev => 
      prev.map(avatar => 
        avatar.id === id 
          ? { ...avatar, size: newSize }
          : avatar
      )
    );
  };

  // Layer Panel Handlers
  const handleAvatarSelect = (id) => {
    setSelectedAvatarId(id);
    setSelectedLayerType('avatar');
  };

  const handleBackgroundSelect = () => {
    setSelectedAvatarId(null);
    setSelectedLayerType('background');
  };

  const handleAvatarUpdate = (id, updates) => {
    setAvatars(prev => 
      prev.map(avatar => 
        avatar.id === id 
          ? { ...avatar, ...updates }
          : avatar
      )
    );
  };

  const handleAvatarVisibilityToggle = (id) => {
    setAvatars(prev => 
      prev.map(avatar => 
        avatar.id === id 
          ? { ...avatar, visible: !avatar.visible }
          : avatar
      )
    );
  };

  const handleMoveUp = (id) => {
    setAvatars(prev => {
      const index = prev.findIndex(avatar => avatar.id === id);
      if (index > 0) {
        const newAvatars = [...prev];
        [newAvatars[index], newAvatars[index - 1]] = [newAvatars[index - 1], newAvatars[index]];
        return newAvatars;
      }
      return prev;
    });
  };

  const handleMoveDown = (id) => {
    setAvatars(prev => {
      const index = prev.findIndex(avatar => avatar.id === id);
      if (index < prev.length - 1) {
        const newAvatars = [...prev];
        [newAvatars[index], newAvatars[index + 1]] = [newAvatars[index + 1], newAvatars[index]];
        return newAvatars;
      }
      return prev;
    });
  };

  // Background Layer Handlers
  const handleBackgroundUpdate = (updates) => {
    setBackgroundSettings(prev => ({ ...prev, ...updates }));
  };

  const handleBackgroundVisibilityToggle = () => {
    setBackgroundSettings(prev => ({ ...prev, visible: !prev.visible }));
  };

  const handleBackgroundPositionChange = (newPosition) => {
    setBackgroundSettings(prev => ({ ...prev, position: newPosition }));
  };

  const handleBackgroundScaleChange = (newScale) => {
    setBackgroundSettings(prev => ({ ...prev, scale: newScale }));
  };

  const handleCanvasClick = () => {
    // Clear all selections when canvas is clicked
    setSelectedAvatarId(null);
    setSelectedLayerType(null);
  };

  // Twitter input handlers
  const handleTwitterInputChange = (e) => {
    const value = e.target.value;
    
    // Ensure it starts with @, but allow user to delete if they want
    if (value === '' || value.startsWith('@')) {
      setTwitterInput(value);
    } else {
      setTwitterInput('@' + value);
    }
  };

  const handleTwitterInputFocus = () => {
    // Add @ if input is empty
    if (twitterInput === '') {
      setTwitterInput('@');
    }
  };

  // Theme handlers
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('undoxy-theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Add avatar with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddAvatar();
    }
  };

  // Clear all (nuclear option)
  const handleClearAll = () => {
    setAvatars([]);
    setBackgroundImage(null);
    setBackgroundSettings({
      scale: 100,
      position: { x: 0, y: 0 },
      visible: true
    });
    setSelectedAvatarId(null);
    setSelectedLayerType(null);
  };

  const headerStyle = {
    backgroundColor: 'var(--bg-primary)',
    padding: '15px 20px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '0'
  };

  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Sora, sans-serif',
    fontWeight: '300',
    minWidth: '200px',
    flex: '1',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    transition: 'border-color 0.3s ease'
  };

  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Sora, sans-serif',
    fontWeight: '200', // Sora-Thin
    transition: 'background-color 0.3s ease',
    minWidth: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const clearButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--danger)',
    fontSize: '14px'
  };

  const statsStyle = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '8px'
  };

  return (
    <div className="App">
      {/* Layer Panel */}
      <LayerPanel
        avatars={avatars}
        selectedAvatarId={selectedAvatarId}
        selectedLayerType={selectedLayerType}
        backgroundImage={backgroundImage}
        backgroundSettings={backgroundSettings}
        onAvatarSelect={handleAvatarSelect}
        onAvatarUpdate={handleAvatarUpdate}
        onAvatarRemove={handleRemoveAvatar}
        onAvatarVisibilityToggle={handleAvatarVisibilityToggle}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onBackgroundSelect={handleBackgroundSelect}
        onBackgroundUpdate={handleBackgroundUpdate}
        onBackgroundVisibilityToggle={handleBackgroundVisibilityToggle}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        {/* Logo - Sol üst köşe */}
        <div className="top-logo">
          <img src="/logo.png" alt="UnDoxy Logo" className="top-logo-img" />
        </div>

        <header className="app-header">
          
          <div className="header-controls">
            {/* Twitter Avatar Input */}
            <div className="twitter-input-row">
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '500',
                color: 'var(--text-primary)',
                minWidth: 'fit-content'
              }}>
                Twitter:
              </span>
              <input
                type="text"
                value={twitterInput}
                onChange={handleTwitterInputChange}
                onFocus={handleTwitterInputFocus}
                onKeyPress={handleKeyPress}
                placeholder="@username"
              />
              <button
                onClick={handleAddAvatar}
                disabled={!twitterInput.trim()}
                title="Add avatar (let's go!)"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none'
                }}
              >
                +
              </button>
              
              {avatars.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Nuke everything!"
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Theme Toggle & View Mode Controls */}
            <div className="view-mode-controls">
              <button
                onClick={toggleTheme}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                className="theme-toggle-btn"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex !important',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minWidth: '44px',
                  minHeight: '36px',
                  padding: '8px 12px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  visibility: 'visible',
                  opacity: '1',
                  zIndex: '100'
                }}
              >
                {isDarkMode ? '☀️' : '🌙'}
                <span className="desktop-only">{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-text">
            {avatars.length > 0 ? (
              `${avatars.length} avatar${avatars.length > 1 ? 's' : ''} • Click, drag, and resize like a boss!`
            ) : (
              <div>
                <div>Enter a Twitter username to get this party started! 🎉</div>
                <div className="quick-start-inline">
                  <strong>Quick Start:</strong> 1. Add background photo → 2. Enter X username → + Click/Enter → 3. Drag and Resize PFPs → 4. Save with Download
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Image Upload */}
        <ImageUpload 
          onImageSelect={(image) => {
            setBackgroundImage(image);
            if (image) {
              // Select background layer when image is loaded
              setSelectedLayerType('background');
              setSelectedAvatarId(null);
            }
          }}
          currentImage={backgroundImage}
        />

        {/* Canvas Container */}
        <div className="canvas-container">
          <CanvasWrapper
            viewMode={viewMode}
            backgroundImage={backgroundImage}
            backgroundSettings={backgroundSettings}
            selectedLayerType={selectedLayerType}
            onBackgroundSelect={handleBackgroundSelect}
            onBackgroundPositionChange={handleBackgroundPositionChange}
            onBackgroundScaleChange={handleBackgroundScaleChange}
            onCanvasClick={handleCanvasClick}
            onExport={(blob, canvas) => {
              console.log('Canvas export edildi:', { blob, canvas });
            }}
          >
            {/* Draggable Avatars */}
            {avatars.map((avatar, index) => (
              avatar.visible !== false && (
                <DraggableAvatar
                  key={avatar.id}
                  id={avatar.id}
                  username={avatar.username}
                  initialPosition={avatar.position}
                  initialSize={avatar.size}
                  isSelected={selectedAvatarId === avatar.id}
                  zIndex={avatars.length - index} // Son eklenen en üstte
                  onPositionChange={handleAvatarPositionChange}
                  onSizeChange={handleAvatarSizeChange}
                  onRemove={handleRemoveAvatar}
                  onSelect={handleAvatarSelect}
                />
              )
            ))}
          </CanvasWrapper>
        </div>
      </div> {/* Main Content kapanış */}
    </div>
  );
}

export default App; 