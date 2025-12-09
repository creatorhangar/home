'use client';

import { SceneContainer } from './components/canvas/SceneContainer';
import { HUD } from './components/ui/HUD';
import { Loader } from './components/ui/Loader';
import { useState } from 'react';
import './index.css';

export default function LoopVideoTool() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative' }}>
      {loading && <Loader onFinished={() => setLoading(false)} />}
      <SceneContainer />
      {!loading && <HUD />}
    </div>
  );
}
