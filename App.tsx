import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-full text-white overflow-hidden selection:bg-yellow-500/30">
      <Scene treeState={treeState} />

      {/* Overlay UI */}
      <main className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
        
        {/* Header - Compact for Mobile to avoid covering the tree */}
        <header className="flex flex-col items-center md:items-start space-y-1 pointer-events-auto shadow-black drop-shadow-lg pt-4 md:pt-0">
          <h1 className="font-serif text-3xl md:text-6xl tracking-wider text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
            Merry Christmas
          </h1>
          <p className="font-sans text-[9px] md:text-xs tracking-[0.4em] text-emerald-300/90 uppercase font-bold pl-1">
            especially for you
          </p>
        </header>

        {/* Bottom Interaction Area */}
        <div className="flex flex-col items-center gap-6 pointer-events-auto pb-12 md:pb-12">
          
          <button
            onClick={toggleState}
            className="group relative px-8 py-3 bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 
                       hover:border-[#D4AF37] transition-all duration-500 ease-out overflow-hidden"
          >
            {/* Inner Glow Background */}
            <div className="absolute inset-0 bg-[#D4AF37] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            
            <span className="relative z-10 font-sans text-xs tracking-[0.2em] text-[#F8E796] group-hover:text-white transition-colors duration-300">
              {treeState === TreeState.TREE_SHAPE ? "SCATTER MAGIC" : "ASSEMBLE TREE"}
            </span>
            
            {/* Corners decoration */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37]"></div>
          </button>
        </div>

        {/* Footer info */}
        <footer className="absolute bottom-6 right-8 text-right hidden md:block opacity-40">
           <p className="text-[10px] font-sans tracking-widest text-emerald-100">
             INTERACTIVE 3D GREETING
           </p>
        </footer>
      </main>
      
      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,10,5,0.4)_100%)]"></div>
    </div>
  );
}

export default App;