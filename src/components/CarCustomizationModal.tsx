import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sparkles, Check, RotateCcw, Shield, Layers, SunMedium, Eye, Coins, Lock } from 'lucide-react';
import { CarCustomization, CarData, DecalStyle, RimStyle, SpoilerStyle, UnderglowColor } from '../types';
import { GraphicsRenderer } from '../game/proceduralGraphics';
import { audioManager } from '../game/audio';

interface CarCustomizationModalProps {
  isOpen: boolean;
  car: CarData;
  customization?: CarCustomization;
  currentCoins: number;
  unlockedCustomizations?: string[];
  onSaveCustomization: (carId: number, custom: CarCustomization, cost: number, newUnlockedKeys: string[]) => void;
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

export const DECAL_OPTIONS: { id: DecalStyle; name: string; price: number; key: string }[] = [
  { id: 'none', name: 'ساده فابریک', price: 0, key: 'decal:none' },
  { id: 'stripes', name: 'دو خط مسابقه‌ای', price: 120, key: 'decal:stripes' },
  { id: 'gt_side', name: 'خط بغل GT', price: 150, key: 'decal:gt_side' },
  { id: 'carbon_hood', name: 'کاپوت کربن', price: 180, key: 'decal:carbon_hood' },
  { id: 'police', name: 'طرح پلیس', price: 220, key: 'decal:police' },
  { id: 'taxi_checkers', name: 'شطرنجی تاکسی', price: 100, key: 'decal:taxi_checkers' },
  { id: 'flames', name: 'شعله‌های آتشین', price: 250, key: 'decal:flames' },
];

export const TINT_OPTIONS: { value: number; name: string; price: number; key: string }[] = [
  { value: 0, name: 'شفاف فابریک ۰٪', price: 0, key: 'tint:0' },
  { value: 0.3, name: 'دودی ۳۰٪', price: 70, key: 'tint:0.3' },
  { value: 0.6, name: 'دودی ۶۰٪', price: 120, key: 'tint:0.6' },
  { value: 0.9, name: 'دودی تاریک ۹۰٪ (شوتی)', price: 180, key: 'tint:0.9' },
];

export const UNDERGLOW_OPTIONS: { id: UnderglowColor; name: string; color: string; price: number; key: string }[] = [
  { id: 'none', name: 'خاموش', color: '#334155', price: 0, key: 'underglow:none' },
  { id: 'cyan', name: 'فیروزه‌ای یخی', color: '#06b6d4', price: 130, key: 'underglow:cyan' },
  { id: 'pink', name: 'صورتی نئون', color: '#ec4899', price: 130, key: 'underglow:pink' },
  { id: 'lime', name: 'سبز فسفری', color: '#84cc16', price: 130, key: 'underglow:lime' },
  { id: 'amber', name: 'کهربایی', color: '#f59e0b', price: 130, key: 'underglow:amber' },
  { id: 'purple', name: 'بنفش رویال', color: '#a855f7', price: 130, key: 'underglow:purple' },
  { id: 'rgb', name: 'هفت‌رنگ RGB خفن', color: 'linear-gradient(90deg, #ef4444, #3b82f6, #10b981)', price: 280, key: 'underglow:rgb' },
];

export const SPOILER_OPTIONS: { id: SpoilerStyle; name: string; price: number; key: string }[] = [
  { id: 'none', name: 'بدون باله', price: 0, key: 'spoiler:none' },
  { id: 'lip', name: 'باله لبه‌ای (Lip)', price: 150, key: 'spoiler:lip' },
  { id: 'ducktail', name: 'باله دم‌اردکی (Ducktail)', price: 220, key: 'spoiler:ducktail' },
  { id: 'gt_wing', name: 'باله بلند مسابقه‌ای (GT)', price: 320, key: 'spoiler:gt_wing' },
];

export const RIM_OPTIONS: { id: RimStyle; name: string; price: number; key: string }[] = [
  { id: 'stock', name: 'استیل فابریک', price: 0, key: 'rim:stock' },
  { id: 'bbs_gold', name: 'BBS طلایی اسپرت', price: 180, key: 'rim:bbs_gold' },
  { id: 'blade_chrome', name: '۵ پره کروم براق', price: 210, key: 'rim:blade_chrome' },
  { id: 'sport_red', name: 'لبه قرمز مسابقه‌ای', price: 240, key: 'rim:sport_red' },
  { id: 'deep_dish', name: 'دیش گود خفن (Deep Dish)', price: 290, key: 'rim:deep_dish' },
];

export const CarCustomizationModal: React.FC<CarCustomizationModalProps> = ({
  isOpen,
  car,
  customization,
  currentCoins,
  unlockedCustomizations = [],
  onSaveCustomization,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active customization state
  const [bodyColor, setBodyColor] = useState<string>(customization?.bodyColor || car.bodyColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(customization?.secondaryColor || car.secondaryColor);
  const [decalStyle, setDecalStyle] = useState<DecalStyle>(customization?.decalStyle || 'none');
  const [tintLevel, setTintLevel] = useState<number>(customization?.tintLevel ?? 0);
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
      setTintLevel(customization?.tintLevel ?? 0);
      setUnderglow(customization?.underglow || 'none');
      setSpoiler(customization?.spoiler || 'none');
      setRimStyle(customization?.rimStyle || 'stock');
    }
  }, [isOpen, car, customization]);

