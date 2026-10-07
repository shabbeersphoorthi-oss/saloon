import React, { useState } from 'react';
import { Sparkles, Film, Volume2, VolumeX, Maximize2, Compass, X } from 'lucide-react';

interface CinematicControlsHUDProps {
  onOpen3DTour: () => void;
  cinemaBarsActive: boolean;
  onToggleCinemaBars: () => void;
}

export const CinematicControlsHUD: React.FC<CinematicControlsHUDProps> = ({
  onOpen3DTour,
  cinemaBarsActive,
  onToggleCinemaBars,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const toggleSound = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.06, ctx.currentTime);
      master.connect(ctx.destination);

      // Relaxing ambient salon chords
      [146.83, 185.0, 220.0, 277.18].forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.03, ctx.currentTime);
        osc.connect(g);
        g.connect(master);
        osc.start();
      });
      setIsPlayingAudio(true);
    } else {
      if (audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
        setIsPlayingAudio(false);
      } else {
        audioCtxRef.current.resume();
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <>
      {/* Cinematic Letterbox Bars if active */}
      {cinemaBarsActive && (
        <>
          <div className="cinema-bars-top flex items-center justify-between px-8 text-white text-[11px] font-luxury tracking-widest uppercase">
            <span className="text-[#E2B755]">Bloom Saloon • Cinema Experience</span>
            <span className="text-stone-400">107/P, 3-13-94/11/A, Ramanthapur, Hyderabad</span>
          </div>
          <div className="cinema-bars-bottom flex items-center justify-between px-8 text-stone-500 text-[10px] tracking-wider">
            <span>2.39:1 Anamorphic Spatial Format</span>
            <span className="text-[#E2B755]">Bloom Saloon Master Barbers</span>
          </div>
        </>
      )}

      {/* Floating HUD Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {isOpen && (
          <div className="p-3 bg-stone-950/90 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-2xl text-white space-y-2 animate-in fade-in slide-in-from-bottom-2 text-xs w-64">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[#E2B755] font-bold">
                <Sparkles size={14} />
                <span className="font-luxury uppercase tracking-wider text-[11px]">3D Cinema Suite</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {/* Virtual 3D Salon Tour */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpen3DTour();
                }}
                className="w-full p-2 rounded-xl bg-[#E2B755] text-stone-950 hover:bg-[#ebd083] font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Compass size={15} />
                  <span>Explore 3D Salon</span>
                </div>
                <span className="text-[10px] uppercase font-extrabold bg-stone-950 text-[#E2B755] px-1.5 py-0.5 rounded">
                  WebGL
                </span>
              </button>

              {/* Toggle Cinema Widescreen */}
              <button
                type="button"
                onClick={onToggleCinemaBars}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                  cinemaBarsActive
                    ? 'bg-amber-500/20 text-[#E2B755] border-[#E2B755]/50'
                    : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Film size={15} />
                  <span>Cinema Letterbox (2.39:1)</span>
                </div>
                <span className="text-[10px] font-bold">
                  {cinemaBarsActive ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Ambient Audio */}
              <button
                type="button"
                onClick={toggleSound}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500/20 text-[#E2B755] border-[#E2B755]/50'
                    : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPlayingAudio ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>Salon Loft Audio</span>
                </div>
                <span className="text-[10px] font-bold">
                  {isPlayingAudio ? 'PLAYING' : 'MUTED'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group px-3.5 py-2.5 rounded-full bg-stone-950/90 hover:bg-stone-900 border border-amber-500/40 text-[#E2B755] shadow-2xl backdrop-blur-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="3D Cinematic Salon Controls"
        >
          <div className="w-2 h-2 rounded-full bg-[#E2B755] animate-ping" />
          <Film size={15} />
          <span className="text-xs font-bold font-luxury uppercase tracking-wider hidden sm:inline">
            3D Cinema Mode
          </span>
        </button>
      </div>
    </>
  );
};
