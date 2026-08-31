import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { audioManager } from './game/audio';
import { CARS, CHARACTERS, BIOMES, getBiomeForStage, loadGameSave, saveGameSave } from './game/constants';
import { CarCustomization, CarData, CharacterData, GameSaveData } from './types';
import { TopHUD } from './components/TopHUD';
import { SteeringWheel } from './components/SteeringWheel';
import { GearShifter } from './components/GearShifter';
import { ActionControls } from './components/ActionControls';
import { GarageModal } from './components/GarageModal';
import { CarCustomizationModal } from './components/CarCustomizationModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { StageSelectModal } from './components/StageSelectModal';
import { MainMenu } from './components/MainMenu';
import { RotateCcw, Home, Play, Volume2, VolumeX, Award } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Save Data & State
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameSave());
  const [inMenu, setInMenu] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Game State Readouts (synced from engine)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [coins, setCoins] = useState<number>(saveData.coins);
  const [stageCoins, setStageCoins] = useState<number>(0);
  const [overtakenCount, setOvertakenCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [maxLives, setMaxLives] = useState<number>(3);
  const [currentGear, setCurrentGear] = useState<number>(1);
  const [stageDistance, setStageDistance] = useState<number>(0);
  const [targetStageDistance, setTargetStageDistance] = useState<number>(1000);
  const [nitroCharges, setNitroCharges] = useState<number>(1);
  const [nitroActive, setNitroActive] = useState<boolean>(false);
  const [nitroUnlocked, setNitroUnlocked] = useState<boolean>(false);
  const [gunAmmo, setGunAmmo] = useState<number>(3);
  const [gunUnlocked, setGunUnlocked] = useState<boolean>(false);

  // Modal Dialogs
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState<boolean>(false);
  const [customizingCar, setCustomizingCar] = useState<CarData | null>(null);
  const [isCharactersOpen, setIsCharactersOpen] = useState<boolean>(false);
  const [isStagesOpen, setIsStagesOpen] = useState<boolean>(false);

  // Initialize Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialSave = loadGameSave();
    const engine = new GameEngine(canvas, initialSave);
    engineRef.current = engine;

    // Callbacks
    engine.onStateUpdate = (eng) => {
      setCurrentStage(eng.currentStage);
      setCoins(eng.saveData.coins);
      setStageCoins(eng.stageCoinsCollected);
      setOvertakenCount(eng.stageOvertakenCount);
      setLives(eng.lives);
      setMaxLives(eng.maxLives);
      setCurrentGear(eng.currentGear);
      setStageDistance(eng.stageDistance);
      setTargetStageDistance(eng.targetStageDistance);
      setNitroCharges(eng.nitroCharges);
      setNitroActive(eng.nitroActive);
      setNitroUnlocked(eng.milestones.nitroUnlocked);
      setGunAmmo(eng.gunAmmo);
      setGunUnlocked(eng.milestones.gunUnlocked);
      setIsGameOver(eng.isGameOver);
      setIsPaused(eng.isPaused);
    };

    engine.onGameOver = () => {
      setIsGameOver(true);
    };

    engine.onStageClear = (stage, bonus) => {
      setSaveData({ ...engine.saveData });
    };

    // Resize Observer for responsive canvas sizing
    const updateSize = () => {
      if (containerRef.current && engineRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        engineRef.current.resize(Math.floor(rect.width), Math.floor(rect.height));
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => {
      window.removeEventListener('resize', updateSize);
      engine.isRunning = false;
    };
  }, []);

  // Sync active car, character, and biome
  const selectedCar = CARS.find((c) => c.id === saveData.selectedCarId) || CARS[0];
  const selectedCharacter = CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];
  const currentBiome = engineRef.current?.currentBiome || getBiomeForStage(currentStage) || BIOMES[0];

  const handleStartGame = () => {
    audioManager.init();
    audioManager.resumeIfSuspended();
    if (engineRef.current) {
      engineRef.current.resetPlayerState();
      engineRef.current.start();
    }
    setInMenu(false);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const handleSteer = useCallback((normAngle: number) => {
    if (engineRef.current) {
      engineRef.current.setSteering(normAngle);
    }
  }, []);

  const handleShiftGear = (gear: number) => {
    if (engineRef.current) {
      engineRef.current.shiftGear(gear);
    }
  };

  const handleHorn = () => {
    if (engineRef.current) {
      engineRef.current.triggerHorn();
    }
  };

  const handleNitro = () => {
    if (engineRef.current) {
      engineRef.current.triggerNitro();
    }
  };

  const handleGun = () => {
    if (engineRef.current) {
      engineRef.current.triggerGun();
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMute(nextMute);
    const updated = { ...saveData, soundEnabled: !nextMute };
    setSaveData(updated);
    saveGameSave(updated);
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
    } else {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetPlayerState();
      engineRef.current.resume();
    }
    setIsGameOver(false);
    setIsPaused(false);
  };

  const handleReturnToMenu = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setInMenu(true);
    setIsGameOver(false);
    setIsPaused(false);
  };

  // Car Selection & Purchases
  const handleSelectCar = (car: CarData) => {
    const updated = { ...saveData, selectedCarId: car.id };
    setSaveData(updated);
    saveGameSave(updated);
    if (engineRef.current) engineRef.current.setCar(car);
  };

  const handleUnlockCar = (car: CarData) => {
    if (saveData.coins >= car.price && !saveData.unlockedCars.includes(car.id)) {
      const updated: GameSaveData = {
        ...saveData,
        coins: saveData.coins - car.price,
        unlockedCars: [...saveData.unlockedCars, car.id],
        selectedCarId: car.id,
      };
      setSaveData(updated);
      saveGameSave(updated);
      if (engineRef.current) {
        engineRef.current.saveData = updated;
        engineRef.current.setCar(car);
      }
      audioManager.playCoin();
    }
  };

  // Car Customization
  const handleOpenCustomization = (car: CarData) => {
    setCustomizingCar(car);
    setIsCustomizationOpen(true);
  };

  const handleSaveCustomization = (carId: number, custom: CarCustomization) => {
    const updatedCustomizations = {
      ...(saveData.carCustomizations || {}),
      [carId]: custom,
    };
    const updated: GameSaveData = {
      ...saveData,
      carCustomizations: updatedCustomizations,
    };
    setSaveData(updated);
    saveGameSave(updated);
    if (engineRef.current) {
      engineRef.current.saveData = updated;
    }
  };

  // Character Selection & Purchases
  const handleSelectCharacter = (char: CharacterData) => {
    const updated = { ...saveData, selectedCharacterId: char.id };
    setSaveData(updated);
    saveGameSave(updated);
    if (engineRef.current) engineRef.current.setCharacter(char);
  };

  const handleUnlockCharacter = (char: CharacterData) => {
    if (saveData.coins >= char.price && !saveData.unlockedCharacters.includes(char.id)) {
      const updated: GameSaveData = {
        ...saveData,
        coins: saveData.coins - char.price,
        unlockedCharacters: [...saveData.unlockedCharacters, char.id],
        selectedCharacterId: char.id,
      };
      setSaveData(updated);
      saveGameSave(updated);
      if (engineRef.current) {
        engineRef.current.saveData = updated;
        engineRef.current.setCharacter(char);
      }
      audioManager.playCoin();
    }
  };

  // Stage Selection
  const handleSelectStage = (stageNum: number) => {
    if (engineRef.current) {
      engineRef.current.setStage(stageNum);
    }
  };

  return (
    <main
      id="game-root-wrapper"
      className="w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none touch-none"
    >
      {/* Mobile-Proportional Viewport Frame (Max width 460px on desktop) */}
      <div
        id="game-viewport-frame"
        ref={containerRef}
        className="relative w-full h-full max-w-[460px] bg-black shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Canvas 2D Game Layer */}
        <canvas
          id="game-canvas"
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block z-0"
        />

        {/* In-Game Active UI Overlay */}
        {!inMenu && (
          <div id="active-gameplay-overlay" className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none p-3">
            {/* Top HUD Stats Bar */}
            <div className="pointer-events-auto">
              <TopHUD
                currentStage={currentStage}
                biome={currentBiome}
                coins={coins}
                stageCoins={stageCoins}
                overtakenCount={overtakenCount}
                lives={lives}
                maxLives={maxLives}
                stageDistance={stageDistance}
                targetStageDistance={targetStageDistance}
                isPaused={isPaused}
                isMuted={isMuted}
                onTogglePause={handleTogglePause}
                onToggleMute={handleToggleMute}
              />
            </div>

            {/* Bottom Controls Area (Steering, Gearbox, Horn, Nitro, Gun) */}
            <div className="pointer-events-auto flex items-end justify-between gap-2 pb-2">
              {/* Left Column: Steering Wheel */}
              <div className="flex-1 flex justify-start items-center">
                <SteeringWheel onSteer={handleSteer} />
              </div>

              {/* Center Action Controls (Horn, Nitro, Gun) */}
              <div className="flex flex-col items-center">
                <ActionControls
                  onHorn={handleHorn}
                  onNitro={handleNitro}
                  onGun={handleGun}
                  nitroCharges={nitroCharges}
                  nitroActive={nitroActive}
                  nitroUnlocked={nitroUnlocked}
                  gunAmmo={gunAmmo}
                  gunUnlocked={gunUnlocked}
                />
              </div>

              {/* Right Column: 3-Gear Shifter */}
              <div className="flex-1 flex justify-end items-center">
                <GearShifter
                  currentGear={currentGear}
                  onShift={handleShiftGear}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Menu Overlay */}
        {inMenu && (
          <MainMenu
            coins={saveData.coins}
            highestStage={saveData.highestStage}
            selectedCarName={selectedCar.nameFa}
            selectedCharacterName={selectedCharacter.nameFa}
            isMuted={isMuted}
            onStartGame={handleStartGame}
            onOpenGarage={() => setIsGarageOpen(true)}
            onOpenCharacters={() => setIsCharactersOpen(true)}
            onOpenStages={() => setIsStagesOpen(true)}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Pause Modal Overlay */}
        {isPaused && !isGameOver && (
          <div
            id="pause-modal"
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200"
          >
            <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <h2 className="text-2xl font-black text-amber-400">بازی متوقف شد</h2>
              <p className="text-xs text-slate-300">
                مرحله {currentStage} ({currentBiome.nameFa})
              </p>

              <div className="space-y-2 pt-2">
                <button
                  id="resume-btn"
                  type="button"
                  onClick={handleTogglePause}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>ادامه بازی</span>
                </button>

                <button
                  id="restart-stage-btn"
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>شروع مجدد مرحله</span>
                </button>

                <button
                  id="pause-return-menu-btn"
                  type="button"
                  onClick={handleReturnToMenu}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>منوی اصلی</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal Overlay */}
        {isGameOver && (
          <div
            id="gameover-modal"
            className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-300"
          >
            <div className="w-full max-w-xs bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 font-black text-xl">
                💥
              </div>

              <h2 className="text-2xl font-black text-red-400">تصادف شدید!</h2>
              <p className="text-xs text-slate-300">
                جان‌های خودرو به پایان رسید.
              </p>

              {/* Stage Run Stats */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>سکه‌های جمع‌آوری شده:</span>
                  <span className="font-black text-amber-400">+{stageCoins}</span>
                </div>
                <div className="flex justify-between">
                  <span>ماشین‌های لایی کشیده:</span>
                  <span className="font-black text-cyan-400">{overtakenCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>مرحله فعلی:</span>
                  <span className="font-black text-white">{currentStage}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  id="gameover-retry-btn"
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تلاش مجدد</span>
                </button>

                <button
                  id="gameover-menu-btn"
                  type="button"
                  onClick={handleReturnToMenu}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>منوی اصلی و گاراژ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub Modals */}
        <GarageModal
          isOpen={isGarageOpen}
          selectedCarId={saveData.selectedCarId}
          unlockedCars={saveData.unlockedCars}
          currentCoins={saveData.coins}
          customizations={saveData.carCustomizations}
          onSelectCar={handleSelectCar}
          onUnlockCar={handleUnlockCar}
          onOpenCustomization={handleOpenCustomization}
          onClose={() => setIsGarageOpen(false)}
        />

        {customizingCar && (
          <CarCustomizationModal
            isOpen={isCustomizationOpen}
            car={customizingCar}
            customization={saveData.carCustomizations?.[customizingCar.id]}
            onSaveCustomization={handleSaveCustomization}
            onClose={() => setIsCustomizationOpen(false)}
          />
        )}

        <CharacterSelectModal
          isOpen={isCharactersOpen}
          selectedCharacterId={saveData.selectedCharacterId}
          unlockedCharacters={saveData.unlockedCharacters}
          currentCoins={saveData.coins}
          highestStage={saveData.highestStage}
          onSelectCharacter={handleSelectCharacter}
          onUnlockCharacter={handleUnlockCharacter}
          onClose={() => setIsCharactersOpen(false)}
        />

        <StageSelectModal
          isOpen={isStagesOpen}
          currentStage={currentStage}
          highestStage={saveData.highestStage}
          onSelectStage={handleSelectStage}
          onClose={() => setIsStagesOpen(false)}
        />
      </div>
    </main>
  );
}
