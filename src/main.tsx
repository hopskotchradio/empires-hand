import React from 'react';
import ReactDOM from 'react-dom/client';

// Placeholder - will be replaced with actual game component
const App = () => (
  <div style={{ padding: 40, textAlign: 'center' }}>
    <h1>🏛️ Empire's Hand</h1>
    <p>A card game inspired by Age of Empires</p>
    <p style={{ marginTop: 20, opacity: 0.7 }}>
      Greeks vs Norse coming soon...
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
