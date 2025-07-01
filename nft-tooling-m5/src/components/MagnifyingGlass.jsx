import React from "react";
import "./MagnifyingGlass.css";

const MagnifyingGlass = ({ deviceType, position, customSize, contained = false, clickableSize }) => {
  // Device-specific sizing - Easy to customize
  const sizes = {
    desktop: customSize || 600,   // 140x140 pixels for desktop (büyütüldü)
    tablet: customSize || 450,    // 120x120 pixels for tablet (büyütüldü)
    mobile: customSize || 200      // 80x80 pixels for mobile (büyütüldü)
  };

  // Device-specific positioning - Easy to customize
  const positions = {
    desktop: position || { 
      top: "44.3%",    // Vertical position (0% = top, 50% = center, 100% = bottom)
      left: "67.1%",   // Horizontal position (0% = left, 50% = center, 100% = right)
      transform: "translate(-50%, -50%)" // Center the element at the position
    },
    tablet: position || { 
      top: "41%",    // Customize this for tablet
      left: "84%",   // Customize this for tablet
      transform: "translate(-50%, -50%)"
    },
    mobile: position || { 
      top: "45.7%",    // Customize this for mobile
      left: "84.1%",   // Customize this for mobile
      transform: "translate(-50%, -50%)"
    }
  };

  const currentSize = sizes[deviceType] || sizes.desktop;
  const currentPosition = positions[deviceType] || positions.desktop;

  // Contained mode için boyut ayarlaması
  const containedSizes = {
    desktop: 80,   // Area boyutuna uygun
    tablet: 60,    // Area boyutuna uygun  
    mobile: 40     // Area boyutuna uygun
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
        className={`magnifying-glass-wrapper contained ${clickableSize === 'match-png' ? 'match-png-clickable' : ''}`}
        style={{ 
          width: `${wrapperWidth}px`,
          height: `${wrapperHeight}px`,
          cursor: 'pointer'
        }}
      >
        <img 
          src="/magnifying_glass.png" 
          alt="Magnifying Glass" 
          className="magnifying-glass-image"
          style={{
            width: `${finalSize}px`,
            height: `${finalSize}px`,
            pointerEvents: 'none' // PNG'yi tıklanamaz yap
          }}
        />
        
        {/* PNG şeklinde tıklama alanı - büyüteç şekli */}
        <svg 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${finalSize}px`,
            height: `${finalSize}px`,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          viewBox="0 0 100 100"
        >
          {/* Büyüteç şekli - daire + sap */}
          <circle 
            cx="35" 
            cy="35" 
            r="25" 
            fill="transparent" 
            style={{ pointerEvents: 'auto' }}
          />
          <rect 
            x="55" 
            y="55" 
            width="8" 
            height="35" 
            rx="4"
            fill="transparent"
            transform="rotate(45 59 72.5)"
            style={{ pointerEvents: 'auto' }}
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* Debug positioning container - responsive div */}
      <div className="magnifying-glass-debug-container">
        <div 
          className="magnifying-glass-wrapper" 
          style={{ 
            width: `${wrapperWidth}px`,
            height: `${wrapperHeight}px`,
            cursor: 'pointer'
          }}
        >
          <img 
            src="/magnifying_glass.png" 
            alt="Magnifying Glass" 
            className="magnifying-glass-image" 
          />
        </div>
      </div>
    </>
  );
};

export default MagnifyingGlass; 