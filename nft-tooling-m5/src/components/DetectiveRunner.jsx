import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DetectiveRunner.css';

const DetectiveRunner = () => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  // ========== MANUEL AYARLAR - BURADAN DEĞİŞTİRİN ==========
  
  // Dedektif Boyutu (tüm cihaz tiplerinde orantılı olarak uygulanır)
  const DETECTIVE_SCALE = 3.5; // 0.5 = yarı boyut, 1.0 = normal, 2.0 = iki kat büyük
  
  // Yamuk Hareket Alanı Koordinatları (ekran yüzdesi olarak 0-1 arası)
  // 0.0 = ekranın sol/üst kenarı, 1.0 = ekranın sağ/alt kenarı
  const TRAPEZOID_COORDS = {
    topLeft: { x: 0.32, y: 0.63 },     // Sol üst köşe (x: %15, y: %65)
    topRight: { x: 0.70, y: 0.63 },    // Sağ üst köşe (x: %85, y: %65)
    bottomLeft: { x: 0.12, y: 0.93 },   // Sol alt köşe (x: %25, y: %90)
    bottomRight: { x: 0.95, y: 0.93 }   // Sağ alt köşe (x: %75, y: %90)
  };
  
  /* 
  ÖRNEK YAMUK ŞEKİLLERİ:
  
  Normal Yamuk (üstte dar, altta geniş):
  topLeft: { x: 0.2, y: 0.6 }, topRight: { x: 0.8, y: 0.6 }
  bottomLeft: { x: 0.1, y: 0.9 }, bottomRight: { x: 0.9, y: 0.9 }
  
  Ters Yamuk (üstte geniş, altta dar):
  topLeft: { x: 0.1, y: 0.6 }, topRight: { x: 0.9, y: 0.6 }
  bottomLeft: { x: 0.2, y: 0.9 }, bottomRight: { x: 0.8, y: 0.9 }
  
  Dikdörtgen:
  topLeft: { x: 0.1, y: 0.5 }, topRight: { x: 0.9, y: 0.5 }
  bottomLeft: { x: 0.1, y: 0.9 }, bottomRight: { x: 0.9, y: 0.9 }
  */
  
  // ========================================================

  const [gameConfig, setGameConfig] = useState({
    canvasWidth: 800,
    canvasHeight: 400,
    detectiveWidth: 80,
    detectiveHeight: 100,
    detectiveScale: DETECTIVE_SCALE,
    movementSpeed: 3,
    diagonalSpeedMultiplier: 0.7,
    trapezoidCoords: TRAPEZOID_COORDS
  });

  const frameCount = 8;
  const frameRate = 120; // milliseconds per frame
  const currentFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const detectiveXRef = useRef(400); // Başlangıç pozisyonu (sonra güncellenir)
  const detectiveYRef = useRef(300);
  const velocityXRef = useRef(0);
  const velocityYRef = useRef(0);
  const isTouchingRef = useRef(false);
  const keysRef = useRef({});

  // Bir noktanın yamuk alan içinde olup olmadığını kontrol et
  const isPointInTrapezoid = useCallback((x, y, trapezoid) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = trapezoid;
    
    // Y koordinatına göre sol ve sağ sınırları hesapla
    const topY = Math.min(topLeft.y, topRight.y);
    const bottomY = Math.max(bottomLeft.y, bottomRight.y);
    
    // Y sınırlarını kontrol et
    if (y < topY || y > bottomY) return false;
    
    // Y pozisyonuna göre interpolasyon yaparak sol ve sağ sınırları bul
    const ratio = (y - topY) / (bottomY - topY);
    const leftX = topLeft.x + (bottomLeft.x - topLeft.x) * ratio;
    const rightX = topRight.x + (bottomRight.x - topRight.x) * ratio;
    
    // X sınırlarını kontrol et - biraz tolerans ekle
    const tolerance = 15; // piksel toleransı (büyük karakterler için artırıldı)
    return x >= (leftX - tolerance) && x <= (rightX + tolerance);
  }, []);



  // Responsive konfigürasyon belirleme
  const calculateGameConfig = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let config;
    
    // Manuel olarak belirlenen yamuk koordinatlarını al
    const coords = TRAPEZOID_COORDS;
    
    // Yamuk alanı piksel koordinatlarına çevir
    const trapezoidArea = {
      topLeft: { x: width * coords.topLeft.x, y: height * coords.topLeft.y },
      topRight: { x: width * coords.topRight.x, y: height * coords.topRight.y },
      bottomLeft: { x: width * coords.bottomLeft.x, y: height * coords.bottomLeft.y },
      bottomRight: { x: width * coords.bottomRight.x, y: height * coords.bottomRight.y }
    };

    if (width <= 768) {
      // Mobil cihazlar
      config = {
        canvasWidth: width,
        canvasHeight: height,
        detectiveWidth: 60 * DETECTIVE_SCALE,
        detectiveHeight: 75 * DETECTIVE_SCALE,
        detectiveScale: DETECTIVE_SCALE,
        trapezoidArea,
        trapezoidCoords: TRAPEZOID_COORDS,
        movementSpeed: 2,
        diagonalSpeedMultiplier: 0.7
      };
    } else if (width <= 1024) {
      // Tablet cihazlar
      config = {
        canvasWidth: width,
        canvasHeight: height,
        detectiveWidth: 80 * DETECTIVE_SCALE,
        detectiveHeight: 100 * DETECTIVE_SCALE,
        detectiveScale: DETECTIVE_SCALE,
        trapezoidArea,
        trapezoidCoords: TRAPEZOID_COORDS,
        movementSpeed: 2.5,
        diagonalSpeedMultiplier: 0.7
      };
    } else {
      // Masaüstü
      config = {
        canvasWidth: width,
        canvasHeight: height,
        detectiveWidth: 100 * DETECTIVE_SCALE,
        detectiveHeight: 125 * DETECTIVE_SCALE,
        detectiveScale: DETECTIVE_SCALE,
        trapezoidArea,
        trapezoidCoords: TRAPEZOID_COORDS,
        movementSpeed: 3,
        diagonalSpeedMultiplier: 0.7
      };
    }
    
    return config;
  }, []);

  // Görüntüleri yükleme
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = [];
      const imagePromises = [];

      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load Run_0${i}.png`));
        });
        img.src = `/Run/Run_0${i}.png`;
        loadedImages.push(img);
        imagePromises.push(promise);
      }

      try {
        await Promise.all(imagePromises);
        setImages(loadedImages);
      } catch (error) {
        console.error('Görüntüler yüklenirken hata:', error);
      }
    };

    loadImages();
  }, []);

  // Responsive konfigürasyonu güncelleme
  useEffect(() => {
    const updateConfig = () => {
      const newConfig = calculateGameConfig();
      setGameConfig(newConfig);
      
      // Dedektif pozisyonunu yamuk alan merkezinde başlat (en alt nokta baz alınarak)
      const area = newConfig.trapezoidArea;
      const centerX = (area.topLeft.x + area.topRight.x + area.bottomLeft.x + area.bottomRight.x) / 4;
      const centerY = (area.topLeft.y + area.topRight.y + area.bottomLeft.y + area.bottomRight.y) / 4;
      
      // Dedektifin en alt noktası merkez olacak şekilde pozisyonu ayarla
      detectiveXRef.current = centerX - newConfig.detectiveWidth / 2;  // X: sol üst köşe
      detectiveYRef.current = centerY - newConfig.detectiveHeight;     // Y: en alt nokta merkez olacak şekilde
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    
    return () => window.removeEventListener('resize', updateConfig);
  }, [calculateGameConfig]);

  // Oyun kontrolleri
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      e.preventDefault();
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
      e.preventDefault();
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      isTouchingRef.current = true;
      
      // 4 bölgeye ayır: üst, alt, sol, sağ
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const speed = gameConfig.movementSpeed;
      
      // Hangi bölgede dokunulduğunu belirle
      const isLeft = touchX < centerX * 0.7;
      const isRight = touchX > centerX * 1.3;
      const isTop = touchY < centerY * 0.7;
      const isBottom = touchY > centerY * 1.3;
      
      // Çapraz hareket kontrolü
      if ((isLeft || isRight) && (isTop || isBottom)) {
        const diagonalSpeed = speed * gameConfig.diagonalSpeedMultiplier;
        velocityXRef.current = isLeft ? -diagonalSpeed : diagonalSpeed;
        velocityYRef.current = isTop ? -diagonalSpeed : diagonalSpeed;
      } else {
        // Tek yönlü hareket
        if (isLeft) velocityXRef.current = -speed;
        else if (isRight) velocityXRef.current = speed;
        else velocityXRef.current = 0;
        
        if (isTop) velocityYRef.current = -speed;
        else if (isBottom) velocityYRef.current = speed;
        else velocityYRef.current = 0;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      isTouchingRef.current = false;
      velocityXRef.current = 0;
      velocityYRef.current = 0;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
    };

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Oyun döngüsü
  useEffect(() => {
    if (images.length !== frameCount) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const update = () => {
      if (!isTouchingRef.current) {
        // Klavye kontrolleri
        const speed = gameConfig.movementSpeed;
        let newVelX = 0;
        let newVelY = 0;
        
        // Yatay hareket
        if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
          newVelX = speed;
        } else if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
          newVelX = -speed;
        }
        
        // Dikey hareket
        if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) {
          newVelY = -speed;
        } else if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) {
          newVelY = speed;
        }
        
        // Çapraz hareket için hız azaltma
        if (newVelX !== 0 && newVelY !== 0) {
          const diagonalSpeed = speed * gameConfig.diagonalSpeedMultiplier;
          velocityXRef.current = newVelX > 0 ? diagonalSpeed : -diagonalSpeed;
          velocityYRef.current = newVelY > 0 ? diagonalSpeed : -diagonalSpeed;
        } else {
          velocityXRef.current = newVelX;
          velocityYRef.current = newVelY;
        }
      }

      // Yeni pozisyonu hesapla
      const newX = detectiveXRef.current + velocityXRef.current;
      const newY = detectiveYRef.current + velocityYRef.current;
      
      // Dedektifin en alt noktasını hesapla (ayakları - yere basma noktası)
      const charBottomX = newX + gameConfig.detectiveWidth / 2;  // Yatay merkez
      const charBottomY = newY + gameConfig.detectiveHeight;     // En alt nokta
      
      // Yamuk alan içinde kalıp kalmadığını kontrol et
      if (isPointInTrapezoid(charBottomX, charBottomY, gameConfig.trapezoidArea)) {
        detectiveXRef.current = newX;
        detectiveYRef.current = newY;
      } else {
        // Eğer alan dışına çıkarsa, sadece geçerli eksende hareket etmeye çalış
        const testX = detectiveXRef.current + velocityXRef.current;
        const testY = detectiveYRef.current;
        const testBottomX = testX + gameConfig.detectiveWidth / 2;
        const testBottomY = testY + gameConfig.detectiveHeight;
        
        if (isPointInTrapezoid(testBottomX, testBottomY, gameConfig.trapezoidArea)) {
          detectiveXRef.current = testX; // Sadece X hareketi
        } else {
          const testX2 = detectiveXRef.current;
          const testY2 = detectiveYRef.current + velocityYRef.current;
          const testBottomX2 = testX2 + gameConfig.detectiveWidth / 2;
          const testBottomY2 = testY2 + gameConfig.detectiveHeight;
          
          if (isPointInTrapezoid(testBottomX2, testBottomY2, gameConfig.trapezoidArea)) {
            detectiveYRef.current = testY2; // Sadece Y hareketi
          }
        }
      }
    };

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Animasyon frame güncelleme
      if (timestamp - lastFrameTimeRef.current > frameRate) {
        if (velocityXRef.current !== 0 || velocityYRef.current !== 0) {
          currentFrameRef.current = (currentFrameRef.current + 1) % frameCount;
        }
        lastFrameTimeRef.current = timestamp;
      }

      // Dedektifi çiz
      if (images.length === frameCount) {
        ctx.drawImage(
          images[currentFrameRef.current],
          detectiveXRef.current,
          detectiveYRef.current,
          gameConfig.detectiveWidth,
          gameConfig.detectiveHeight
        );
      }

      // Yamuk oyun alanını göster (geliştirme için)
      if (process.env.NODE_ENV === 'development') {
        const area = gameConfig.trapezoidArea;
        
        // Yamuk alanı çiz
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(area.topLeft.x, area.topLeft.y);
        ctx.lineTo(area.topRight.x, area.topRight.y);
        ctx.lineTo(area.bottomRight.x, area.bottomRight.y);
        ctx.lineTo(area.bottomLeft.x, area.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
        
        // Yamuk alanının köşelerini işaretle
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        const corners = [area.topLeft, area.topRight, area.bottomRight, area.bottomLeft];
        corners.forEach(corner => {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Debug: Karakterin çerçevesini göster
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(
          detectiveXRef.current, 
          detectiveYRef.current, 
          gameConfig.detectiveWidth, 
          gameConfig.detectiveHeight
        );
        
        // Dedektifin en alt noktasını göster (ayakları - kontrol noktası)
        const charBottomX = detectiveXRef.current + gameConfig.detectiveWidth / 2;
        const charBottomY = detectiveYRef.current + gameConfig.detectiveHeight;
        ctx.fillStyle = 'rgba(0, 255, 0, 1)';
        ctx.beginPath();
        ctx.arc(charBottomX, charBottomY, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.stroke();
        
        // Dedektifin merkez noktasını göster (referans için)
        const charCenterX = detectiveXRef.current + gameConfig.detectiveWidth / 2;
        const charCenterY = detectiveYRef.current + gameConfig.detectiveHeight / 2;
        ctx.fillStyle = 'rgba(0, 150, 255, 1)';
        ctx.beginPath();
        ctx.arc(charCenterX, charCenterY, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Sol üst köşeyi de göster (pozisyon referansı)
        ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(detectiveXRef.current, detectiveYRef.current, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    const gameLoop = (timestamp) => {
      update();
      draw(timestamp);
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [images, gameConfig, frameCount, frameRate]);

  return (
    <div className="detective-runner-container">
      <canvas
        ref={canvasRef}
        width={gameConfig.canvasWidth}
        height={gameConfig.canvasHeight}
        className="detective-canvas"
      />
      <div className="controls-info">
        <p>🖥️ Bilgisayar: WASD veya ↑↓←→ tuşları (çapraz hareket destekli)</p>
        <p>📱 Mobil: Ekranı 4 bölgeye böl - üst/alt/sol/sağ dokunma</p>
        <p>⚡ Çapraz hareket otomatik hız ayarlaması ile</p>
      </div>
    </div>
  );
};

export default DetectiveRunner; 