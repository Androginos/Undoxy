import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import TwitterAvatar from './TwitterAvatar';

const DraggableAvatar = ({ 
  username, 
  initialPosition = { x: 50, y: 50 },
  initialSize = 128,
  isSelected = false,
  zIndex = 1,
  onPositionChange,
  onSizeChange,
  onRemove,
  onSelect,
  id
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef(null);

  const handleDrag = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(id, newPosition);
    }
  };

  const handleMouseDown = (e) => {
    // Resize handle tıklandıysa drag'i engelle
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      return;
    }
    if (onSelect) {
      onSelect(id);
    }
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startSize = size;

    const handleMouseMove = (e) => {
      const delta = e.clientY - startY;
      const newSize = Math.max(32, Math.min(300, startSize + delta));
      setSize(newSize);
      if (onSizeChange) {
        onSizeChange(id, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    }
  };

  // Position ve size değişikliklerini sync et
  React.useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  React.useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const containerStyle = {
    position: 'absolute',
    cursor: isResizing ? 'ns-resize' : 'move',
    userSelect: 'none',
    border: isSelected ? '2px dashed #1da1f2' : 'none',
    borderRadius: '50%',
    padding: isSelected ? '4px' : '0',
    boxSizing: 'content-box',
    zIndex: zIndex,
    touchAction: 'none' // Prevent default touch behaviors
  };

  const controlsStyle = {
    position: 'absolute',
    top: '-35px',
    right: '-15px',
    display: isSelected ? 'flex' : 'none',
    gap: '6px',
    zIndex: 1001
  };

  const buttonStyle = {
    width: window.innerWidth < 768 ? '28px' : '20px',
    height: window.innerWidth < 768 ? '28px' : '20px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: window.innerWidth < 768 ? '14px' : '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    touchAction: 'manipulation'
  };

  const resizeHandleStyle = {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    width: window.innerWidth < 768 ? '24px' : '15px',
    height: window.innerWidth < 768 ? '24px' : '15px',
    backgroundColor: '#1da1f2',
    borderRadius: '50%',
    cursor: 'nw-resize',
    display: isSelected ? 'block' : 'none',
    zIndex: 1002,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    touchAction: 'none'
  };

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      disabled={isResizing}
      nodeRef={dragRef}
    >
      <div 
        ref={dragRef}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown} // Add touch support
      >
        {/* Kontrol Butonları */}
        <div className="avatar-controls" style={controlsStyle}>
          <button
            style={{ ...buttonStyle, backgroundColor: '#ff4757', color: 'white' }}
            onClick={handleRemove}
            title="Remove Avatar"
          >
            ×
          </button>
        </div>

        {/* Avatar */}
        <TwitterAvatar 
          username={username} 
          size={size}
          style={{ pointerEvents: 'none' }}
        />

        {/* Resize Handle */}
        <div
          className="resize-handle"
          style={resizeHandleStyle}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart} // Add touch support
          title="Resize avatar"
        />

        {/* Size Indicator */}
        {isSelected && (
          <div
            className="avatar-controls"
            style={{
              position: 'absolute',
              top: window.innerWidth < 768 ? '-50px' : '-45px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: window.innerWidth < 768 ? '4px 8px' : '2px 6px',
              borderRadius: '4px',
              fontSize: window.innerWidth < 768 ? '12px' : '10px',
              whiteSpace: 'nowrap',
              zIndex: 1001,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            {size}px
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default DraggableAvatar; 