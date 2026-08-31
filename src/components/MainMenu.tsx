import React from 'react';
import { Play, Shield, User, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  coins: number;
  highestStage: number;
  selectedCarName: string;
  selectedCharacterName: string;
  isMuted: boolean;
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenCharacters: () => void;
  onOpenStages: () => void;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  coins,
  highestStage,
  selectedCarName,
  selectedCharacterName,
  isMuted,
  onStartGame,
  onOpenGarage,
  onOpenCharacters,
  onOpenStages,
  onToggleMute,
}) => {
  return (
    <div
      id="main-menu-overlay"
      className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none overflow-y-auto"
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-2xl px-3.5 py-1.5 text-amber-400 font-black text-sm">
          <span>🪙 {coins} سکه</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="main-menu-mute-toggle"
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Hero Title & Identity */}
      <div className="flex flex-col items-center text-center my-4 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>نسخه کامل ۱۰۰ مرحله‌ای</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 tracking-tight drop-shadow-md">
          یونس آباد
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xs">
          بازی مهیج اتومبیل‌رانی در اتوبان‌های ایران با دنده ۳ حالته و موزیک شاد ۶/۸
        </p>

        {/* Active Driver & Car Badge */}
        <div className="flex items-center gap-2 mt-3 bg-slate-800/70 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs">
          <span className="text-slate-400">راننده:</span>
          <span className="font-black text-pink-400">{selectedCharacterName}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">خودرو:</span>
          <span className="font-black text-cyan-400">{selectedCarName}</span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-xs space-y-2.5 my-2">
        {/* Play Button */}
        <button
          id="btn-start-driving"
          type="button"
          onClick={onStartGame}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/25 border border-emerald-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>شروع رانندگی</span>
        </button>

        {/* Garage */}
        <button
          id="btn-open-garage"
          type="button"
          onClick={onOpenGarage}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>گاراژ ماشین‌ها (۲۰ خودرو)</span>
        </button>

        {/* Character Select */}
        <button
          id="btn-open-characters"
          type="button"
          onClick={onOpenCharacters}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <User className="w-4 h-4 text-pink-400" />
          <span>انتخاب راننده (۶ شخصیت)</span>
        </button>

        {/* Stage Select */}
        <button
          id="btn-open-stages"
          type="button"
          onClick={onOpenStages}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>انتخاب مرحله (مرحله فعلی: {highestStage})</span>
        </button>
      </div>

      {/* Footer Instructions / Touch Hint */}
      <div className="text-center text-[11px] text-slate-500 leading-relaxed pt-2">
        <span>کنترل: غربیلک فرمان برای هدایت • دنده ۱ تا ۳ برای سرعت • بوق برای خلوت‌کردن لاین</span>
      </div>
    </div>
  );
};
