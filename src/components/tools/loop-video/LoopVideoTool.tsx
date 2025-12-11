'use client';

import { SceneContainer } from './components/canvas/SceneContainer';
import { HUD } from './components/ui/HUD';
import { Loader } from './components/ui/Loader';
import { useState } from 'react';
import './index.css';
import { PanelRight, Settings2 } from 'lucide-react';

export default function LoopVideoTool() {
  const [loading, setLoading] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 overflow-hidden font-sans relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between pointer-events-none">
        <div className="pointer-events-auto">
          {/* Title or other controls if needed */}
        </div>
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className={`pointer-events-auto p-2 rounded-md transition-all ${rightOpen ? 'bg-white/10 text-white' : 'bg-black/50 text-white/70 hover:text-white'}`}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content (Canvas) */}
        <div className="flex-1 relative bg-black">
          {loading && <Loader onFinished={() => setLoading(false)} />}
          <SceneContainer />
        </div>

        {/* Right Sidebar (HUD Controls) */}
        <aside className={`${rightOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0'} transition-all duration-300 ease-in-out bg-black/80 backdrop-blur-md border-l border-white/10 flex flex-col absolute lg:relative h-full z-10 shrink-0 right-0 shadow-2xl`}>
          <div className="flex-1 overflow-y-auto">
            {!loading && <HUD />}
          </div>
        </aside>
      </div>
    </div>
  );
}
