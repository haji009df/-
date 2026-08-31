import React from 'react';
import { Coins, Heart, Car, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { BiomeConfig } from '../types';

interface TopHUDProps {
  currentStage: number;
  biome?: BiomeConfig;
  coins: number;
  stageCoins: number;
  overtakenCount: number;
  lives: number;
  maxLives: number;
  stageDistance: number;
  targetStageDistance: number;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  currentStage,
  biome,
  coins,
  stageCoins,
  overtakenCount,
  lives,
  maxLives,
  stageDistance,
  targetStageDistance,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
}) => {
  const progressPercent = Math.min(100, Math.round((stageDistance / targetStageDistance) * 100));

  return (
    <div
      id="top-hud-panel"
      className="absolute top-2 left-2 right-2 flex flex-col gap-1.5 pointer-events-none z-20"
    >
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900/85 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md">
        {/* Left: Speedometer placeholder space (gauge drawn on canvas directly) & Stage Info */}
        <div className="flex items-center gap-2 pl-14">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-400">
                مرحله {currentStage}
              </span>
              {biome && (
                <span className="text-[10px] text-slate-300 font-medium truncate max-w-[120px]">
                  ({biome.nameFa})
                </span>
              )}
            </div>

            {/* Stage Distance Progress Bar */}
            <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700 mt-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center/Right Stats: Coins, Overtakes, Lives */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 rounded-xl px-2 py-0.5 text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{coins}</span>
          </div>

          {/* Overtaken Cars */}
          <div className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 rounded-xl px-2 py-0.5 text-blue-400">
            <Car className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{overtakenCount}</span>
          </div>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxLives }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-3.5 h-3.5 ${
                  idx < lives
                    ? 'text-red-500 fill-red-500 animate-pulse'
                    : 'text-slate-600 fill-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Audio & Pause Controls (pointer-events-auto) */}
          <div className="flex items-center gap-1 pointer-events-auto border-r border-slate-700 pr-1.5 mr-0.5">
            <button
              id="hud-mute-btn"
              type="button"
              onClick={onToggleMute}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white active:scale-95"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            <button
              id="hud-pause-btn"
              type="button"
              onClick={onTogglePause}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white active:scale-95"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
