import React from 'react';
import { MapPin, Lock, CheckCircle2, Flag } from 'lucide-react';
import { BIOMES } from '../game/constants';

interface StageSelectModalProps {
  isOpen: boolean;
  currentStage: number;
  highestStage: number;
  onSelectStage: (stage: number) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  currentStage,
  highestStage,
  onSelectStage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="stage-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-black text-white">انتخاب مرحله (۱ تا ۱۰۰)</h2>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-xl">
            رکورد باز شده: مرحله {highestStage}
          </span>
        </div>

        {/* Biomes & Stage Groups */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {BIOMES.map((biome, biomeIdx) => {
            const startStage = biome.stageRange[0];
            const endStage = biome.stageRange[1];
            const isBiomeUnlocked = highestStage >= startStage;

            return (
              <div
                key={biome.id}
                id={`biome-section-${biome.id}`}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
              >
                {/* Biome Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: biome.curbColor1 }}
                    />
                    <span className="font-black text-white text-sm">
                      {biomeIdx + 1}. {biome.nameFa}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">
                    مراحل {startStage} تا {endStage}
                  </span>
                </div>

                {/* Stages Grid (10 buttons) */}
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: endStage - startStage + 1 }).map((_, idx) => {
                    const stageNum = startStage + idx;
                    const isUnlocked = stageNum <= highestStage;
                    const isCurrent = stageNum === currentStage;

                    return (
                      <button
                        key={stageNum}
                        id={`stage-btn-${stageNum}`}
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            onSelectStage(stageNum);
                            onClose();
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center font-black text-xs transition-all relative ${
                          isCurrent
                            ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                            : isUnlocked
                            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 active:scale-90'
                            : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <span>{stageNum}</span>
                            {stageNum < highestStage && (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 absolute top-1 right-1" />
                            )}
                          </>
                        ) : (
                          <Lock className="w-3 h-3 text-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            id="close-stage-modal-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-95 transition-all"
          >
            بستن و بازگشت
          </button>
        </div>
      </div>
    </div>
  );
};
