import React, { useRef, useState, useEffect, useCallback } from 'react';

interface SteeringWheelProps {
  onSteer: (normalizedAngle: number) => void;
  onHorn: () => void;
  size?: number;
}

export const SteeringWheel: React.FC<SteeringWheelProps> = ({
  onSteer,
  onHorn,
  size = 135,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const startTouchRef = useRef<{ x: number; y: number; baseAngle: number }>({ x: 0, y: 0, baseAngle: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    isDraggingRef.current = true;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Check if clicked in the dead center (Horn)
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    if (distFromCenter < 28) {
      onHorn();
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
    
    // Calculate rotational delta
    let deltaRad = currentAngleRad - startTouchRef.current.baseAngle;
    // Normalize delta between -PI and +PI
    while (deltaRad > Math.PI) deltaRad -= Math.PI * 2;
    while (deltaRad < -Math.PI) deltaRad += Math.PI * 2;

    const targetDeg = Math.max(-75, Math.min(75, deltaRad * (180 / Math.PI) * 1.5));
    setRotationDeg(targetDeg);
    onSteer(targetDeg / 75);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    // Spring back smoothly
    setRotationDeg(0);
    onSteer(0);
  };

  // Keyboard controls fallback for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setRotationDeg(-50);
        onSteer(-0.75);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setRotationDeg(50);
        onSteer(0.75);
      } else if (e.key === 'h' || e.key === 'H' || e.key === ' ') {
        onHorn();
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
  }, [onSteer, onHorn]);

  return (
    <div
      id="steering-wheel-container"
      className="relative flex items-center justify-center select-none touch-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Wheel Rim */}
      <div
        id="steering-wheel-disc"
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full rounded-full border-4 border-slate-700 bg-slate-900/90 shadow-2xl relative cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 16px rgba(15,23,42,0.9)',
        }}
      >
        {/* Leather Grip Segments */}
        <div className="absolute top-2 w-7 h-3 bg-red-600/80 rounded-full" />
        <div className="absolute left-2 w-3 h-7 bg-slate-700/80 rounded-full" />
        <div className="absolute right-2 w-3 h-7 bg-slate-700/80 rounded-full" />

        {/* 3 Wheel Spokes */}
        <div className="absolute w-full h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-sm" />
        <div className="absolute h-1/2 w-3 bg-gradient-to-b from-slate-600 to-slate-800 bottom-0 rounded-sm" />

        {/* Center Horn Button (دکمه بوق یونس آباد) */}
        <button
          id="center-horn-button"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHorn();
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-2 border-red-400/60 shadow-lg flex flex-col items-center justify-center text-white z-10 active:scale-95 transition-transform"
        >
          <span className="text-[10px] font-black tracking-tight text-white drop-shadow">یونس</span>
          <span className="text-[8px] font-bold text-amber-200">بوق 📢</span>
        </button>
      </div>
    </div>
  );
};
