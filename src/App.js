import React from 'react';
import { Carousel } from './AppComponent';

function App() {
  return (
    <div style={{
      background: '#2f2f2f',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Carousel />
    </div>
  );
}

export default App;
