import React from 'react';
import { User, Lock, Check, Sparkles, Zap, Coins, Heart } from 'lucide-react';
import { CharacterData } from '../types';
import { CHARACTERS } from '../game/constants';
import { CharacterPortrait } from './CharacterPortrait';

interface CharacterSelectModalProps {
  isOpen: boolean;
  selectedCharacterId: string;
  unlockedCharacters: string[];
  currentCoins: number;
  highestStage: number;
  onSelectCharacter: (character: CharacterData) => void;
  onUnlockCharacter: (character: CharacterData) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  selectedCharacterId,
  unlockedCharacters,
  currentCoins,
  highestStage,
  onSelectCharacter,
  onUnlockCharacter,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="character-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-pink-400" />
            <h2 className="text-lg font-black text-white">انتخاب راننده و شخصیت</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl px-2.5 py-1 text-amber-400 font-black text-sm">
            <Coins className="w-4 h-4" />
            <span>{currentCoins}</span>
          </div>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {CHARACTERS.map((char) => {
            const isUnlocked = unlockedCharacters.includes(char.id) || char.unlockedByDefault;
            const isSelected = selectedCharacterId === char.id;
            const canAfford = currentCoins >= char.price;
            const meetsLevelReq = !char.minLevelToUnlock || highestStage >= char.minLevelToUnlock;

            return (
              <div
                key={char.id}
                id={`char-card-${char.id}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-pink-500 shadow-lg shadow-pink-500/20 ring-1 ring-pink-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar & Info */}
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 drop-shadow-md">
                      <CharacterPortrait characterId={char.id} size={58} showBadge={false} />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base">{char.nameFa}</span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                          {char.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {char.description}
                      </p>

                      {/* Perks badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {char.perks.coinMultiplier !== 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            ضریب سکه: {char.perks.coinMultiplier}x
                          </span>
                        )}
                        {char.perks.speedMultiplier > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            سرعت: +{Math.round((char.perks.speedMultiplier - 1) * 100)}%
                          </span>
                        )}
                        {char.perks.handlingMultiplier > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            فرمان تیز (+۳۵٪)
                          </span>
                        )}
                        {char.perks.hasDrift && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            دریفت لایی‌کشی
                          </span>
                        )}
                        {char.perks.hasRgbLights && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            چراغ‌های RGB رنگین‌کمان
                          </span>
                        )}
                        {char.perks.extraLives > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            +{char.perks.extraLives} جان اضافه
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        انتخاب شده
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectCharacter(char)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black border border-slate-700 active:scale-95 transition-all"
                      >
                        انتخاب
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUnlockCharacter(char)}
                        disabled={!canAfford || !meetsLevelReq}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          canAfford && meetsLevelReq
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {char.minLevelToUnlock && highestStage < char.minLevelToUnlock
                          ? `مرحله ${char.minLevelToUnlock}+`
                          : `${char.price} سکه`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            id="close-character-modal-btn"
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
