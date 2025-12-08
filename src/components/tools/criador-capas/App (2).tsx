import { SceneContainer } from './components/canvas/SceneContainer';
import { HUD } from './components/ui/HUD';
import { Loader } from './components/ui/Loader';
import { useState } from 'react';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {loading && <Loader onFinished={() => setLoading(false)} />}
      <SceneContainer />
      {!loading && <HUD />}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '20px',
        color: 'white',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <h1 style={{ fontFamily: 'Orbitron', letterSpacing: '4px', textShadow: '0 0 10px #00F5FF' }}>
          HYPNOTIC FRACTALS
        </h1>
      </div>
    </div>
  );
}

export default App;
