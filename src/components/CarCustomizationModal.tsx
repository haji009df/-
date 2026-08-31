import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sparkles, Check, RotateCcw, Shield, Layers, SunMedium, Eye } from 'lucide-react';
import { CarCustomization, CarData, DecalStyle, RimStyle, SpoilerStyle, UnderglowColor } from '../types';
import { GraphicsRenderer } from '../game/proceduralGraphics';
import { audioManager } from '../game/audio';

interface CarCustomizationModalProps {
  isOpen: boolean;
  car: CarData;
  customization?: CarCustomization;
  onSaveCustomization: (carId: number, custom: CarCustomization) => void;
  onClose: () => void;
}

const BODY_COLORS = [
  { name: 'سفید یخچالی', hex: '#f8fafc' },
  { name: 'مشکی متالیک', hex: '#0f172a' },
  { name: 'قرمز آتشین', hex: '#e11d48' },
  { name: 'آبی کاربنی', hex: '#2563eb' },
  { name: 'نقره‌ای متالیک', hex: '#94a3b8' },
  { name: 'نوک‌مدادی', hex: '#475569' },
  { name: 'زرد قناری', hex: '#eab308' },
  { name: 'سبز یشمی', hex: '#15803d' },
  { name: 'فسفری مسابقه‌ای', hex: '#84cc16' },
  { name: 'فیروزه‌ای خلیج فارس', hex: '#06b6d4' },
  { name: 'بنفش رویال', hex: '#8b5cf6' },
  { name: 'نارنجی شوتی', hex: '#ea580c' },
  { name: 'طلایی متالیک', hex: '#d97706' },
  { name: 'صورتی جیغ', hex: '#ec4899' },
];

const DECAL_OPTIONS: { id: DecalStyle; name: string }[] = [
  { id: 'none', name: 'ساده فابریک' },
  { id: 'stripes', name: 'دو خط مسابقه‌ای' },
  { id: 'gt_side', name: 'خط بغل GT' },
  { id: 'carbon_hood', name: 'کاپوت کربن' },
  { id: 'police', name: 'طرح پلیس' },
  { id: 'taxi_checkers', name: 'شطرنجی تاکسی' },
  { id: 'flames', name: 'شعله‌های آتشین' },
];

const TINT_OPTIONS: { value: number; name: string }[] = [
  { value: 0, name: 'شفاف ۰٪' },
  { value: 0.3, name: 'دودی ۳۰٪' },
  { value: 0.6, name: 'دودی ۶۰٪' },
  { value: 0.9, name: 'دودی تاریک ۹۰٪' },
];

const UNDERGLOW_OPTIONS: { id: UnderglowColor; name: string; color: string }[] = [
  { id: 'none', name: 'خاموش', color: '#334155' },
  { id: 'cyan', name: 'فیروزه‌ای یخی', color: '#06b6d4' },
  { id: 'pink', name: 'صورتی نئون', color: '#ec4899' },
  { id: 'lime', name: 'سبز فسفری', color: '#84cc16' },
  { id: 'amber', name: 'کهربایی', color: '#f59e0b' },
  { id: 'purple', name: 'بنفش', color: '#a855f7' },
  { id: 'rgb', name: 'هفت‌رنگ RGB', color: 'linear-gradient(90deg, #ef4444, #3b82f6, #10b981)' },
];

const SPOILER_OPTIONS: { id: SpoilerStyle; name: string }[] = [
  { id: 'none', name: 'بدون باله' },
  { id: 'lip', name: 'باله لبه‌ای (Lip)' },
  { id: 'ducktail', name: 'باله دم‌اردکی' },
  { id: 'gt_wing', name: 'باله بلند GT' },
];

const RIM_OPTIONS: { id: RimStyle; name: string }[] = [
  { id: 'stock', name: 'استیل فابریک' },
  { id: 'bbs_gold', name: 'BBS طلایی' },
  { id: 'blade_chrome', name: '۵ پره کروم' },
  { id: 'sport_red', name: 'لبه قرمز مسابقه‌ای' },
  { id: 'deep_dish', name: 'دیش گود اسپرت' },
];

