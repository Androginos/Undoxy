import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import DraggableBackground from './DraggableBackground';

const CanvasWrapper = ({ 
  children, 
  viewMode = 'desktop', // 'desktop', 'tablet', 'mobile'
  backgroundImage = null,
  backgroundSettings = { scale: 100, position: { x: 0, y: 0 }, visible: true },
  selectedLayerType = null,
  onBackgroundSelect,
  onBackgroundPositionChange,
  onBackgroundScaleChange,
  onCanvasClick,
  onExport
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // Responsive boyutlar
  const getViewportSize = (mode) => {
    switch (mode) {
      case 'mobile':
        return { width: 375, height: 667 }; // iPhone SE
      case 'tablet':
        return { width: 768, height: 1024 }; // iPad
      case 'desktop':
      default:
        return { width: 1200, height: 800 }; // Desktop
    }
  };

  useEffect(() => {
    setCanvasSize(getViewportSize(viewMode));
  }, [viewMode]);

  const exportCanvas = async () => {
    if (!canvasRef.current) return null;

    console.log('Export starting - Canvas size:', canvasSize);

    // CLEAR ALL SELECTIONS BEFORE EXPORT STARTS!
    console.log('Deselecting all layers like a boss...');
    if (onCanvasClick) {
      onCanvasClick(); // Clear selections in parent component
    }
    
    // Short wait - for selection clearing to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // AVATAR DEBUG - Kaç avatar var export edilecek?
    const avatarElements = canvasRef.current.querySelectorAll('.react-draggable');
    console.log('AVATAR DEBUG - Total avatar count:', avatarElements.length);
    avatarElements.forEach((avatar, index) => {
      const img = avatar.querySelector('img');
      const isVisible = avatar.style.visibility !== 'hidden' && avatar.style.display !== 'none';
      console.log(`Avatar ${index}:`, {
        visible: isVisible,
        hasImage: !!img,
        src: img?.src?.substring(0, 50) + '...',
        position: avatar.style.transform
      });
    });

    // Calculate content area - SMART CROP!
    const contentBounds = calculateContentBounds();
    
    if (!contentBounds) {
      console.log('İçerik bulunamadı - tam canvas export ediliyor');
    } else {
      console.log('Content area found:', contentBounds);
    }

    // Orijinal CSS stillerini sakla
    const originalStyles = {
      border: canvasRef.current.style.border,
      borderRadius: canvasRef.current.style.borderRadius,
      boxShadow: canvasRef.current.style.boxShadow,
      margin: canvasRef.current.style.margin,
      backgroundColor: canvasRef.current.style.backgroundColor,
      backgroundImage: canvasRef.current.style.backgroundImage
    };

    try {
      // UI elementlerini gizle
      removeUIElementsForExport();
      
      // TEMPORARILY clear Canvas CSS effects + TRANSPARENT BACKGROUND
      canvasRef.current.style.border = 'none';
      canvasRef.current.style.borderRadius = '0';
      canvasRef.current.style.boxShadow = 'none';
      canvasRef.current.style.margin = '0';
      // ÖNEMLİ: Canvas'ın kendi background'ını TAMAMEN şeffaf yap
      canvasRef.current.style.backgroundColor = 'transparent !important';
      canvasRef.current.style.backgroundImage = 'none !important';
      
      // HIDE BLUE GUIDE LINES - clear dashed borders
      const allElements = canvasRef.current.querySelectorAll('*');
      const originalBorders = [];
      
      allElements.forEach((element, index) => {
        const computedStyle = getComputedStyle(element);
        if (computedStyle.border && computedStyle.border.includes('dashed')) {
          originalBorders.push({
            element: element,
            index: index,
            originalBorder: element.style.border,
            originalOutline: element.style.outline
          });
          element.style.border = 'none !important';
          element.style.outline = 'none !important';
        }
      });
      
      // Store for restoration
      window._originalBorders = originalBorders;
      
      console.log('Canvas background cleaned + guide lines hidden:', originalBorders.length, 'borders cleared');
      
      // Kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));

      // HTML2Canvas parametreleri - ŞEFFAF ARKAPLAN TEST
      const html2canvasOptions = {
        backgroundColor: null, // NULL = TRANSPARENT BACKGROUND
        scale: 1,
        logging: true, // Debug için açalım
        useCORS: true,
        allowTaint: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        ignoreElements: (element) => {
          // AVATAR'LARI ASLA IGNORE ETME!
          const parentDraggable = element.closest('.react-draggable');
          if (parentDraggable) {
            // Bu bir avatar - KORUMA ALTINA AL!
            console.log('Avatar elementi korundu:', element.tagName);
            return false; // Avatar'ı export'a dahil et
          }
          
          // UI kontrol elementlerini ignore et
          if (element.classList?.contains('selection-indicator') ||
              element.classList?.contains('resize-handle') ||
              element.classList?.contains('avatar-controls') ||
              element.style?.visibility === 'hidden' ||
              element.style?.display === 'none') {
            console.log('UI elementi ignore edildi:', element.className);
            return true;
          }
          
          // MAVİ KILAVUZ ÇİZGİLERİ - dashed border'ları ignore et
          try {
            const computedStyle = getComputedStyle(element);
            if (computedStyle.border && 
                (computedStyle.border.includes('dashed') || 
                 computedStyle.border.includes('#1da1f2'))) {
              console.log('Dashed border ignore edildi');
              return true;
            }
          } catch (e) {
            // getComputedStyle hatası - ignore etme
          }
          
          return false; // Diğer tüm elementleri dahil et
        }
      };

      // TEST: Önce tam canvas al, sonra crop yapalım
      const fullCanvas = await html2canvas(canvasRef.current, html2canvasOptions);
      
      let finalCanvas = fullCanvas;
      
      // Eğer içerik alanı varsa crop yap
      if (contentBounds) {
        console.log('Crop yapılıyor:', contentBounds);
        
        // Yeni canvas oluştur
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');
        
        croppedCanvas.width = contentBounds.width;
        croppedCanvas.height = contentBounds.height;
        
        // Crop edilmiş alanı yeni canvas'a çiz
        ctx.drawImage(
          fullCanvas,
          contentBounds.x, contentBounds.y, contentBounds.width, contentBounds.height,
          0, 0, contentBounds.width, contentBounds.height
        );
        
        finalCanvas = croppedCanvas;
      }

      console.log('Export tamamlandı:', {
        'Original canvas': `${fullCanvas.width} × ${fullCanvas.height}`,
        'Final export': `${finalCanvas.width} × ${finalCanvas.height}`,
        'Canvas size': `${canvasSize.width} × ${canvasSize.height}`,
        'Avatar count': `${avatarElements.length} avatars PRESERVED`,
        'Layer selection': 'ALL LAYERS DESELECTED',
                  'Content area': contentBounds ? `${contentBounds.width} × ${contentBounds.height}` : 'Full canvas',
        'Transparent background': 'YES - backgroundColor: null + CSS transparent !important',
                  'Smart crop': contentBounds ? 'YES - Manual crop applied!' : 'NO - Full canvas',
        'Blue guide lines': 'HIDDEN - dashed border & #1da1f2 cleared',
        'CSS background cleared': 'YES - getBackgroundStyle() overridden'
      });

      // Final canvas'ı blob'a çevir
      return new Promise((resolve) => {
        finalCanvas.toBlob((blob) => {
          if (onExport) {
            onExport(blob, finalCanvas);
          }
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Canvas export hatası:', error);
      return null;
    } finally {
      // Her durumda orijinal stilleri geri yükle
      canvasRef.current.style.border = originalStyles.border;
      canvasRef.current.style.borderRadius = originalStyles.borderRadius;
      canvasRef.current.style.boxShadow = originalStyles.boxShadow;
      canvasRef.current.style.margin = originalStyles.margin;
      canvasRef.current.style.backgroundColor = originalStyles.backgroundColor;
      canvasRef.current.style.backgroundImage = originalStyles.backgroundImage;
      
      // MAVİ KILAVUZ ÇİZGİLERİNİ GERİ YÜKLE
      if (window._originalBorders) {
        window._originalBorders.forEach(({ element, originalBorder, originalOutline }) => {
          if (element && element.style) {
            element.style.border = originalBorder;
            element.style.outline = originalOutline;
          }
        });
        delete window._originalBorders;
        console.log('Kılavuz çizgileri geri yüklendi');
      }
      
      // UI elementlerini geri göster
      restoreUIElementsAfterExport();
    }
  };



  // Gereksiz fonksiyonlar silindi - zoom sorununun kaynağıydılar

  const removeUIElementsForExport = () => {
    if (!canvasRef.current) return;

    // Temporary store for restoration
    window._tempHiddenElements = [];
    
    console.log('UI elementleri gizleniyor - AVATAR\'LARI KORUYACAĞIZ...');
    
    try {
      // SADECE UI KONTROL ELEMENTLERİNİ gizle - AVATAR'LARI DEĞİL!
      const uiSelectors = [
        '.selection-indicator',
        '.resize-handle', 
        '.avatar-controls'
      ];

      uiSelectors.forEach(selector => {
        const elements = canvasRef.current.querySelectorAll(selector);
        console.log(`${selector} bulundu:`, elements.length);
        elements.forEach(element => {
          if (element && element.style) {
            window._tempHiddenElements.push({
              element: element,
              originalDisplay: element.style.display || '',
              originalVisibility: element.style.visibility || ''
            });
            
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
          }
        });
      });
      
      // Text content'e göre UI elementlerini gizle - AVATAR'LARI KORU
      const allElements = canvasRef.current.querySelectorAll('*');
      allElements.forEach(element => {
        // AVATAR'LARI ATLA - .react-draggable içindeki img veya TwitterAvatar elementleri
        const parentDraggable = element.closest('.react-draggable');
        if (parentDraggable) {
          // Bu bir avatar'ın parçası - KORUMA ALTINA AL!
          return;
        }
        
        if (element && element.textContent) {
          const content = element.textContent.toLowerCase();
          if (content.includes('seçili') || 
              content.includes('×') || 
              content.includes('sürükle') ||
              content.includes('boyutlandır') ||
              content.match(/\d+\s*×\s*\d+/) ||
              (content.includes('px') && element.style.position === 'absolute')) {
            
            window._tempHiddenElements.push({
              element: element,
              originalDisplay: element.style.display || '',
              originalVisibility: element.style.visibility || ''
            });
            
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
          }
        }
      });
      
      console.log('UI elementleri gizlendi:', window._tempHiddenElements.length, 'element gizlendi - AVATAR\'LAR KORUNDU');
      
    } catch (error) {
      console.warn('UI elementleri gizlenirken hata:', error);
    }
  };

  const restoreUIElementsAfterExport = () => {
    if (!window._tempHiddenElements) return;

    try {
      // Gizlenen elementleri geri göster
      window._tempHiddenElements.forEach(({ element, originalDisplay, originalVisibility }) => {
        if (element && element.style) {
          element.style.display = originalDisplay;
          element.style.visibility = originalVisibility;
        }
      });
    } catch (error) {
      console.warn('UI elementleri geri yüklenirken hata:', error);
    } finally {
      // Clean up temporary store in any case
      delete window._tempHiddenElements;
    }
  };

      // Calculate content area - export only filled areas
  const calculateContentBounds = () => {
    if (!canvasRef.current) return null;

    let minX = canvasSize.width;
    let minY = canvasSize.height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    console.log('Content bounds hesaplanıyor...');

    // Avatar pozisyonlarını al - daha güvenilir selector
    const avatarElements = canvasRef.current.querySelectorAll('.react-draggable');
          console.log('Found avatar count:', avatarElements.length);
    
    avatarElements.forEach((element, index) => {
      if (element.style.visibility === 'hidden' || element.style.display === 'none') {
        console.log(`Avatar ${index} gizli - atlanıyor`);
        return;
      }
      
      const rect = element.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Canvas'a göre relatif pozisyon
      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      const right = x + rect.width;
      const bottom = y + rect.height;

      console.log(`Avatar ${index} pozisyon:`, { x, y, width: rect.width, height: rect.height });

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
      hasContent = true;
    });

    // Background image varsa onun alanını da hesapla
    if (backgroundImage && backgroundSettings.visible) {
      console.log('Background image hesaplanıyor:', backgroundSettings);
      
      const { scale, position } = backgroundSettings;
      const imgScale = scale / 100;
      
      // Background image'ın gerçek boyutlarını daha doğru hesapla
      // Estimated size based on canvas dimensions
      const estimatedImgWidth = Math.min(canvasSize.width, 1000) * imgScale;
      const estimatedImgHeight = Math.min(canvasSize.height, 800) * imgScale;
      
      const centerX = canvasSize.width * 0.5;
      const centerY = canvasSize.height * 0.5;
      
      const bgLeft = centerX + position.x - (estimatedImgWidth / 2);
      const bgTop = centerY + position.y - (estimatedImgHeight / 2);
      const bgRight = bgLeft + estimatedImgWidth;
      const bgBottom = bgTop + estimatedImgHeight;

      console.log('Background alanı:', { bgLeft, bgTop, bgRight, bgBottom });

      minX = Math.min(minX, bgLeft);
      minY = Math.min(minY, bgTop);
      maxX = Math.max(maxX, bgRight);
      maxY = Math.max(maxY, bgBottom);
      hasContent = true;
    }

    if (!hasContent) {
      console.log('İçerik bulunamadı');
      return null;
    }

    // Biraz padding ekle ama minimum boyut garantisi
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvasSize.width, maxX + padding);
    maxY = Math.min(canvasSize.height, maxY + padding);

    const bounds = {
      x: Math.floor(minX),
      y: Math.floor(minY),
      width: Math.floor(maxX - minX),
      height: Math.floor(maxY - minY)
    };

    // Minimum boyut kontrolü
    if (bounds.width < 50 || bounds.height < 50) {
      console.log('Content alanı çok küçük, tam canvas export ediliyor');
      return null;
    }

    console.log('Hesaplanan content bounds:', bounds);
    return bounds;
  };



  const downloadCanvas = async () => {
    const blob = await exportCanvas();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `undoxy-${viewMode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getBackgroundStyle = () => {
    if (!backgroundImage || !backgroundSettings.visible) {
      return {
        backgroundImage: 'none',
        backgroundColor: 'transparent' // ŞEFFAF - artık beyaz değil!
      };
    }

    const { scale, position } = backgroundSettings;
    const bgPosition = `calc(50% + ${position.x}px) calc(50% + ${position.y}px)`;
    

    
    return {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: `${scale}%`,
      backgroundPosition: bgPosition,
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'transparent' // ŞEFFAF - background image altında da şeffaf
    };
  };

  // Hidden image silindi - gereksizdi

  const canvasStyle = {
    width: canvasSize.width,
    height: canvasSize.height,
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
    boxShadow: '0 4px 12px var(--shadow)',
    ...getBackgroundStyle()
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0',
    minHeight: 'auto',
    backgroundColor: 'transparent'
  };

  const viewModeIndicatorStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    zIndex: 1000
  };

  return (
    <div style={containerStyle}>
      {/* View Mode Controls */}
      <div style={{ 
        marginBottom: '15px', 
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <span className="desktop-only" style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          marginRight: '8px'
        }}>
          View Mode:
        </span>
        
        {/* Mobile: Compact label */}
        <span className="mobile-only" style={{ 
          fontSize: '12px', 
          fontWeight: '500',
          color: 'var(--text-secondary)',
          marginRight: '4px'
        }}>
          Size:
        </span>

        {/* Size Buttons Container */}
        <div style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center'
        }}>
          {['desktop', 'tablet', 'mobile'].map((mode) => (
            <button
              key={mode}
              onClick={() => setCanvasSize(getViewportSize(mode))}
              style={{
                // Fixed compact size for mobile
                width: window.innerWidth < 768 ? '32px' : '80px',
                height: window.innerWidth < 768 ? '32px' : '36px',
                padding: window.innerWidth < 768 ? '6px' : '8px 14px',
                border: viewMode === mode ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: viewMode === mode ? 'var(--accent-primary)15' : 'var(--bg-primary)',
                color: viewMode === mode ? 'var(--accent-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: viewMode === mode ? '600' : '400',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="desktop-only">
                {mode === 'desktop' ? 'Desktop' : mode === 'tablet' ? 'Tablet' : 'Mobile'}
              </span>
              <span className="mobile-only">
                {mode === 'desktop' ? 'L' : mode === 'tablet' ? 'M' : 'S'}
              </span>
            </button>
          ))}
        </div>
        
        <button
          onClick={downloadCanvas}
          style={{
            width: window.innerWidth < 768 ? '40px' : '100px',
            height: window.innerWidth < 768 ? '32px' : '36px',
            padding: window.innerWidth < 768 ? '6px' : '10px 20px',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: window.innerWidth < 768 ? '16px' : '14px',
            fontFamily: 'Sora, sans-serif',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: window.innerWidth < 768 ? '8px' : '16px'
          }}
        >
          <span className="desktop-only">Download</span>
          <span className="mobile-only">📥</span>
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        className="canvas-wrapper"
        style={{
          position: 'relative',
          maxWidth: '100%',
          overflow: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--text-muted) transparent'
        }}
      >
        <div
          ref={canvasRef}
          style={canvasStyle}
          id="canvas-area"
          onClick={(e) => {
            // Sadece canvas'ın kendisine tıklandığında (children'a değil)
            if (e.target === e.currentTarget && onCanvasClick) {
              onCanvasClick();
            }
          }}
        >
          {/* View Mode Indicator */}
          <div className="avatar-controls" style={viewModeIndicatorStyle}>
            <span className="desktop-only">{canvasSize.width} × {canvasSize.height}</span>
            <span className="mobile-only">{canvasSize.width}×{canvasSize.height}</span>
          </div>
          
          {/* Background Layer (Draggable) */}
          <DraggableBackground
            backgroundImage={backgroundImage}
            backgroundSettings={backgroundSettings}
            canvasSize={canvasSize}
            isSelected={selectedLayerType === 'background'}
            onPositionChange={onBackgroundPositionChange}
            onSelect={onBackgroundSelect}
            onScaleChange={onBackgroundScaleChange}
          />
          
          {/* Render children (avatars, elements, etc.) */}
          {children}
        </div>
      </div>

      {/* Canvas Info */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: 'var(--text-secondary)', 
        textAlign: 'center',
        width: '100%'
      }}>
        <span className="desktop-only">Canvas Size: {canvasSize.width} × {canvasSize.height} pixels</span>
        <span className="mobile-only">{canvasSize.width} × {canvasSize.height}px</span>
      </div>
    </div>
  );
};

export default CanvasWrapper; 