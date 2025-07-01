import React from 'react';
import './InteractiveOverlay.css';
import MagnifyingGlass from './MagnifyingGlass';
import FilesIcon from './FilesIcon';
import FrameIcon from './FrameIcon';
import CigarIcon from './CigarIcon';

const InteractiveOverlay = ({ deviceType }) => {
  // 8 farklı interactive area tanımı
  const interactiveAreas = [
    {
      id: 'area-1',
      name: 'Area 1 - Frame Icon',
      color: 'red',
      content: <FrameIcon 
        deviceType={deviceType} 
        contained={true} 
        customSize={{
          desktop: 300,  // FrameIcon boyutu - desktop
          tablet: 330,   // FrameIcon boyutu - tablet  
          mobile: 100    // FrameIcon boyutu - mobile
        }}
      />
    },
    {
      id: 'area-2', 
      name: 'Area 2 - Cigar Icon',
      color: 'blue',
      content: <CigarIcon 
        deviceType={deviceType} 
        contained={true} 
        customSize={{
          desktop: 300,  // CigarIcon boyutu - desktop
          tablet: 330,   // CigarIcon boyutu - tablet  
          mobile: 100    // CigarIcon boyutu - mobile
        }}
      />
    },
    {
      id: 'area-3',
      name: 'Area 3', 
      color: 'green',
      content: null
    },
    {
      id: 'area-4',
      name: 'Area 4 - Files Icon',
      color: 'yellow',
      content: <FilesIcon 
        deviceType={deviceType} 
        contained={true} 
        customSize={{
          desktop: 300,  // FilesIcon boyutu - desktop
          tablet: 330,   // FilesIcon boyutu - tablet  
          mobile: 100    // FilesIcon boyutu - mobile
        }}
      />
    },
    {
      id: 'area-5',
      name: 'Area 5',
      color: 'purple',
      content: null
    },
    {
      id: 'area-6',
      name: 'Area 6 - Magnifying Glass',
      color: 'orange',
      content: <MagnifyingGlass 
        deviceType={deviceType} 
        contained={true} 
        customSize={{
          desktop: 335,  // MagnifyingGlass boyutu - desktop (büyütüldü)
          tablet: 400,   // MagnifyingGlass boyutu - tablet (büyütüldü)
          mobile: 80     // MagnifyingGlass boyutu - mobile (büyütüldü)15
        }}
        clickableSize="match-png"  // PNG boyutuna eşit tıklama alanı
      />
    },
    {
      id: 'area-7',
      name: 'Area 7',
      color: 'cyan',
      content: null
    },
    {
      id: 'area-8',
      name: 'Area 8',
      color: 'pink',
      content: null
    }
  ];

  return (
    <div className="interactive-overlay-container">
      {interactiveAreas.map((area) => (
        <div 
          key={area.id}
          className={`interactive-debug-area ${area.id} ${deviceType}`}
          data-color={area.color}
          data-name={area.name}
        >
          {/* Debug bilgisi */}
          <div className="debug-label">
            {area.name} ({area.color})
          </div>
          
          {/* İçerik alanı */}
          <div className="area-content">
            {area.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractiveOverlay; 