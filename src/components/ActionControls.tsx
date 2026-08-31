import React from 'react';
import { Flame, Crosshair, Volume2 } from 'lucide-react';

interface ActionControlsProps {
  nitroUnlocked: boolean;
  nitroCharges: number;
  nitroActive: boolean;
  gunUnlocked: boolean;
  gunAmmo: number;
  onTriggerNitro: () => void;
  onTriggerGun: () => void;
  onTriggerHorn: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  nitroUnlocked,
  nitroCharges,
  nitroActive,
  gunUnlocked,
  gunAmmo,
  onTriggerNitro,
  onTriggerGun,
  onTriggerHorn,
}) => {
  return (
    <div id="action-controls-container" className="flex flex-col gap-2">
      {/* Nitro Boost Button */}
      {nitroUnlocked && (
        <button
          id="action-nitro-btn"
          type="button"
          onClick={onTriggerNitro}
          disabled={nitroCharges <= 0 || nitroActive}
          className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all ${
            nitroActive
              ? 'bg-amber-500 border-amber-300 text-white animate-pulse shadow-amber-500/50'
              : nitroCharges > 0
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-cyan-500/30'
              : 'bg-slate-800 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[9px] font-black leading-none mt-0.5">
            {nitroActive ? 'فعال' : `x${nitroCharges}`}
          </span>
        </button>
      )}

      {/* Mounted Gun Button */}
      {gunUnlocked && (
        <button
          id="action-gun-btn"
          type="button"
          onClick={onTriggerGun}
          disabled={gunAmmo <= 0}
          className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all ${
            gunAmmo > 0
              ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400 text-white shadow-red-600/40'
              : 'bg-slate-800 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          <Crosshair className="w-5 h-5" />
          <span className="text-[9px] font-black leading-none mt-0.5">
            {gunAmmo}
          </span>
        </button>
      )}

      {/* Auxiliary Horn Button */}
      <button
        id="action-horn-btn"
        type="button"
        onClick={onTriggerHorn}
        className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 text-amber-400 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-slate-800"
      >
        <Volume2 className="w-5 h-5" />
        <span className="text-[9px] font-bold mt-0.5">بوق</span>
      </button>
    </div>
  );
};