  // Owned checker
  const isItemOwned = (key: string, price: number) => {
    if (price === 0) return true;
    return unlockedCustomizations.includes(key);
  };

  // Selected item specs
  const selectedDecalOpt = DECAL_OPTIONS.find(d => d.id === decalStyle) || DECAL_OPTIONS[0];
  const selectedTintOpt = TINT_OPTIONS.find(t => t.value === tintLevel) || TINT_OPTIONS[0];
  const selectedUnderglowOpt = UNDERGLOW_OPTIONS.find(u => u.id === underglow) || UNDERGLOW_OPTIONS[0];
  const selectedSpoilerOpt = SPOILER_OPTIONS.find(s => s.id === spoiler) || SPOILER_OPTIONS[0];
  const selectedRimOpt = RIM_OPTIONS.find(r => r.id === rimStyle) || RIM_OPTIONS[0];

  // Calculate unowned cost
  const unownedItems: { name: string; price: number; key: string }[] = [];
  if (!isItemOwned(selectedDecalOpt.key, selectedDecalOpt.price)) {
    unownedItems.push({ name: selectedDecalOpt.name, price: selectedDecalOpt.price, key: selectedDecalOpt.key });
  }
  if (!isItemOwned(selectedTintOpt.key, selectedTintOpt.price)) {
    unownedItems.push({ name: selectedTintOpt.name, price: selectedTintOpt.price, key: selectedTintOpt.key });
  }
  if (!isItemOwned(selectedUnderglowOpt.key, selectedUnderglowOpt.price)) {
    unownedItems.push({ name: selectedUnderglowOpt.name, price: selectedUnderglowOpt.price, key: selectedUnderglowOpt.key });
  }
  if (!isItemOwned(selectedSpoilerOpt.key, selectedSpoilerOpt.price)) {
    unownedItems.push({ name: selectedSpoilerOpt.name, price: selectedSpoilerOpt.price, key: selectedSpoilerOpt.key });
  }
  if (!isItemOwned(selectedRimOpt.key, selectedRimOpt.price)) {
    unownedItems.push({ name: selectedRimOpt.name, price: selectedRimOpt.price, key: selectedRimOpt.key });
  }

  const totalCost = unownedItems.reduce((sum, item) => sum + item.price, 0);
  const canAfford = currentCoins >= totalCost;

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
    if (!canAfford) return;

    const customObj: CarCustomization = {
      bodyColor,
      secondaryColor,
      decalStyle,
      tintLevel,
      underglow,
      spoiler,
      rimStyle,
    };

    const newKeys = unownedItems.map(it => it.key);
    onSaveCustomization(car.id, customObj, totalCost, newKeys);
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
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                تیونینگ و ارتقا: {car.nameFa}
              </h2>
              <p className="text-[10px] text-slate-400">
                تغییر رنگ کاملاً رایگان • قطعات اسپرت و شیشه دودی نیازمند سکه
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl px-2.5 py-1 text-amber-400 font-black text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{currentCoins}</span>
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
        </div>

