import React from 'react';
import { StoryChapter } from '../types';
import { STORY_CHAPTERS } from '../game/constants';
import { BookOpen, ShieldAlert, Award, ChevronRight, X, Play } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  activeChapter?: StoryChapter | null;
  currentStage: number;
  onClose: () => void;
  onSelectChapter?: (chapter: StoryChapter) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  activeChapter,
  currentStage,
  onClose,
  onSelectChapter,
}) => {
  const [selectedTabChapter, setSelectedTabChapter] = React.useState<StoryChapter>(
    activeChapter || STORY_CHAPTERS[0]
  );

  React.useEffect(() => {
    if (activeChapter) {
      setSelectedTabChapter(activeChapter);
    }
  }, [activeChapter]);

  if (!isOpen) return null;

  const displayChapter = activeChapter || selectedTabChapter;

  return (
    <div
      id="story-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        id="story-modal-content"
        className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-200" />
            <div>
              <h2 className="text-lg font-black tracking-wide">ماموریت داستانی: نجات غفلت</h2>
              <p className="text-xs text-amber-100 font-medium">از جاده‌های ایران تا زندان قلعه‌نو</p>
            </div>
          </div>
          <button
            id="story-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Chapter Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                مرحله موردنیاز: {displayChapter.stageTrigger}
              </span>
              <span className="text-xs text-slate-400 font-medium">{displayChapter.subtitleFa}</span>
            </div>

            <h3 className="text-base font-black text-amber-300 mb-3">{displayChapter.titleFa}</h3>

            {/* Character Dialogue Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex gap-3 items-start">
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-md"
                style={{ backgroundColor: displayChapter.avatarColor }}
              >
                {displayChapter.speakerFa.slice(0, 1)}
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  پیام {displayChapter.speakerFa}:
                </span>
                <p className="text-xs leading-relaxed text-slate-200">{displayChapter.messageFa}</p>
              </div>
            </div>

            {/* Objective */}
            <div className="mt-3 bg-amber-950/30 border border-amber-700/40 rounded-xl p-2.5 flex items-center gap-2 text-amber-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>هدف: {displayChapter.objectiveFa}</span>
            </div>
          </div>

          {/* Chapter Selector List (if browsing all chapters) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 px-1">سرفصل‌های مسیر نجات:</h4>
            <div className="grid grid-cols-1 gap-1.5">
              {STORY_CHAPTERS.map((ch) => {
                const isUnlocked = currentStage >= ch.stageTrigger;
                const isCurrent = displayChapter.id === ch.id;

                return (
                  <button
                    key={ch.id}
                    id={`story-chapter-${ch.id}`}
                    type="button"
                    onClick={() => setSelectedTabChapter(ch)}
                    className={`w-full text-right p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                        : isUnlocked
                        ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: isUnlocked ? ch.avatarColor : '#475569' }}
                      >
                        {ch.id}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{ch.titleFa}</div>
                        <div className="text-[10px] text-slate-400">مرحله {ch.stageTrigger}</div>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold">قفل</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            id="story-continue-btn"
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>گازشو بگیر و ادامه بده!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
