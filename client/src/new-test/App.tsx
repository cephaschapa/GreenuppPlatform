import React from 'react';

export default function App() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'black',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#00cc66' }}>
          Greenupp
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          A cutting-edge agricultural platform
        </p>
        <button style={{ 
          padding: '12px 24px', 
          background: '#00cc66',
          color: 'black',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}