import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const DraggableBackground = ({ 
  backgroundImage,
  backgroundSettings,
  canvasSize,
  isSelected = false,
  onPositionChange,
  onSelect,
  onScaleChange
}) => {
  const [position, setPosition] = useState(backgroundSettings.position);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef(null);

  // Background settings değiştiğinde position'ı sync et
  useEffect(() => {
    setPosition(backgroundSettings.position);
  }, [backgroundSettings.position]);

  const handleDrag = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleMouseDown = (e) => {
    // Resize handle tıklandıysa drag'i engelle
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      return;
    }
    if (onSelect) {
      onSelect();
    }
  };

  const handleScaleStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startScale = backgroundSettings.scale;

    const handleMouseMove = (e) => {
      const delta = (e.clientY - startY) * -0.5; // Negatif çünkü yukarı = büyüt
      const newScale = Math.max(10, Math.min(500, startScale + delta));
      if (onScaleChange) {
        onScaleChange(newScale);
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

  // Don't render anything if no background image
  if (!backgroundImage || !backgroundSettings.visible) {
    return null;
  }

  // Canvas içindeki overlay style
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: isResizing ? 'ns-resize' : (isSelected ? 'move' : 'pointer'),
    userSelect: 'none',
    border: isSelected ? '2px dashed #1da1f2' : 'none',
    borderRadius: '8px',
    zIndex: isSelected ? 10 : 1, // Seçiliyken üstte olsun
    pointerEvents: 'auto', // Tıklanabilir olsun
    backgroundColor: isSelected ? 'rgba(29, 161, 242, 0.05)' : 'transparent',
    touchAction: 'none' // Prevent default touch behaviors
  };

  const controlsStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: isSelected ? 'flex' : 'none',
    gap: '6px',
    zIndex: 1002
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
    backgroundColor: 'rgba(29, 161, 242, 0.9)',
    color: 'white',
    touchAction: 'manipulation'
  };

  const resizeHandleStyle = {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    width: window.innerWidth < 768 ? '28px' : '20px',
    height: window.innerWidth < 768 ? '28px' : '20px',
    backgroundColor: '#1da1f2',
    borderRadius: '50%',
    cursor: 'nw-resize',
    display: isSelected ? 'block' : 'none',
    zIndex: 1003,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    touchAction: 'none'
  };

  const infoStyle = {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: window.innerWidth < 768 ? '6px 10px' : '4px 8px',
    borderRadius: '6px',
    fontSize: window.innerWidth < 768 ? '12px' : '11px',
    display: isSelected ? 'block' : 'none',
    zIndex: 1001,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
  };

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      disabled={isResizing || !isSelected} // Sadece seçiliyken sürüklenebilir
      nodeRef={dragRef}
    >
      <div 
        ref={dragRef}
        style={overlayStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown} // Add touch support
      >
        {/* Info Display */}
        <div className="avatar-controls" style={infoStyle}>
          Background • {backgroundSettings.scale}%
        </div>

        {/* Scale Control */}
        <div
          className="resize-handle avatar-controls"
          style={resizeHandleStyle}
          onMouseDown={handleScaleStart}
          onTouchStart={handleScaleStart} // Add touch support
          title="Resize (drag up/down with mouse)"
        />

        {/* Selection Indicator - Hidden during export */}
        {isSelected && (
          <div 
            className="selection-indicator avatar-controls" 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(29, 161, 242, 0.1)',
              border: '1px dashed #1da1f2',
              borderRadius: '6px',
              padding: window.innerWidth < 768 ? '10px 16px' : '8px 12px',
              fontSize: window.innerWidth < 768 ? '14px' : '12px',
              color: '#1da1f2',
              fontWeight: '500',
              pointerEvents: 'none',
              boxShadow: '0 2px 6px rgba(29, 161, 242, 0.2)'
            }}>
            Background Selected - Drag Me!
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default DraggableBackground; 