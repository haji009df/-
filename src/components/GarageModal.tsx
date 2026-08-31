import React, { useEffect, useRef } from 'react';
import { Shield, Gauge, Zap, Compass, Lock, Check, Coins, Palette } from 'lucide-react';
import { CarCustomization, CarData } from '../types';
import { CARS } from '../game/constants';
import { GraphicsRenderer } from '../game/proceduralGraphics';

interface GarageModalProps {
  isOpen: boolean;
  selectedCarId: number;
  unlockedCars: number[];
  currentCoins: number;
  customizations?: Record<number, CarCustomization>;
  onSelectCar: (car: CarData) => void;
  onUnlockCar: (car: CarData) => void;
  onOpenCustomization: (car: CarData) => void;
  onClose: () => void;
}

const CarPreviewCanvas: React.FC<{ car: CarData; custom?: CarCustomization }> = ({ car, custom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GraphicsRenderer.drawCarWithCustomization(
      ctx,
      canvas.width / 2,
      canvas.height / 2,
      car,
      custom,
      0,
      false,
      0.95,
      false,
      0
    );
  }, [car, custom]);

  return <canvas ref={canvasRef} width={64} height={80} className="shrink-0" />;
};

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  selectedCarId,
  unlockedCars,
  currentCoins,
  customizations,
  onSelectCar,
  onUnlockCar,
  onOpenCustomization,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="garage-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg font-black text-white">گاراژ ۲۰ خودرو یونس آباد</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl px-2.5 py-1 text-amber-400 font-black text-sm">
            <Coins className="w-4 h-4" />
            <span>{currentCoins}</span>
          </div>
        </div>

        {/* Cars List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {CARS.map((car) => {
            const isUnlocked = unlockedCars.includes(car.id) || car.unlockedByDefault;
            const isSelected = selectedCarId === car.id;
            const canAfford = currentCoins >= car.price;
            const custom = customizations?.[car.id];

            return (
              <div
                key={car.id}
                id={`car-card-${car.id}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Canvas Thumbnail */}
                  <CarPreviewCanvas car={car} custom={custom} />

                  {/* Specs & Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">{car.nameFa}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {car.nameEn}
                      </span>
                    </div>

                    {/* Stat Progress Bars */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-[11px] text-slate-300">
                      {/* Top Speed */}
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3 h-3 text-cyan-400 shrink-0" />
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full"
                            style={{ width: `${(car.topSpeed / 250) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Acceleration */}
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full"
                            style={{ width: `${car.acceleration}%` }}
                          />
                        </div>
                      </div>

                      {/* Handling */}
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-emerald-400 shrink-0" />
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full"
                            style={{ width: `${car.handling}%` }}
                          />
                        </div>
                      </div>

                      {/* Armor */}
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-rose-400 shrink-0" />
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-400 h-full"
                            style={{ width: `${car.armor}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Select, Customize, or Buy */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        انتخاب شده
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectCar(car)}
                        className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black border border-slate-700 active:scale-95 transition-all"
                      >
                        رانندگی
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUnlockCar(car)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {car.price} سکه
                      </button>
                    )}

                    {/* Customize button for unlocked cars */}
                    {isUnlocked && (
                      <button
                        type="button"
                        onClick={() => onOpenCustomization(car)}
                        className="px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Palette className="w-3 h-3 text-cyan-400" />
                        <span>اسپرت و تیونینگ</span>
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
            id="close-garage-modal-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-95 transition-all"
          >
            بستن و بازگشت به بازی
          </button>
        </div>
      </div>
    </div>
  );
};
