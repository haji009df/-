import React from 'react';

interface GearShifterProps {
  currentGear: number;
  onShift: (gear: number) => void;
}

export const GearShifter: React.FC<GearShifterProps> = ({ currentGear, onShift }) => {
  return (
    <div
      id="gear-shifter-box"
      className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-md"
    >
      <span className="text-[10px] font-bold text-slate-400">دنده</span>

      <div className="flex flex-col gap-1 w-11">
        {[3, 2, 1].map((gear) => {
          const isActive = currentGear === gear;
          const colorClass =
            gear === 3
              ? isActive
                ? 'bg-red-600 border-red-400 text-white shadow-red-600/50'
                : 'bg-slate-800/80 text-red-400/80 hover:bg-slate-700'
              : gear === 2
              ? isActive
                ? 'bg-blue-600 border-blue-400 text-white shadow-blue-600/50'
                : 'bg-slate-800/80 text-blue-400/80 hover:bg-slate-700'
              : isActive
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/50'
              : 'bg-slate-800/80 text-emerald-400/80 hover:bg-slate-700';

          return (
            <button
              key={gear}
              id={`gear-btn-${gear}`}
              type="button"
              onClick={() => onShift(gear)}
              className={`h-9 rounded-xl border flex items-center justify-center font-black text-sm transition-all shadow-md active:scale-90 ${colorClass}`}
            >
              {gear}
            </button>
          );
        })}
      </div>
    </div>
  );
};
