import React from "react";
import "./CamIcon.css";

const CamIcon = ({ deviceType, position, customSize, contained = false }) => {
  // Device-specific sizing - Easy to customize
  const sizes = {
    desktop: customSize || 600,   // Desktop boyutu
    tablet: customSize || 450,    // Tablet boyutu
    mobile: customSize || 200     // Mobile boyutu
  };

  // Device-specific positioning - Easy to customize
  const positions = {
    desktop: position || { 
      top: "44.3%",    // Vertical position
      left: "67.1%",   // Horizontal position
      transform: "translate(-50%, -50%)"
    },
    tablet: position || { 
      top: "41%",
      left: "84%",
      transform: "translate(-50%, -50%)"
    },
    mobile: position || { 
      top: "45.7%",
      left: "84.1%",
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

  if (contained) {
    // Area içinde kullanım - sadece wrapper
    return (
      <div 
        className="cam-icon-wrapper contained" 
        style={{ 
          width: `${finalSize}px`,
          height: `${finalSize}px`,
          cursor: 'pointer'
        }}
      >
        <img 
          src="/cam.png" 
          alt="Cam Icon" 
          className="cam-icon-image" 
        />
      </div>
    );
  }

  return (
    <>
      {/* Debug positioning container - responsive div */}
      <div className="cam-icon-debug-container">
        <div 
          className="cam-icon-wrapper" 
          style={{ 
            width: `${currentSize}px`,
            height: `${currentSize}px`,
            cursor: 'pointer'
          }}
        >
          <img 
            src="/cam.png" 
            alt="Cam Icon" 
            className="cam-icon-image" 
          />
        </div>
      </div>
    </>
  );
};

export default CamIcon; 