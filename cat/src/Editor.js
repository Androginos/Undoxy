import React, { useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text, Group, LinearGradient } from "react-konva";
import useImage from "use-image";

function DraggableImage({ src, isSelected, onSelect, onChange, naturalSize, ...props }) {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image] = useImage(src);

  React.useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Görselin merkezinden döndürme için offsetX/offsetY
  const offset = image ? { offsetX: image.width / 2, offsetY: image.height / 2 } : {};

  return (
    <>
      <KonvaImage
        image={image}
        ref={shapeRef}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onChange({
            ...props,
            x: e.target.x(),
            y: e.target.y(),
            scaleX: e.target.scaleX(),
            scaleY: e.target.scaleY(),
            rotation: e.target.rotation(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          onChange({
            ...props,
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
        {...props}
        {...offset}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </>
  );
}

export default function Editor({ userImage, overlay, selected, setSelected, userProps, setUserProps, overlayProps, setOverlayProps }) {
  // Ölçek oranı
  const SCALE = 0.4;
  // Frame ve oynanabilir alan ayarları
  const FRAME_WIDTH = Math.round(1024 * SCALE);
  const FRAME_HEIGHT = Math.round(1536 * SCALE);
  // Kedilerin ve overlaylerin oynanacağı alan (örnek: alt orta, 600x500)
  const PLAY_AREA = {
    x: Math.round(212 * SCALE),
    y: Math.round(900 * SCALE),
    width: Math.round(600 * SCALE),
    height: Math.round(500 * SCALE)
  };
  const [userNatural, setUserNatural] = React.useState({ width: 0, height: 0 });
  const [overlayNatural, setOverlayNatural] = React.useState({ width: 0, height: 0 });

  // Otomatik scale hesaplama fonksiyonu
  function getFitScale(nat, area) {
    if (!nat.width || !nat.height) return 1;
    const scale = Math.min(area.width / nat.width, area.height / nat.height, 1);
    return scale;
  }

  // Center pozisyonu (offset merkezli)
  function getCenter(nat, area) {
    return {
      x: area.x + area.width / 2,
      y: area.y + area.height / 2
    };
  }

  const [hasUser, setHasUser] = React.useState(false);
  const [hasOverlay, setHasOverlay] = React.useState(false);

  const stageRef = React.useRef();
  const [frameImg] = useImage(process.env.PUBLIC_URL + "/frame.png");
  const [userImg, userImgStatus] = useImage(userImage || "");
  const [overlayImg, overlayImgStatus] = useImage(overlay || "");

  // Görsel yüklendiğinde doğal boyutunu kaydet ve scale/pozisyonu ayarla
  React.useEffect(() => {
    if (userImg && userImg.width && userImg.height && userImage) {
      setUserNatural({ width: userImg.width, height: userImg.height });
      const scale = getFitScale({ width: userImg.width, height: userImg.height }, PLAY_AREA);
      setUserProps && setUserProps({
        x: getCenter({ width: userImg.width, height: userImg.height }, PLAY_AREA).x,
        y: getCenter({ width: userImg.width, height: userImg.height }, PLAY_AREA).y,
        scaleX: scale,
        scaleY: scale,
        rotation: 0
      });
      setHasUser(true);
    } else if (!userImage) {
      setHasUser(false);
    }
    // eslint-disable-next-line
  }, [userImgStatus, userImage]);

  React.useEffect(() => {
    if (overlayImg && overlayImg.width && overlayImg.height && overlay) {
      setOverlayNatural({ width: overlayImg.width, height: overlayImg.height });
      const scale = getFitScale({ width: overlayImg.width, height: overlayImg.height }, PLAY_AREA);
      setOverlayProps && setOverlayProps({
        x: getCenter({ width: overlayImg.width, height: overlayImg.height }, PLAY_AREA).x,
        y: getCenter({ width: overlayImg.width, height: overlayImg.height }, PLAY_AREA).y,
        scaleX: scale,
        scaleY: scale,
        rotation: 0
      });
      setHasOverlay(true);
    } else if (!overlay) {
      setHasOverlay(false);
    }
    // eslint-disable-next-line
  }, [overlayImgStatus, overlay]);

  // Seçili itemı sil
  const handleDelete = () => {
    if (selected === 'user') {
      setHasUser(false);
      setUserProps && setUserProps(null);
      setSelected(null);
    } else if (selected === 'overlay') {
      setHasOverlay(false);
      setOverlayProps && setOverlayProps(null);
      setSelected(null);
    }
  };

  // Reset All
  const handleReset = () => {
    setHasUser(false);
    setOverlayProps && setOverlayProps(null);
    setUserProps && setUserProps(null);
    setHasOverlay(false);
    setSelected(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Stage ref={stageRef} width={FRAME_WIDTH} height={FRAME_HEIGHT} style={{
        borderRadius: 18,
        border: '4px solid #39FF14', // uzaylı yeşili
        boxShadow: '0 0 48px 16px #39FF1488, 0 0 0 8px #39FF1422', // yayılmış opak yeşil gölge
        position: 'relative',
        background: 'transparent',
        transition: 'box-shadow 0.3s, border 0.3s'
      }}>
        {/* Gri arka plan frame'in en arkasında */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={FRAME_WIDTH}
            height={FRAME_HEIGHT}
            fill="#ddd"
          />
        </Layer>
        {/* Eklenen görsel en altta */}
        <Layer>
          {(!hasUser && !userImage) && (
            <Text
              text={"UPLOAD YOUR CAT'S PHOTO HERE"}
              x={0}
              y={140}
              width={FRAME_WIDTH}
              height={FRAME_HEIGHT}
              align="center"
              verticalAlign="middle"
              fontSize={20}
              fontFamily="This Cafe, cursive, sans-serif"
              fill="#555"
              fontStyle="bold"
              shadowColor="#fff8"
              shadowBlur={2}
            />
          )}
          {hasUser && userImage && userProps && (
            <DraggableImage
              src={userImage}
              isSelected={selected === 'user'}
              onSelect={() => setSelected('user')}
              onChange={setUserProps}
              {...userProps}
              naturalSize={userNatural}
            />
          )}
        </Layer>
        {/* Frame onun üstünde */}
        <Layer>
          {frameImg && <KonvaImage image={frameImg} x={0} y={0} width={FRAME_WIDTH} height={FRAME_HEIGHT} listening={false} />}
        </Layer>
        {/* Overlay en üstte */}
        <Layer>
          {hasOverlay && overlay && overlayProps && (
            <DraggableImage
              src={overlay}
              isSelected={selected === 'overlay'}
              onSelect={() => setSelected('overlay')}
              onChange={setOverlayProps}
              {...overlayProps}
              naturalSize={overlayNatural}
            />
          )}
        </Layer>
      </Stage>
      {/* Sil ve Reset All butonları */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {selected && (
          <button
            onClick={handleDelete}
            style={{ padding: '6px 18px', borderRadius: 8, background: '#ff7675', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: 14, boxShadow: '1px 1px 0 #888' }}
          >
            Delete selected
          </button>
        )}
        <button
          onClick={handleReset}
          style={{ padding: '6px 18px', borderRadius: 8, background: '#636e72', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: 14, boxShadow: '1px 1px 0 #888' }}
        >
          Reset all
        </button>
      </div>
      {/* Download button */}
      <button
        onClick={() => {
          // Deselect before download
          const prevSelected = selected;
          setSelected(null);
          setTimeout(() => {
            const uri = stageRef.current.toDataURL({ pixelRatio: 1 });
            const link = document.createElement('a');
            link.download = 'tinfoilcathat.png';
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Restore selection
            setTimeout(() => setSelected(prevSelected), 100);
          }, 50);
        }}
        style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, background: '#00b894', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '2px 2px 0 #888' }}
      >
        Download image
      </button>
    </div>
  );
} 