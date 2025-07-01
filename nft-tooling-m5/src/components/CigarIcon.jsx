import React, { useRef, useEffect, useState } from "react";
import "./CigarIcon.css";

const CigarIcon = ({ deviceType, position, customSize, contained = false }) => {
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const particles = useRef([]);
  const lastFrameTime = useRef(0);
  const animationRef = useRef(null);

  // Device-specific sizing - Easy to customize
  const sizes = {
    desktop: customSize || 450,   // Desktop boyutu (600'den küçültüldü)
    tablet: customSize || 350,    // Tablet boyutu (450'den küçültüldü)
    mobile: customSize || 150     // Mobile boyutu (200'den küçültüldü)
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
    desktop: 60,   // Area boyutuna uygun (80'den küçültüldü)
    tablet: 45,    // Area boyutuna uygun (60'dan küçültüldü)
    mobile: 30     // Area boyutuna uygun (40'dan küçültüldü)
  };

  // CustomSize objesi varsa ve contained modda ise, customSize'dan al
  let finalSize;
  if (contained && customSize && typeof customSize === 'object') {
    finalSize = customSize[deviceType] || containedSizes[deviceType || 'desktop'];
  } else if (contained && typeof customSize === 'number') {
    finalSize = customSize; // Direkt number verilmişse
  } else if (contained) {
    finalSize = containedSizes[deviceType || 'desktop'];
  } else {
    finalSize = currentSize;
  }
  
  // Fallback kontrolü
  if (!finalSize || isNaN(finalSize)) {
    finalSize = contained ? 300 : 600;
  }

  // Duman parçacığı oluşturma fonksiyonu
  const createParticle = (x, y) => {
    // Duman düz yukarı çıksın (90° = π/2) ama hafif rastgele sapma
    const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 12; // 90° ± 15°
    const speed = 1.2 + Math.random() * 0.8; // Daha hızlı = daha kısa
          return {
        x,
        y,
        alpha: 0.6, // Daha şeffaf başlangıç
        size: 3 + Math.random() * 4, // Biraz daha büyük parçacıklar (3-7px)
        dx: speed * Math.cos(angle), // Çok az yatay hareket
        dy: -speed * Math.sin(angle), // Yukarı doğru (negatif Y)
      };
  };

  // Duman animasyon sistemi
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = contained ? finalSize : currentSize;
    
    // Debug: Sadece ilk seferde kontrol et
    if (particles.current.length === 0) {
      console.log('🚬 CigarIcon initialized:', { contained, finalSize, currentSize, size });
    }
    
    // Size kontrolü ve fallback
    const safeSize = size && !isNaN(size) ? size : 300;
    const cigarX = safeSize / 2 - 32; // Merkeze hizala
    const cigarY = safeSize / 2 - 32; // Merkeze hizala

          const updateParticles = () => {
        if (isHovering) {
          // Duman üretimi - aralıklı sigara dumanı (her frame değil)
          if (Math.random() < 0.7) { // %30 şansla parçacık üret (daha aralıklı)
            particles.current.push(createParticle(cigarX + -47, cigarY + 26)); // Daha uca yakın
          }
        }
      
              // Parçacıkları güncelle ve temizle
        particles.current = particles.current.filter(p => p.alpha > 0);
        particles.current.forEach(p => {
          // Rüzgar efekti - yukarı çıkarken hafif sağa sürüklenme
          const windEffect = Math.sin(Date.now() / 600 + p.x / 80) * 0.2;
          p.x += p.dx + windEffect;
          p.y += p.dy;
          p.alpha -= 0.012; // Daha hızlı solma = daha kısa duman
          p.size *= 1.003; // Çok hafif büyüme
        });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Debug sadece ilk çalıştırmada (artık debug logları kaldırabiliriz)
      // Canvas temizle
      

      // Duman parçacıklarını çiz - hafif, şeffaf duman efekti
      particles.current.forEach((p, index) => {
        const opacity = p.alpha * 0.4; // Çok daha şeffaf duman
        
        // Ana duman parçacığı - daha açık renk
        ctx.beginPath();
        ctx.fillStyle = `rgba(180, 180, 180, ${opacity})`; // Açık gri
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Hafif glow efekti - çok ince
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 200, 200, ${opacity * 0.2})`; // Çok açık glow
        ctx.arc(p.x, p.y, p.size + 1, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = (timestamp) => {
      if (timestamp - lastFrameTime.current > 16) { // ~60fps
        updateParticles();
        drawParticles();
        lastFrameTime.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering, contained, finalSize, currentSize]);

  // Hover event handlers
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  const handleTouchStart = () => setIsHovering(true);
  const handleTouchEnd = () => setIsHovering(false);

  if (contained) {
    // Area içinde kullanım - duman efektli wrapper
    return (
      <div 
        className="cigar-icon-wrapper contained" 
        style={{ 
          width: `${finalSize}px`,
          height: `${finalSize}px`,
          cursor: 'pointer',
          position: 'relative'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cigar görseli - hover'da değişir */}
        <img 
          src={isHovering ? "/burncigar.png" : "/cigar.png"}
          alt={isHovering ? "Burning Cigar Icon" : "Cigar Icon"}
          className="cigar-icon-image" 
          style={{
            position: 'relative',
            zIndex: 2,
            transition: 'opacity 0.2s ease-in-out' // Yumuşak geçiş
          }}
        />
        
        {/* Duman efekti canvas'ı */}
        <canvas
          ref={canvasRef}
          width={finalSize || 300}
          height={finalSize || 300}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 3 // Cigar'ın üstünde
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Debug positioning container - responsive div */}
      <div className="cigar-icon-debug-container">
        <div 
          className="cigar-icon-wrapper" 
          style={{ 
            width: `${currentSize}px`,
            height: `${currentSize}px`,
            cursor: 'pointer',
            position: 'relative'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Cigar görseli - hover'da değişir */}
          <img 
            src={isHovering ? "/burncigar.png" : "/cigar.png"}
            alt={isHovering ? "Burning Cigar Icon" : "Cigar Icon"}
            className="cigar-icon-image"
            style={{
              position: 'relative',
              zIndex: 2,
              transition: 'opacity 0.2s ease-in-out' // Yumuşak geçiş
            }}
          />
          
          {/* Duman efekti canvas'ı */}
          <canvas
            ref={canvasRef}
            width={currentSize || 300}
            height={currentSize || 300}
                          style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 3 // Cigar'ın üstünde
              }}
          />
        </div>
      </div>
    </>
  );
};

export default CigarIcon; 