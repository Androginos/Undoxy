import React from "react";

export default function ImageUploader({ setUserImage }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      background: '#ddd',
      borderRadius: 12,
      padding: '28px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '16px 0',
      minWidth: 220,
      minHeight: 80
    }}>
      <label style={{
        fontWeight: 'bold',
        fontSize: 22,
        color: '#555',
        fontFamily: 'This Cafe',
        marginBottom: 12,
        letterSpacing: 1,
        textAlign: 'center',
        textShadow: '1px 1px 0 #fff8'
      }}>
        SELECT YOUR CAT'S PHOTO
      </label>
      <input type="file" accept="image/*" onChange={handleChange} style={{ marginTop: 8 }} />
    </div>
  );
} 