export const CarCustomizationModal: React.FC<CarCustomizationModalProps> = ({
  isOpen,
  car,
  customization,
  onSaveCustomization,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active customization state
  const [bodyColor, setBodyColor] = useState<string>(customization?.bodyColor || car.bodyColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(customization?.secondaryColor || car.secondaryColor);
  const [decalStyle, setDecalStyle] = useState<DecalStyle>(customization?.decalStyle || 'none');
  const [tintLevel, setTintLevel] = useState<number>(customization?.tintLevel ?? 0.3);
  const [underglow, setUnderglow] = useState<UnderglowColor>(customization?.underglow || 'none');
  const [spoiler, setSpoiler] = useState<SpoilerStyle>(customization?.spoiler || 'none');
  const [rimStyle, setRimStyle] = useState<RimStyle>(customization?.rimStyle || 'stock');
  const [activeTab, setActiveTab] = useState<'color' | 'decals' | 'tint' | 'underglow' | 'tuning'>('color');

  // Reset when opened with a new car
  useEffect(() => {
    if (isOpen) {
      setBodyColor(customization?.bodyColor || car.bodyColor);
      setSecondaryColor(customization?.secondaryColor || car.secondaryColor);
      setDecalStyle(customization?.decalStyle || 'none');
      setTintLevel(customization?.tintLevel ?? 0.3);
      setUnderglow(customization?.underglow || 'none');
      setSpoiler(customization?.spoiler || 'none');
      setRimStyle(customization?.rimStyle || 'stock');
    }
  }, [isOpen, car, customization]);

  // Live Canvas Rendering Loop for Preview
  useEffect(() => {
    let animFrame: number;
    let frameTime = 0;

    const render = () => {
      frameTime += 0.016;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw studio asphalt floor with grid
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Render customized car
      const customCarData: CarData = {
        ...car,
        bodyColor,
        secondaryColor,
      };

      const customObj: CarCustomization = {
        bodyColor,
        secondaryColor,
        decalStyle,
        tintLevel,
        underglow,
        spoiler,
        rimStyle,
      };

      GraphicsRenderer.drawCarWithCustomization(
        ctx,
        canvas.width / 2,
        canvas.height / 2,
        customCarData,
        customObj,
        0,
        false,
        1.45,
        underglow === 'rgb',
        frameTime
      );

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [car, bodyColor, secondaryColor, decalStyle, tintLevel, underglow, spoiler, rimStyle]);

  if (!isOpen) return null;

  const handleSave = () => {
    const customObj: CarCustomization = {
      bodyColor,
      secondaryColor,
      decalStyle,
      tintLevel,
      underglow,
      spoiler,
      rimStyle,
    };
    onSaveCustomization(car.id, customObj);
    audioManager.playCoin();
    onClose();
  };

  const handleResetToStock = () => {
    setBodyColor(car.bodyColor);
    setSecondaryColor(car.secondaryColor);
    setDecalStyle('none');
    setTintLevel(0);
    setUnderglow('none');
    setSpoiler('none');
    setRimStyle('stock');
  };

  return (
    <div
      id="car-customization-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white">
              شخصی‌سازی و تیونینگ: {car.nameFa}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetToStock}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-xl"
            title="بازنشانی به حالت فابریک"
          >
            <RotateCcw className="w-3 h-3" />
            <span>فابریک</span>
          </button>
        </div>

        {/* Interactive Top Canvas Preview Studio */}
        <div className="relative my-3 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center bg-slate-950">
          <canvas ref={canvasRef} width={280} height={140} className="block" />
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700">
            نمای زنده تیونینگ
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'color' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            رنگ بدنه
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decals')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'decals' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            طرح و خط‌کشی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tint')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'tint' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            شیشه دودی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('underglow')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'underglow' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            نئون زیر
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tuning')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'tuning' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            باله و رینگ
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 min-h-[140px]">
          {/* TAB 1: Paint Color Selection */}
          {activeTab === 'color' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-300 font-bold">پالت رنگ‌های متالیک و براق:</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {BODY_COLORS.map((col) => {
                  const isSelected = bodyColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setBodyColor(col.hex)}
                      className={`h-11 rounded-2xl flex flex-col items-center justify-center relative border-2 transition-all active:scale-95 ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg' : 'border-slate-700 hover:border-slate-500'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            col.hex === '#f8fafc' || col.hex === '#eab308' ? 'text-slate-950' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Decal Style Selection */}
          {activeTab === 'decals' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">طرح و خط‌کشی‌های مسابقه‌ای:</span>
              <div className="grid grid-cols-2 gap-2">
                {DECAL_OPTIONS.map((dec) => {
                  const isSelected = decalStyle === dec.id;
                  return (
                    <button
                      key={dec.id}
                      type="button"
                      onClick={() => setDecalStyle(dec.id)}
                      className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-between transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{dec.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Window Tint Level */}
          {activeTab === 'tint' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">درصد دودی کردن شیشه‌ها:</span>
              <div className="grid grid-cols-2 gap-2">
                {TINT_OPTIONS.map((t) => {
                  const isSelected = tintLevel === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTintLevel(t.value)}
                      className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-between transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Underglow Neon Lighting */}
          {activeTab === 'underglow' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">نورپردازی و نئون زیر ماشین:</span>
              <div className="grid grid-cols-2 gap-2">
                {UNDERGLOW_OPTIONS.map((u) => {
                  const isSelected = underglow === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUnderglow(u.id)}
                      className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-between transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md ring-1 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ background: u.color }}
                        />
                        <span>{u.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Spoiler & Rim Tuning */}
          {activeTab === 'tuning' && (
            <div className="space-y-3">
              {/* Spoilers */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold">باله عقب (اسپویلر):</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPOILER_OPTIONS.map((sp) => {
                    const isSelected = spoiler === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSpoiler(sp.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{sp.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rims */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold">رینگ‌های مسابقه‌ای:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {RIM_OPTIONS.map((r) => {
                    const isSelected = rimStyle === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRimStyle(r.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{r.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex gap-2">
          <button
            id="cancel-custom-btn"
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all"
          >
            انصراف
          </button>
          <button
            id="apply-custom-btn"
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>ذخیره و نصب تغییرات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
