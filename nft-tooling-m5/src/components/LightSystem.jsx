import React from "react";
import "./LightSystem.css";

const LightSystem = ({ activeLight }) => {
  const lights = [
    { id: 'magnifier', src: '/magnifierlight.png', alt: 'Magnifier Light' },
    { id: 'files', src: '/fileslight.png', alt: 'Files Light' },
    { id: 'frame', src: '/framelight.png', alt: 'Frame Light' },
    { id: 'cigar', src: '/cigarlight.png', alt: 'Cigar Light' },
    { id: 'cam', src: '/camlight.png', alt: 'Cam Light' },
    { id: 'shelf', src: '/shelflight.png', alt: 'Shelf Light' }
  ];

  return (
    <div className="light-system-container">
      {lights.map((light) => (
        <img 
          key={light.id}
          src={light.src}
          alt={light.alt}
          className={`light-image ${activeLight === light.id ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};

export default LightSystem; 