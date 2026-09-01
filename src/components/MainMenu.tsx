import React, { useState } from 'react';
import { Play, Shield, User, MapPin, Sparkles, Volume2, VolumeX, Gift, ExternalLink, Check } from 'lucide-react';

interface MainMenuProps {
  coins: number;
  highestStage: number;
  selectedCarName: string;
  selectedCharacterName: string;
  isMuted: boolean;
  aparatRewardClaimed?: boolean;
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenCharacters: () => void;
  onOpenStages: () => void;
  onOpenStory?: () => void;
  onToggleMute: () => void;
  onClaimAparatReward: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  coins,
  highestStage,
  selectedCarName,
  selectedCharacterName,
  isMuted,
  aparatRewardClaimed = false,
  onStartGame,
  onOpenGarage,
  onOpenCharacters,
  onOpenStages,
  onOpenStory,
  onToggleMute,
  onClaimAparatReward,
}) => {
  const [showAparatModal, setShowAparatModal] = useState<boolean>(false);
  const [claimedSuccess, setClaimedSuccess] = useState<boolean>(aparatRewardClaimed);
  const [hasVisitedChannel, setHasVisitedChannel] = useState<boolean>(false);

  const handleOpenAparat = () => {
    window.open('https://www.aparat.com/ShahinEdu', '_blank');
    setHasVisitedChannel(true);
  };

  const handleClaim = () => {
    if (aparatRewardClaimed || claimedSuccess || !hasVisitedChannel) return;
    onClaimAparatReward();
    setClaimedSuccess(true);
  };

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
      <div className="flex flex-col items-center text-center my-3 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ماموریت داستانی: نجات غفلت از قلعه‌نو</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 tracking-tight drop-shadow-md">
          نجات غفلت
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xs">
          بازی مهیج اتومبیل‌رانی در اتوبان‌های ایران با دنده ۳ حالته، نیترو ۲ برابر، شلیک تیربار و موزیک شاد ۶/۸
        </p>

        {/* Active Driver & Car Badge */}
        <div className="flex items-center gap-2 mt-2 bg-slate-800/70 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs">
          <span className="text-slate-400">راننده:</span>
          <span className="font-black text-pink-400">{selectedCharacterName}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">خودرو:</span>
          <span className="font-black text-cyan-400">{selectedCarName}</span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-xs space-y-2 my-2">
        {/* Play Button */}
        <button
          id="btn-start-driving"
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/25 border border-emerald-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>شروع رانندگی</span>
        </button>

        {/* Free Coins Aparat Reward Button */}
        <button
          id="btn-free-aparat-coins"
          type="button"
          onClick={() => setShowAparatModal(true)}
          className={`w-full py-3 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all border ${
            aparatRewardClaimed || claimedSuccess
              ? 'bg-slate-900 border-slate-800 text-slate-400 opacity-80 cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 border-amber-300 shadow-amber-500/20'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>
            {aparatRewardClaimed || claimedSuccess
              ? '✅ سکه رایگان آپارات (دریافت شد)'
              : '🎁 دریافت ۵۰۰ سکه رایگان (کانال آپارات)'}
          </span>
        </button>

        {/* Story Mode */}
        {onOpenStory && (
          <button
            id="btn-open-story"
            type="button"
            onClick={onOpenStory}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>بخش داستانی (نجات غفلت)</span>
          </button>
        )}

        {/* Garage */}
        <button
          id="btn-open-garage"
          type="button"
          onClick={onOpenGarage}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>گاراژ ماشین‌ها (۲۰ خودرو)</span>
        </button>

        {/* Character Select */}
        <button
          id="btn-open-characters"
          type="button"
          onClick={onOpenCharacters}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <User className="w-4 h-4 text-pink-400" />
          <span>انتخاب راننده (۸ شخصیت)</span>
        </button>

        {/* Stage Select */}
        <button
          id="btn-open-stages"
          type="button"
          onClick={onOpenStages}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>انتخاب مرحله (مرحله فعلی: {highestStage})</span>
        </button>
      </div>

      {/* Footer Instructions / Touch Hint */}
      <div className="text-center text-[11px] text-slate-500 leading-relaxed pt-1 flex flex-col items-center gap-1">
        <span>کنترل: غربیلک فرمان برای هدایت • دنده ۱ تا ۳ برای سرعت • پدال ترمز • نیترو ۲ برابر • شلیک تیربار</span>
        <a 
          href="https://www.aparat.com/ShahinEdu" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-amber-400/90 hover:text-amber-300 font-bold underline transition-colors"
        >
          کانال آپارات ShahinEdu
        </a>
      </div>

      {/* Aparat Free Coins Modal */}
      {showAparatModal && (
        <div
          id="aparat-reward-modal"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xs bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
                🎁 هدیه ویژه ۵۰۰ سکه
              </span>
              <button
                type="button"
                onClick={() => setShowAparatModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <h2 className="text-xl font-black text-white text-center">دنبال کردن کانال آپارات</h2>
            
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              ابتدا روی کلید ورود به کانال آپارات بزنید تا کانال ما را دنبال کنید، سپس کلید دریافت سکه فعال خواهد شد.
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Step 1: Open Aparat Channel */}
              <button
                type="button"
                onClick={handleOpenAparat}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {hasVisitedChannel ? '✅ وارد کانال شدید (ورود مجدد)' : '1️⃣ ورود به کانال آپارات (ShahinEdu)'}
                </span>
              </button>

              {/* Step 2: Claim Coins Button */}
              <button
                type="button"
                onClick={handleClaim}
                disabled={aparatRewardClaimed || claimedSuccess || !hasVisitedChannel}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  aparatRewardClaimed || claimedSuccess
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                    : !hasVisitedChannel
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border border-amber-300 active:scale-95'
                }`}
              >
                {aparatRewardClaimed || claimedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>۵۰۰ سکه دریافت شد!</span>
                  </>
                ) : !hasVisitedChannel ? (
                  <>
                    <Gift className="w-4 h-4 text-slate-500" />
                    <span>2️⃣ اول روی ورود به کانال بزنید</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>2️⃣ دریافت ۵۰۰ سکه رایگان</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowAparatModal(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all"
              >
                بازگشت به منو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
