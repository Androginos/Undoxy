import React, { useEffect } from "react";

// Modern slider stilini App.js'ye ekle
function injectSliderStyle() {
  if (document.getElementById('modern-slider-style')) return;
  const style = document.createElement('style');
  style.id = 'modern-slider-style';
  style.innerHTML = `
    .modern-slider {
      width: 100%;
      height: 8px;
      border-radius: 8px;
      background: #e0e0e0;
      box-shadow: 0 2px 8px #5fa8ff44;
      outline: none;
      position: relative;
    }
    .modern-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, #5fa8ff 60%, #b2d8ff 100%);
      border: 4px solid #3a4a5a;
      box-shadow: 0 2px 8px #5fa8ff88;
      cursor: pointer;
      transition: background 0.2s;
    }
    .modern-slider:disabled::-webkit-slider-thumb {
      background: #bbb;
      border: 4px solid #888;
      cursor: not-allowed;
    }
    .modern-slider::-moz-range-thumb {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, #5fa8ff 60%, #b2d8ff 100%);
      border: 4px solid #3a4a5a;
      box-shadow: 0 2px 8px #5fa8ff88;
      cursor: pointer;
      transition: background 0.2s;
    }
    .modern-slider:disabled::-moz-range-thumb {
      background: #bbb;
      border: 4px solid #888;
      cursor: not-allowed;
    }
    .modern-slider::-ms-thumb {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, #5fa8ff 60%, #b2d8ff 100%);
      border: 4px solid #3a4a5a;
      box-shadow: 0 2px 8px #5fa8ff88;
      cursor: pointer;
      transition: background 0.2s;
    }
    .modern-slider:disabled::-ms-thumb {
      background: #bbb;
      border: 4px solid #888;
      cursor: not-allowed;
    }
    .modern-slider:focus {
      outline: none;
    }
    .modern-slider::-moz-range-track {
      height: 8px;
      border-radius: 8px;
      background: #e0e0e0;
    }
    .modern-slider::-ms-fill-lower, .modern-slider::-ms-fill-upper {
      background: #e0e0e0;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}

export default function ControlPanel({ props, setProps, disabled }) {
  useEffect(() => {
    injectSliderStyle();
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 18, margin: '18px 0', background: '#f8f9fa', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px #0001', minWidth: 220,
      opacity: disabled ? 0.5 : 1
    }}>
      <label style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6, letterSpacing: 1 }}>SIZE</label>
      <input
        type="range"
        min={0.2}
        max={2}
        step={0.01}
        value={props.scaleX}
        onChange={e => !disabled && setProps(p => ({ ...p, scaleX: parseFloat(e.target.value), scaleY: parseFloat(e.target.value) }))}
        className="modern-slider"
        disabled={disabled}
      />
      <label style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6, letterSpacing: 1 }}>ROTATION</label>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={props.rotation}
        onChange={e => !disabled && setProps(p => ({ ...p, rotation: parseInt(e.target.value) }))}
        className="modern-slider"
        disabled={disabled}
      />
      <button
        onClick={() => !disabled && setProps(p => ({ ...p, scaleX: 1, scaleY: 1, rotation: 0 }))}
        style={{ marginTop: 8, fontSize: 14, padding: '8px 0', borderRadius: 8, border: '1.5px solid #5fa8ff', background: '#fff', color: '#5fa8ff', fontWeight: 'bold', cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: 1 }}
        disabled={disabled}
      >RESET</button>
    </div>
  );
} 