        {/* Interactive Top Canvas Preview Studio */}
        <div className="relative my-2 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center bg-slate-950">
          <canvas ref={canvasRef} width={280} height={130} className="block" />
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700">
            نمای زنده تیونینگ
          </div>
          {totalCost > 0 && (
            <div className="absolute top-2 right-3 text-[10px] text-amber-300 font-black bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-600/50 flex items-center gap-1">
              <span>مبلغ پرداختی:</span>
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{totalCost}</span>
            </div>
          )}
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
            رنگ (رایگان)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decals')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'decals' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            طرح بدنه
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
        <div className="flex-1 overflow-y-auto py-2.5 space-y-3 pr-1 min-h-[140px]">
          {/* TAB 1: Paint Color Selection (100% Free) */}
          {activeTab === 'color' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">پالت رنگ‌های متالیک بدنه:</span>
                <span className="text-[10px] text-emerald-400 font-black bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                  کاملاً رایگان
                </span>
              </div>
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

          {/* TAB 2: Decal Style Selection (Coin based) */}
          {activeTab === 'decals' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">طرح و خط‌کشی‌های مسابقه‌ای:</span>
              <div className="grid grid-cols-2 gap-2">
                {DECAL_OPTIONS.map((dec) => {
                  const isSelected = decalStyle === dec.id;
                  const isOwned = isItemOwned(dec.key, dec.price);
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
                      <div className="flex flex-col text-right">
                        <span>{dec.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {isOwned ? (dec.price === 0 ? 'رایگان فابریک' : 'خریداری شده') : `🪙 ${dec.price} سکه`}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Window Tint Level (Coin based) */}
          {activeTab === 'tint' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">درصد دودی کردن شیشه‌ها:</span>
              <div className="grid grid-cols-2 gap-2">
                {TINT_OPTIONS.map((t) => {
                  const isSelected = tintLevel === t.value;
                  const isOwned = isItemOwned(t.key, t.price);
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
                      <div className="flex flex-col text-right">
                        <span>{t.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {isOwned ? (t.price === 0 ? 'فابریک ۰٪' : 'خریداری شده') : `🪙 ${t.price} سکه`}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Underglow Neon Lighting (Coin based) */}
          {activeTab === 'underglow' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold">نورپردازی و نئون زیر ماشین:</span>
              <div className="grid grid-cols-2 gap-2">
                {UNDERGLOW_OPTIONS.map((u) => {
                  const isSelected = underglow === u.id;
                  const isOwned = isItemOwned(u.key, u.price);
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
                          className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                          style={{ background: u.color }}
                        />
                        <div className="flex flex-col text-right">
                          <span>{u.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {isOwned ? (u.price === 0 ? 'خاموش' : 'خریداری شده') : `🪙 ${u.price} سکه`}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Spoiler & Rim Tuning (Coin based) */}
          {activeTab === 'tuning' && (
            <div className="space-y-3">
              {/* Spoilers */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold">باله عقب (اسپویلر):</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPOILER_OPTIONS.map((sp) => {
                    const isSelected = spoiler === sp.id;
                    const isOwned = isItemOwned(sp.key, sp.price);
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
                        <div className="flex flex-col text-right">
                          <span>{sp.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {isOwned ? (sp.price === 0 ? 'بدون باله' : 'خریداری شده') : `🪙 ${sp.price} سکه`}
                          </span>
                        </div>
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
                    const isOwned = isItemOwned(r.key, r.price);
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
                        <div className="flex flex-col text-right">
                          <span>{r.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {isOwned ? (r.price === 0 ? 'استیل فابریک' : 'خریداری شده') : `🪙 ${r.price} سکه`}
                          </span>
                        </div>
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
            disabled={!canAfford}
            className={`flex-1 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
              !canAfford
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : totalCost > 0
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {totalCost > 0 ? (
              canAfford ? (
                <>
                  <Coins className="w-4 h-4 text-slate-950" />
                  <span>خرید و نصب قطعات (🪙 {totalCost})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>سکه ناکافی (نیاز به 🪙 {totalCost})</span>
                </>
              )
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>نصب تغییرات (رایگان)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
