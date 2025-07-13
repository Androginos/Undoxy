import React, { useRef, useState } from 'react';
import { createCorsFreeBlobUrl } from '../utils/twitterAvatar';

const ImageUpload = ({ onImageSelect, currentImage }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (onImageSelect) {
          // DataURL zaten CORS-safe, direkt kullan
          onImageSelect(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    marginBottom: '12px',
    flexWrap: 'wrap'
  };

  const uploadAreaStyle = {
    border: `1px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
    borderRadius: '4px',
    padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragOver ? 'var(--accent-primary)15' : 'var(--bg-secondary)',
    transition: 'all 0.3s ease',
    minWidth: window.innerWidth < 768 ? '80px' : '120px',
    fontSize: '12px'
  };

  const buttonStyle = {
    padding: window.innerWidth < 768 ? '6px 8px' : '4px 8px',
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'Sora, sans-serif',
    fontWeight: '200' // Sora-Thin
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--danger)',
    marginLeft: '6px'
  };

  const thumbnailStyle = {
    width: window.innerWidth < 768 ? '28px' : '32px',
    height: window.innerWidth < 768 ? '28px' : '32px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid var(--border-color)'
  };

  return (
    <div style={containerStyle}>
      <span style={{ 
        fontSize: window.innerWidth < 768 ? '12px' : '13px', 
        fontWeight: '500',
        color: 'var(--text-primary)',
        minWidth: 'fit-content'
      }}>
        Background:
      </span>
      
      <div
        style={uploadAreaStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div style={{ fontSize: '14px', marginBottom: '2px' }}>📷</div>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
          Pick Image
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {currentImage && (
        <>
          <img 
            src={currentImage} 
            alt="Background preview" 
            style={thumbnailStyle}
          />
          <button
            style={removeButtonStyle}
            onClick={handleRemoveImage}
            title="Remove background image"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUpload; 