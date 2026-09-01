import React, { useRef, useState, useEffect, useCallback } from 'react';

interface SteeringWheelProps {
  onSteer: (normalizedAngle: number) => void;
  onHorn?: () => void;
  size?: number;
}

export const SteeringWheel: React.FC<SteeringWheelProps> = ({
  onSteer,
  onHorn,
  size = 145,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const startTouchRef = useRef<{ x: number; y: number; baseAngle: number }>({ x: 0, y: 0, baseAngle: 0 });

  const triggerHorn = useCallback(() => {
    if (typeof onHorn === 'function') {
      onHorn();
    }
  }, [onHorn]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    isDraggingRef.current = true;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Check if clicked in the center pad (Horn)
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    if (distFromCenter < 45) {
      triggerHorn();
      return;
    }

    const angleRad = Math.atan2(dy, dx);
    startTouchRef.current = {
      x: e.clientX,
      y: e.clientY,
      baseAngle: angleRad,
    };

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !wheelRef.current) return;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const currentAngleRad = Math.atan2(dy, dx);
    
    let deltaRad = currentAngleRad - startTouchRef.current.baseAngle;
    while (deltaRad > Math.PI) deltaRad -= Math.PI * 2;
    while (deltaRad < -Math.PI) deltaRad += Math.PI * 2;

    const targetDeg = Math.max(-80, Math.min(80, deltaRad * (180 / Math.PI) * 1.5));
    setRotationDeg(targetDeg);
    onSteer(targetDeg / 80);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setRotationDeg(0);
    onSteer(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setRotationDeg(-55);
        onSteer(-0.75);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setRotationDeg(55);
        onSteer(0.75);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        setRotationDeg(0);
        onSteer(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSteer]);

  return (
    <div
      id="steering-wheel-container"
      className="relative flex items-center justify-center select-none touch-none"
      style={{ width: size, height: size }}
    >
      {/* Peugeot-Style Modern Sport Steering Wheel Rim */}
      <div
        id="steering-wheel-disc"
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full rounded-full border-[7px] border-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 shadow-2xl relative cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          boxShadow: '0 10px 35px rgba(0,0,0,0.8), inset 0 0 20px rgba(15,23,42,0.95)',
        }}
      >
        {/* Flat Bottom Accent & Leather Grip Texture */}
        <div className="absolute top-1 w-8 h-3 bg-red-600 rounded-full shadow-md" />
        <div className="absolute left-1 w-3 h-10 bg-slate-800 rounded-full border border-slate-700" />
        <div className="absolute right-1 w-3 h-10 bg-slate-800 rounded-full border border-slate-700" />

        {/* Sculpted Metallic Spokes (Peugeot i-Cockpit style) */}
        <div className="absolute w-full h-3.5 bg-gradient-to-r from-slate-700 via-zinc-400 to-slate-700 rounded-sm shadow-inner" />
        <div className="absolute h-1/2 w-4 bg-gradient-to-b from-zinc-500 via-slate-800 to-slate-900 bottom-0 rounded-sm shadow-inner" />
        <div className="absolute w-3/4 h-2 bg-gradient-to-r from-slate-800 via-zinc-600 to-slate-800 top-3 rounded-full" />

        {/* Center Horn Pad & Chrome Lion Emblem */}
        <button
          id="center-horn-button"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHorn();
          }}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 border-2 border-zinc-500/80 shadow-xl flex flex-col items-center justify-center text-white z-10 active:scale-95 transition-transform group"
          title="بوق"
        >
          {/* Chrome Lion Silhouette Badge */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-md border border-amber-200">
            <span className="text-[10px] font-black text-slate-950">🦁</span>
          </div>
          <span className="text-[7px] font-black tracking-widest text-amber-300 mt-0.5">PEUGEOT</span>
        </button>
      </div>
    </div>
  );
};

