import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

interface SplashScreenProps {
  isExiting: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isExiting }) => {
  const [loadingText, setLoadingText] = useState('Initializing direct parallel cores...');

  useEffect(() => {
    const messages = [
      'Initializing direct parallel cores...',
      'Configuring Real-Debrid intent filters...',
      'Mapping TV overscan safe boundaries...',
      'Compiling Torrentio scraper parameters...',
      'Connecting CORS proxy fallback bridges...',
      'Resolving TMDb catalog indices...',
      'LeeStreamTVPro is ready!'
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#070a0f] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-out-back ${
        isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Glow Backdrop Light */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-red-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-rose-500/5 blur-[80px] animate-ping pointer-events-none duration-1000" />

      {/* Cinematic Logo Container */}
      <div className="relative flex flex-col items-center select-none text-center px-4 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Glowing Radio Icon Shield */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-2xl shadow-red-600/30 border border-white/10 animate-bounce duration-1000">
            <Radio className="w-11 h-11 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <h1 className="font-black text-4xl sm:text-5xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-md">
          LeeStream<span className="text-red-500">TVPro</span>
        </h1>
        
        <p className="text-[10px] sm:text-xs tracking-[0.25em] text-slate-400 font-mono font-black uppercase mt-1.5 opacity-80">
          PREMIUM STREAMING & SCRAPING ENGINE
        </p>

        {/* Custom Status Loading Indicator */}
        <div className="mt-12 flex flex-col items-center space-y-3">
          
          {/* Animated custom bar */}
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 to-rose-500 w-1/3 rounded-full animate-loader-bar" />
          </div>

          <p className="text-[11px] text-slate-400 font-medium font-mono min-h-[16px] animate-pulse">
            {loadingText}
          </p>

        </div>

      </div>

      {/* Footer Version Details */}
      <div className="absolute bottom-8 left-0 right-0 text-center select-none animate-in fade-in slide-in-from-bottom-4 delay-500 duration-500">
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono">
          LeeStreamTVPro v1.0 • Stable Release
        </span>
      </div>

    </div>
  );
};
