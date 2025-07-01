import React, { useEffect, useRef, useState } from 'react';
import './FixedWorkspace.css';
import MagnifyingGlass from './MagnifyingGlass';
import FilesIcon from './FilesIcon';
import FrameIcon from './FrameIcon';
import CigarIcon from './CigarIcon';
import CamIcon from './CamIcon';
import ShelfIcon from './ShelfIcon';
import LightSystem from './LightSystem';

const FixedWorkspace = () => {
  const canvasRef = useRef(null);
  const [activeLight, setActiveLight] = useState(null);

  // Sabit virtual canvas boyutları - Pixi.js mantığı
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;

  // Fixed virtual canvas + autoscale sistemi
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;
      const scale = Math.min(scaleX, scaleY); // Aspect ratio korunarak ölçekle

      // Canvas'ı ölçekle
      canvasRef.current.style.transform = `scale(${scale})`;
      canvasRef.current.style.transformOrigin = 'top left';

      // Merkeze yerleştir
      const scaledWidth = BASE_WIDTH * scale;
      const scaledHeight = BASE_HEIGHT * scale;
      canvasRef.current.style.left = `${(window.innerWidth - scaledWidth) / 2}px`;
      canvasRef.current.style.top = `${(window.innerHeight - scaledHeight) / 2}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="virtual-canvas-container">
      <div ref={canvasRef} className="virtual-canvas">
        {/* Sabit background - 1920x1080 için tasarlandı */}
        <img 
          src="/169bg.png" 
          alt="Table Background" 
          className="canvas-background" 
        />
        
        {/* Light System - Canvas içinde absolute position */}
        <LightSystem activeLight={activeLight} />
        
        {/* Sağ alt köşede öğeler - Wrapper ile pozisyon kontrolü */}
        <div 
          className="item-wrapper magnifier-wrapper"
          style={{
            position: 'absolute',
            bottom: '608.5px',  // Canvas alt kısmından 100px yukarı
            right: '533.5px',   // Canvas sağ kısmından içeri (shadow için alan)
            width: '200px',   // Scale + shadow efekti için büyütüldü  
            height: '100px',  // Scale + shadow efekti için büyütüldü
            border: '1px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('magnifier')}
          onMouseLeave={() => setActiveLight(null)}>
          <MagnifyingGlass 
            contained={true}
            customSize={400}
            clickableSize="match-png"
          />
        </div>
        
        <div 
          className="item-wrapper files-wrapper"
          style={{
            position: 'absolute',
            bottom: '700px',  // Canvas alt kısmından 100px yukarı
            right: '493.5px',   // MagnifyingGlass'ın solunda
            width: '300px',
            height: '220px',
            border: '3px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('files')}
          onMouseLeave={() => setActiveLight(null)}>
          <FilesIcon 
            contained={true}
            customSize={300}
          />
        </div>
        
        <div 
          className="item-wrapper frame-wrapper"
          style={{
            position: 'absolute',
            bottom: '787px',  // Yukarı taşındı (400px'den 550px'e)
            right: '813px',   // Başka bir pozisyon
            width: '200px',   // 300px'den 150px'e küçültüldü
            height: '140px',  // 300px'den 150px'e küçültüldü
            border: '3px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('frame')}
          onMouseLeave={() => setActiveLight(null)}>
          <FrameIcon 
            contained={true}
            customSize={300}
          />
        </div>
        
        <div 
          className="item-wrapper cigar-wrapper"
          style={{
            position: 'absolute',
            bottom: '574px',  // Alt kısımda
            right: '1066.5px',   // Farklı bir pozisyon
            width: '205px',
            height: '120px',
            border: '3px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('cigar')}
          onMouseLeave={() => setActiveLight(null)}>
          <CigarIcon 
            contained={true}
            customSize={300}
          />
        </div>
        
        <div 
          className="item-wrapper shelf-wrapper"
          style={{
            position: 'absolute',
            bottom: '341px',  // Başlangıç pozisyonu - sen ayarlayacaksın
            right: '1170px',   // Başlangıç pozisyonu - sen ayarlayacaksın  
            width: '300px',
            height: '200px',
            border: '3px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('shelf')}
          onMouseLeave={() => setActiveLight(null)}>
          <ShelfIcon 
            contained={true}
            customSize={300}
            clickableSize="match-png"
          />
        </div>
        
        <div 
          className="item-wrapper cam-wrapper"
          style={{
            position: 'absolute',
            bottom: '559px',  // Başlangıç pozisyonu - sen ayarlayacaksın
            right: '1228px',   // Başlangıç pozisyonu - sen ayarlayacaksın  
            width: '200px',
            height: '140px',
            border: '3px transparent', // Debug için görünür border
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible' // Scale efekti için kırpılmayı engelle
          }}
          onMouseEnter={() => setActiveLight('cam')}
          onMouseLeave={() => setActiveLight(null)}>
          <CamIcon 
            contained={true}
            customSize={300}
          />
        </div>
        
        {/* Canvas boyutunu görmek için debug border */}
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '1920px',
          height: '1080px',
          border: '5px transparent',
          pointerEvents: 'none',
          zIndex: 5
        }} />
        
        {/* Daha fazla öğe eklenebilir - hepsi 1920x1080 koordinat sisteminde */}
      </div>
    </div>
  );
};

export default FixedWorkspace; 