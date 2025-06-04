import React, { useState } from "react";
import Editor from "./Editor";
import OverlaySelector from "./OverlaySelector";
import ImageUploader from "./ImageUploader";
import ControlPanel from "./ControlPanel";

const THEMES = {
  light: {
    background: '#b2b2b2',
    panel: '#fff',
    panelShadow: '#b2b2b2',
    label: '#222',
  },
  dark: {
    background: '#23272e',
    panel: '#2d323b',
    panelShadow: '#111',
    label: '#fff',
  }
};

function App() {
  const [userImage, setUserImage] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [selected, setSelected] = useState(null);
  const [userProps, setUserProps] = useState(null);
  const [overlayProps, setOverlayProps] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Seçili item'ın props ve setProps'unu belirle
  let controlPanelProps = { props: { scaleX: 1, rotation: 0 }, setProps: () => {}, disabled: true };
  if (selected === 'user' && userProps) {
    controlPanelProps = { props: userProps, setProps: setUserProps, disabled: false };
  } else if (selected === 'overlay' && overlayProps) {
    controlPanelProps = { props: overlayProps, setProps: setOverlayProps, disabled: false };
  }

  const t = THEMES[theme];

  return (
    <div style={{ minHeight: "100vh", background: t.background, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.3s' }}>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10, display: 'flex', gap: 12 }}>
        <button onClick={() => setTheme('light')} style={{ padding: '6px 18px', borderRadius: 8, border: theme==='light' ? '2px solid #5fa8ff' : '2px solid #bbb', background: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>Light</button>
        <button onClick={() => setTheme('dark')} style={{ padding: '6px 18px', borderRadius: 8, border: theme==='dark' ? '2px solid #5fa8ff' : '2px solid #bbb', background: '#23272e', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Dark</button>
      </div>
      <div style={{ display: 'flex', background: t.panel, borderRadius: 24, boxShadow: `8px 8px 0 ${t.panelShadow}`, padding: 32, gap: 40, transition: 'background 0.3s' }}>
        {/* Left panel */}
        <div style={{ minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'flex-start' }}>
          <h1 style={{ fontFamily: 'This Cafe', margin: '0 0 16px 0', fontSize: 28, letterSpacing: 1, color: t.label }}>TinFoilCatHat Photo Editor</h1>
          <ImageUploader setUserImage={setUserImage} />
          <OverlaySelector setOverlay={setOverlay} color={t.label} bg={theme === 'dark' ? '#23272e' : '#eee'} />
          <div style={{ marginTop: 24 }}>
            <ControlPanel {...controlPanelProps} />
          </div>
        </div>
        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: t.panel, borderRadius: 20, boxShadow: `4px 4px 0 ${t.panelShadow}`, padding: 24, transition: 'background 0.3s' }}>
          <Editor
            userImage={userImage}
            overlay={overlay}
            selected={selected}
            setSelected={setSelected}
            userProps={userProps}
            setUserProps={setUserProps}
            overlayProps={overlayProps}
            setOverlayProps={setOverlayProps}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 