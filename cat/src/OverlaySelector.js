import React from "react";

const overlays = [
  { name: "batcat", url: process.env.PUBLIC_URL + "/overlay/batcat.png" },
  { name: "batcat2", url: process.env.PUBLIC_URL + "/overlay/batcat2.png" },
  { name: "foilhat", url: process.env.PUBLIC_URL + "/overlay/foilhat.png" },
  { name: "mjhat", url: process.env.PUBLIC_URL + "/overlay/mjhat.png" },
];

export default function OverlaySelector({ setOverlay, color = '#222', bg = '#eee' }) {
  return (
    <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontWeight: 'bold', marginRight: 8, fontFamily: 'This Cafe', color, fontSize: 18, letterSpacing: 1 }}>Choose overlay:</span>
      <div style={{ display: 'flex', gap: 12 }}>
        {overlays.map((o) => (
          <button
            key={o.name}
            onClick={() => setOverlay(o.url)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '2px solid #888', background: bg, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'This Cafe', fontSize: 16, color }}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
} 