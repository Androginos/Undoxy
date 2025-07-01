import React from "react";
import "./ShelfIcon.css";

const ShelfIcon = ({ deviceType, position, customSize, contained = false, clickableSize }) => {
  // Device-specific sizing - Easy to customize
  const sizes = {
    desktop: customSize || 600,   
    tablet: customSize || 450,    
    mobile: customSize || 200      
  };

  // Device-specific positioning - Easy to customize
  const positions = {
    desktop: position || { 
      top: "50%",    
      left: "50%",   
      transform: "translate(-50%, -50%)" 
    },
    tablet: position || { 
      top: "50%",    
      left: "50%",   
      transform: "translate(-50%, -50%)"
    },
    mobile: position || { 
      top: "50%",    
      left: "50%",   
      transform: "translate(-50%, -50%)"
    }
  };

  const currentSize = sizes[deviceType] || sizes.desktop;
  const currentPosition = positions[deviceType] || positions.desktop;

  // Contained mode için boyut ayarlaması
  const containedSizes = {
    desktop: 80,   
    tablet: 60,    
    mobile: 40     
  };

  // CustomSize objesi varsa ve contained modda ise, customSize'dan al
  let finalSize;
  if (contained && customSize && typeof customSize === 'object') {
    finalSize = customSize[deviceType] || containedSizes[deviceType];
  } else if (contained) {
    finalSize = containedSizes[deviceType];
  } else {
    finalSize = currentSize;
  }

  // PNG boyutuna eşit tıklama alanı için özel mod
  let wrapperWidth, wrapperHeight;
  if (clickableSize === 'match-png') {
    // PNG boyutuna tam eşit tıklama alanı
    wrapperWidth = wrapperHeight = finalSize;
  } else if (clickableSize && typeof clickableSize === 'object') {
    const deviceClickSize = clickableSize[deviceType];
    if (deviceClickSize && typeof deviceClickSize === 'object') {
      // {desktop: {width: 100, height: 50}} formatı
      wrapperWidth = deviceClickSize.width || finalSize;
      wrapperHeight = deviceClickSize.height || finalSize;
    } else if (typeof deviceClickSize === 'number') {
      // {desktop: 100} formatı (kare)
      wrapperWidth = wrapperHeight = deviceClickSize;
    } else {
      // Varsayılan
      wrapperWidth = wrapperHeight = contained ? Math.max(finalSize * 0.8, finalSize - 20) : finalSize;
    }
  } else if (clickableSize && typeof clickableSize === 'number') {
    // Tek sayı (kare)
    wrapperWidth = wrapperHeight = clickableSize;
  } else {
    // Varsayılan: PNG'ye daha yakın boyut
    wrapperWidth = wrapperHeight = contained ? Math.max(finalSize * 0.8, finalSize - 20) : finalSize;
  }

  if (contained) {
    // Area içinde kullanım - sadece wrapper
    return (
      <div 
        className={`shelf-icon-wrapper contained ${clickableSize === 'match-png' ? 'match-png-clickable' : ''}`}
        style={{ 
          width: `${wrapperWidth}px`,
          height: `${wrapperHeight}px`,
          cursor: 'pointer'
        }}
      >
        <img 
          src="/shelf.png" 
          alt="Shelf" 
          className="shelf-icon-image"
          style={{
            width: `${finalSize}px`,
            height: `${finalSize}px`,
            pointerEvents: 'auto'
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Debug positioning container - responsive div */}
      <div className="shelf-icon-debug-container">
        <div 
          className="shelf-icon-wrapper" 
          style={{ 
            width: `${wrapperWidth}px`,
            height: `${wrapperHeight}px`,
            cursor: 'pointer'
          }}
        >
          <img 
            src="/shelf.png" 
            alt="Shelf" 
            className="shelf-icon-image" 
          />
        </div>
      </div>
    </>
  );
};

export default ShelfIcon; 