import { BiomeConfig, CarCustomization, CarData, CharacterData, PooledTrafficCar } from '../types';

/**
 * Procedural Vector Graphics Engine
 * 100% Canvas 2D Vector Rendering - Zero External Images
 */

export class GraphicsRenderer {
  /**
   * Draw the Analog Speedometer HUD dial
   */
  public static drawAnalogSpeedometer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    speedKmh: number,
    maxSpeed: number,
    gear: number,
    rgbMode: boolean = false,
    frameTime: number = 0
  ): void {
    ctx.save();
    ctx.translate(x, y);

    // Outer Gold Bezel
    const bezelGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    bezelGrad.addColorStop(0, '#facc15');
    bezelGrad.addColorStop(0.5, '#ca8a04');
    bezelGrad.addColorStop(1, '#713f12');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = bezelGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = rgbMode 
      ? `hsl(${(frameTime * 80) % 360}, 90%, 65%)` 
      : '#fde047';
    ctx.stroke();

    // Dial Face
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0f1d';
    ctx.fill();

    // Ticks & Numbers (from -140 deg to +140 deg)
    const startAngle = Math.PI * 0.75;
    const totalSweep = Math.PI * 1.5;
    const maxDialSpeed = 240;

    for (let s = 0; s <= maxDialSpeed; s += 20) {
      const angle = startAngle + (s / maxDialSpeed) * totalSweep;
      const isMajor = s % 40 === 0;
      const isRedline = s >= 180;

      const outerR = radius - 8;
      const innerR = radius - (isMajor ? 16 : 12);

      const x1 = Math.cos(angle) * outerR;
      const y1 = Math.sin(angle) * outerR;
      const x2 = Math.cos(angle) * innerR;
      const y2 = Math.sin(angle) * innerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = isMajor ? 2.5 : 1.2;
      ctx.strokeStyle = isRedline ? '#ef4444' : isMajor ? '#f8fafc' : '#64748b';
      ctx.stroke();

      // Number text on major ticks
      if (isMajor) {
        const textR = radius - 24;
        const tx = Math.cos(angle) * textR;
        const ty = Math.sin(angle) * textR;
        ctx.font = 'bold 9px Vazirmatn, sans-serif';
        ctx.fillStyle = isRedline ? '#f87171' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${s}`, tx, ty);
      }
    }

    // Digital Center Box: Gear & Speed readout
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-radius * 0.45, radius * 0.15, radius * 0.9, radius * 0.48, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Gear indicator badge
    ctx.fillStyle = gear === 3 ? '#ef4444' : gear === 2 ? '#3b82f6' : '#22c55e';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`دنده ${gear}`, 0, radius * 0.2);

    // KM/H numerical text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Vazirmatn, monospace';
    ctx.fillText(`${Math.round(speedKmh)}`, 0, radius * 0.42);

    // Needle rotation calculation
    const clampedSpeed = Math.max(0, Math.min(maxDialSpeed, speedKmh));
    const needleAngle = startAngle + (clampedSpeed / maxDialSpeed) * totalSweep;

    // Glowing Needle
    ctx.save();
    ctx.rotate(needleAngle);

    ctx.shadowColor = rgbMode ? `hsl(${(frameTime * 100) % 360}, 100%, 50%)` : '#ef4444';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(-radius * 0.15, 0);
    ctx.lineTo(radius * 0.72, 0);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = rgbMode ? `hsl(${(frameTime * 100) % 360}, 100%, 65%)` : '#ef4444';
    ctx.stroke();

    ctx.restore();

    // Center Needle Pivot Pin
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw Headlight Cones onto the asphalt (Night Mode / Rain / Cyberpunk / Noir)
   */
  public static drawHeadlights(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    carAngle: number,
    rgbMode: boolean = false,
    frameTime: number = 0
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(carAngle);

    const beamLength = 220;
    const beamSpread = 48;

    // Left & Right headlight offsets
    const lights = [-14, 14];

    lights.forEach(lx => {
      const grad = ctx.createRadialGradient(lx, -18, 4, lx, -18 - beamLength * 0.7, beamLength);
      
      if (rgbMode) {
        const hue = (frameTime * 120 + lx * 4) % 360;
        grad.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.85)`);
        grad.addColorStop(0.3, `hsla(${hue}, 100%, 65%, 0.45)`);
        grad.addColorStop(0.7, `hsla(${hue}, 100%, 50%, 0.15)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 220, 0.85)');
        grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.45)');
        grad.addColorStop(0.6, 'rgba(253, 224, 71, 0.18)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      ctx.moveTo(lx, -18);
      ctx.lineTo(lx - beamSpread, -18 - beamLength);
      ctx.lineTo(lx + beamSpread, -18 - beamLength);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw Underglow Neon Lighting
   */
  public static drawUnderglow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    colorStyle: string = 'rgb',
    frameTime: number = 0
  ): void {
    ctx.save();
    ctx.translate(x, y);

    let shadowCol = '#06b6d4';
    let fillCol = 'rgba(6, 182, 212, 0.45)';

    if (colorStyle === 'rgb') {
      const hue = (frameTime * 140) % 360;
      shadowCol = `hsl(${hue}, 100%, 55%)`;
      fillCol = `hsla(${hue}, 100%, 60%, 0.5)`;
    } else if (colorStyle === 'cyan') {
      shadowCol = '#06b6d4';
      fillCol = 'rgba(6, 182, 212, 0.5)';
    } else if (colorStyle === 'pink') {
      shadowCol = '#ec4899';
      fillCol = 'rgba(236, 72, 153, 0.5)';
    } else if (colorStyle === 'lime') {
      shadowCol = '#84cc16';
      fillCol = 'rgba(132, 204, 22, 0.5)';
    } else if (colorStyle === 'amber') {
      shadowCol = '#f59e0b';
      fillCol = 'rgba(245, 158, 11, 0.5)';
    } else if (colorStyle === 'purple') {
      shadowCol = '#a855f7';
      fillCol = 'rgba(168, 85, 247, 0.5)';
    }

    ctx.shadowColor = shadowCol;
    ctx.shadowBlur = 18;
    ctx.fillStyle = fillCol;
    ctx.beginPath();
    ctx.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 10);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Procedural Car Renderer with Full Customization Support
   */
  public static drawCarWithCustomization(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    car: CarData,
    custom?: CarCustomization,
    angle: number = 0,
    isNitro: boolean = false,
    scale: number = 1.0,
    rgbMode: boolean = false,
    frameTime: number = 0
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const w = 34;
    const h = 64;

    const bodyColor = custom?.bodyColor || (rgbMode ? `hsl(${(frameTime * 100) % 360}, 85%, 55%)` : car.bodyColor);
    const decalStyle = custom?.decalStyle || 'none';
    const tintLevel = custom?.tintLevel ?? 0.3;
    const underglow = custom?.underglow || (rgbMode ? 'rgb' : 'none');
    const spoiler = custom?.spoiler || 'none';
    const rimStyle = custom?.rimStyle || 'stock';

    // Underglow Neon
    if (underglow !== 'none') {
      this.drawUnderglow(ctx, 0, 0, w, h, underglow, frameTime);
    }

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 3, -h / 2 + 5, w, h, 8);
    ctx.fill();

    // 4 Wheels with Custom Rims
    const wheelW = 6;
    const wheelH = 12;
    const wheels = [
      { x: -w / 2 - 2, y: -h / 2 + 8 },
      { x: w / 2 - wheelW + 2, y: -h / 2 + 8 },
      { x: -w / 2 - 2, y: h / 2 - 20 },
      { x: w / 2 - wheelW + 2, y: h / 2 - 20 },
    ];

    wheels.forEach(wh => {
      // Tire Rubber
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(wh.x, wh.y, wheelW, wheelH, 2);
      ctx.fill();

      // Rim Detailing
      if (rimStyle === 'bbs_gold') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(wh.x + 1, wh.y + 3, wheelW - 2, wheelH - 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(wh.x + 2, wh.y + 5, 2, 2);
      } else if (rimStyle === 'blade_chrome') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(wh.x + 1, wh.y + 2, wheelW - 2, wheelH - 4);
      } else if (rimStyle === 'sport_red') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(wh.x + 1, wh.y + 1, 1, wheelH - 2);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(wh.x + 2, wh.y + 3, wheelW - 3, wheelH - 6);
      } else if (rimStyle === 'deep_dish') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(wh.x + 1, wh.y + 2, wheelW - 2, wheelH - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(wh.x + 3, wh.y + 4, 2, 4);
      } else {
        // Stock steel
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(wh.x + 1, wh.y + 4, wheelW - 2, wheelH - 8);
      }
    });

    // Main Car Body Gradient
    const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    bodyGrad.addColorStop(0, bodyColor);
    bodyGrad.addColorStop(0.3, this.lightenDarkenColor(bodyColor, 20));
    bodyGrad.addColorStop(0.7, bodyColor);
    bodyGrad.addColorStop(1, this.lightenDarkenColor(bodyColor, -25));

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();

    // Body Shapes
    if (car.type === 'pickup') {
      ctx.roundRect(-w / 2, -h / 2, w, h, [6, 6, 2, 2]);
      ctx.fill();

      // Rear cargo bed
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-w / 2 + 3, -4, w - 6, h / 2);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2 + 3, -4, w - 6, h / 2);

      // Watermelons in pickup bed
      const melonColors = ['#15803d', '#166534', '#22c55e'];
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-8 + (i % 3) * 8, 4 + Math.floor(i / 3) * 10, 4, 0, Math.PI * 2);
        ctx.fillStyle = melonColors[i % melonColors.length];
        ctx.fill();
      }
    } else if (car.type === 'f1') {
      // Formula 1: Extremely sleek, pointed nose, huge rear wing
      ctx.moveTo(0, -h / 2 - 12);
      ctx.lineTo(w / 3, -h / 4);
      ctx.lineTo(w / 2 + 6, h / 2 - 8);
      ctx.lineTo(-w / 2 - 6, h / 2 - 8);
      ctx.lineTo(-w / 3, -h / 4);
      ctx.closePath();
      ctx.fill();
      // Rear Wing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 8, h / 2 - 14, w + 16, 6);
    } else if (car.type === 'bike') {
      // Motorcycle: Very narrow and slim body
      ctx.roundRect(-6, -h / 2, 12, h, 6);
      ctx.fill();
      // Rider helmet
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -6, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (car.type === 'bicycle') {
      // Bicycle: Extremely slim open frame
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 8);
      ctx.lineTo(0, h / 2 - 8);
      ctx.stroke();
      // Rider
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (car.type === 'jet') {
      // Jet Car: Fighter supersonic nose cone & delta wings
      ctx.moveTo(0, -h / 2 - 18);
      ctx.lineTo(w / 2 + 10, h / 2 - 6);
      ctx.lineTo(0, h / 2);
      ctx.lineTo(-w / 2 - 10, h / 2 - 6);
      ctx.closePath();
      ctx.fill();
      // Afterburner flame
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-6, h / 2);
      ctx.lineTo(0, h / 2 + 20);
      ctx.lineTo(6, h / 2);
      ctx.closePath();
      ctx.fill();
    } else if (car.type === 'hyper' || car.type === 'sports') {
      ctx.moveTo(0, -h / 2);
      ctx.quadraticCurveTo(w / 2 + 2, -h / 2 + 10, w / 2, h / 2 - 8);
      ctx.quadraticCurveTo(w / 2 - 4, h / 2, 0, h / 2);
      ctx.quadraticCurveTo(-w / 2 + 4, h / 2, -w / 2, h / 2 - 8);
      ctx.quadraticCurveTo(-w / 2 - 2, -h / 2 + 10, 0, -h / 2);
      ctx.fill();
    } else if (car.type === 'hatchback') {
      ctx.roundRect(-w / 2, -h / 2 + 4, w, h - 8, [8, 8, 4, 4]);
      ctx.fill();
    } else {
      // Classic Sedan / Taxi / Police
      ctx.roundRect(-w / 2, -h / 2, w, h, [8, 8, 4, 4]);
      ctx.fill();
    }

    // Body Decals & Racing Stripes
    if (decalStyle === 'stripes') {
      // Dual racing stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -h / 2, 4, h);
      ctx.fillRect(2, -h / 2, 4, h);
    } else if (decalStyle === 'gt_side') {
      // Side stripes
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-w / 2 + 1, -h / 2 + 15, 2.5, h - 30);
      ctx.fillRect(w / 2 - 3.5, -h / 2 + 15, 2.5, h - 30);
    } else if (decalStyle === 'carbon_hood') {
      // Carbon Fiber Hood
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 4, -h / 2 + 2, w - 8, 22, [4, 4, 0, 0]);
      ctx.fill();
    } else if (decalStyle === 'taxi_checkers') {
      // Checkerboard stripe
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-w / 2 + 4 + i * 7, -h / 2 + 28, 4, 4);
      }
    } else if (decalStyle === 'police') {
      // Police Decals
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-w / 2 + 2, -2, w - 4, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POLICE', 0, 4);
    } else if (decalStyle === 'flames') {
      // Hot rod flames
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-10, -h / 2 + 6);
      ctx.lineTo(-4, -h / 2 + 24);
      ctx.lineTo(0, -h / 2 + 12);
      ctx.lineTo(4, -h / 2 + 24);
      ctx.lineTo(10, -h / 2 + 6);
      ctx.closePath();
      ctx.fill();
    }

    // Windows & Windshields with Custom Tinting
    const tintAlpha = Math.max(0.2, Math.min(0.95, 0.3 + tintLevel * 0.65));
    const glassColor = `rgba(15, 23, 42, ${tintAlpha})`;
    ctx.fillStyle = glassColor;

    // Front Windshield
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 4, -h / 2 + 12, w - 8, 12, 3);
    ctx.fill();

    // Rear Windshield
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 4, h / 2 - 20, w - 8, 9, 2);
    ctx.fill();

    // Side Windows
    ctx.fillRect(-w / 2 + 2, -h / 2 + 25, 3, 20);
    ctx.fillRect(w / 2 - 5, -h / 2 + 25, 3, 20);

    // Headlights
    ctx.fillStyle = rgbMode 
      ? `hsl(${(frameTime * 120) % 360}, 100%, 75%)` 
      : '#fef08a';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2, 7, 4, 2);
    ctx.roundRect(w / 2 - 9, -h / 2, 7, 4, 2);
    ctx.fill();

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, h / 2 - 3, 6, 3, 1);
    ctx.roundRect(w / 2 - 8, h / 2 - 3, 6, 3, 1);
    ctx.fill();

    // Spoiler / Rear Wing
    if (spoiler === 'lip') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, h / 2 - 2, w - 6, 3);
    } else if (spoiler === 'ducktail') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 2, h / 2 - 3, w - 4, 5, 2);
      ctx.fill();
    } else if (spoiler === 'gt_wing') {
      // GT Wing with side stanchions
      ctx.fillStyle = '#0f172a';
      // Side struts
      ctx.fillRect(-w / 2 + 4, h / 2 - 5, 3, 7);
      ctx.fillRect(w / 2 - 7, h / 2 - 5, 3, 7);
      // High wing blade
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-w / 2, h / 2 + 2, w, 4);
    }

    // Nitro Flame Burst (when active)
    if (isNitro) {
      const flameH = 22 + Math.sin(frameTime * 30) * 8;
      const flameGrad = ctx.createLinearGradient(0, h / 2, 0, h / 2 + flameH);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#38bdf8');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      // Left exhaust flame
      ctx.beginPath();
      ctx.moveTo(-8, h / 2);
      ctx.lineTo(-4, h / 2 + flameH);
      ctx.lineTo(-12, h / 2 + flameH * 0.7);
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Right exhaust flame
      ctx.beginPath();
      ctx.moveTo(8, h / 2);
      ctx.lineTo(4, h / 2 + flameH);
      ctx.lineTo(12, h / 2 + flameH * 0.7);
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw standard Car (legacy alias calling drawCarWithCustomization)
   */
  public static drawCar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    car: CarData,
    angle: number = 0,
    isNitro: boolean = false,
    scale: number = 1.0,
    rgbMode: boolean = false,
    frameTime: number = 0
  ): void {
    this.drawCarWithCustomization(ctx, x, y, car, undefined, angle, isNitro, scale, rgbMode, frameTime);
  }

  /**
   * Procedural NPC Traffic Vehicle Renderer with Iranian & Biome Tier Models
   */
  public static drawTrafficCar(
    ctx: CanvasRenderingContext2D,
    npc: PooledTrafficCar,
    frameTime: number
  ): void {
    ctx.save();
    ctx.translate(npc.x, npc.y);

    const w = npc.width;
    const h = npc.height;

    // Car Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 4, w, h, 6);
    ctx.fill();

    // 4 Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2 - 3, -h / 2 + 8, 4, 11);
    ctx.fillRect(w / 2 - 1, -h / 2 + 8, 4, 11);
    ctx.fillRect(-w / 2 - 3, h / 2 - 19, 4, 11);
    ctx.fillRect(w / 2 - 1, h / 2 - 19, 4, 11);

    if (npc.type === 'paykan') {
      // Classic Iranian Paykan 48 (پیکان جوانان)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 3);
      ctx.fill();

      // Chrome bumpers front & rear
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-w / 2, -h / 2, w, 3);
      ctx.fillRect(-w / 2, h / 2 - 3, w, 3);

      // Boxy hood & trunk lines
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2 + 2, -h / 2 + 14, w - 4, h - 28);

      // Windshields
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 13, w - 6, 8);
      ctx.fillRect(-w / 2 + 3, h / 2 - 20, w - 6, 7);

      // Round Classic Headlights
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-w / 2 + 5, -h / 2 + 3, 2.5, 0, Math.PI * 2);
      ctx.arc(w / 2 - 5, -h / 2 + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (npc.type === 'pride') {
      // Pride 111 Hatchback (پراید ۱۱۱ هاچبک)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 5);
      ctx.fill();

      // Sloped front and steep rear hatch
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, 9);
      ctx.fillRect(-w / 2 + 3, h / 2 - 14, w - 6, 6);

      // Side black protective trim strips
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 2, -2, 2, 10);
      ctx.fillRect(w / 2 - 2, -2, 2, 10);
    } else if (npc.type === 'nissan_blue') {
      // Iconic Zamyad Blue Pickup (نیسان آبی سالار باردار)
      ctx.fillStyle = '#0284c7'; // Iconic Nissan Blue
      ctx.beginPath();
      // Blue Cab
      ctx.roundRect(-w / 2, -h / 2, w, 24, 4);
      ctx.fill();

      // Rear Cargo Bed
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-w / 2, -h / 2 + 25, w, h - 26);
      ctx.strokeStyle = '#075985';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-w / 2, -h / 2 + 25, w, h - 26);

      // Cab Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 6, w - 6, 10);

      // Watermelons in cargo bed!
      ctx.fillStyle = '#16a34a';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.beginPath();
          ctx.ellipse(-w / 4 + c * (w / 2), -h / 2 + 34 + r * 14, 5, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (npc.type === 'truck' || npc.type === 'semi') {
      // Heavy Benz 1924 Orange Truck (کامیون بنز ۱۹۲۴ نارنجی)
      ctx.fillStyle = npc.color || '#ea580c';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, 30, 4);
      ctx.fill();

      // Huge Cargo Dump Body
      ctx.fillStyle = npc.secondaryColor || '#475569';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 32, w - 4, h - 35);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-w / 2 + 2, -h / 2 + 32, w - 4, h - 35);

      // Twin Chrome Vertical Exhaust Stacks
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 26, 3, 6);
      ctx.fillRect(w / 2 - 1, -h / 2 + 26, 3, 6);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 6, w - 8, 12);
    } else if (npc.type === 'tanker') {
      // Heavy Cylindrical Fuel Tanker Truck (تانکر سوخت نفت)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, 24, 3);
      ctx.fill();

      // Silver cylindrical Tanker
      const tankGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      tankGrad.addColorStop(0, '#94a3b8');
      tankGrad.addColorStop(0.5, '#f8fafc');
      tankGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = tankGrad;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 2, -h / 2 + 26, w - 4, h - 29, 6);
      ctx.fill();

      // Flammable Hazard Diamond on rear
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, h / 2 - 14);
      ctx.lineTo(5, h / 2 - 9);
      ctx.lineTo(0, h / 2 - 4);
      ctx.lineTo(-5, h / 2 - 9);
      ctx.closePath();
      ctx.fill();
    } else if (npc.type === 'police') {
      // Iranian Police Cruiser (ماشین پلیس با آژیر گردان)
      ctx.fillStyle = '#1e3a8a'; // Deep Navy
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      // White doors stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-w / 2, -6, w, 14);

      // Police Text
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('POLICE', 0, 1);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, 10);
      ctx.fillRect(-w / 2 + 3, h / 2 - 18, w - 6, 8);

      // Flashing Siren Light Bar on roof
      const isRedFlash = Math.sin(npc.sirenTime * 15) > 0;
      ctx.fillStyle = isRedFlash ? '#ef4444' : '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-8, -4, 16, 5, 2);
      ctx.fill();
    } else if (npc.type === 'pickup') {
      // Pickup Truck (وانت بار)
      ctx.fillStyle = npc.color || '#15803d';
      ctx.beginPath();
      // Cab
      ctx.roundRect(-w / 2, -h / 2, w, 28, 4);
      ctx.fill();

      // Rear Open Cargo Bed
      ctx.fillStyle = '#475569';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 30, w - 4, h - 32);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-w / 2 + 2, -h / 2 + 30, w - 4, h - 32);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 6, w - 6, 12);
    } else if (npc.type === 'snowplow') {
      // Heavy Alpine Snowplow Truck (ماشین برف‌روب زرد)
      ctx.fillStyle = '#eab308'; // Safety Yellow
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2 + 6, w, h - 6, 4);
      ctx.fill();

      // Front Angled Steel Plow Blade
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 4, -h / 2 + 4);
      ctx.lineTo(w / 2 + 4, -h / 2 - 2);
      ctx.lineTo(w / 2 + 4, -h / 2 + 2);
      ctx.lineTo(-w / 2 - 4, -h / 2 + 8);
      ctx.closePath();
      ctx.fill();

      // Flashing Yellow Strobe Beacon
      const isYellowFlash = Math.sin(frameTime * 12) > 0;
      ctx.fillStyle = isYellowFlash ? '#fef08a' : '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 16, 4, 0, Math.PI * 2);
      ctx.fill();

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 10, w - 8, 10);
    } else if (npc.type === 'limo') {
      // Retro Stretched VIP Limousine (لیموزین تشریفاتی مشکی/طلایی)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      // Chrome VIP side trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-w / 2, -h / 2 + 12, 2, h - 24);
      ctx.fillRect(w / 2 - 2, -h / 2 + 12, 2, h - 24);

      // Dark Tint VIP Windows (Front, Middle, Rear)
      ctx.fillStyle = '#020617';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, 8);
      ctx.fillRect(-w / 2 + 3, -h / 2 + 26, w - 6, h - 50);
      ctx.fillRect(-w / 2 + 3, h / 2 - 18, w - 6, 8);
    } else if (npc.type === 'bus') {
      // Long Intercity Scania Passenger Bus (اتوبوس اسکانیا بین شهری)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      // Big Panoramic Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w - 6, 12);

      // Roof A/C Ventilation Units
      ctx.fillStyle = '#f8fafc';
      ctx.roundRect(-w / 4, -h / 2 + 26, w / 2, 24, 3);
      ctx.fill();

      // Passenger Window Rows
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 20, 3, h - 34);
      ctx.fillRect(w / 2 - 5, -h / 2 + 20, 3, h - 34);
    } else if (npc.type === 'tractor') {
      // Agricultural Ferguson Tractor (تراکتور کشاورزی با چرخ بزرگ)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 5, h / 2 - 24, 7, 22);
      ctx.fillRect(w / 2 - 2, h / 2 - 24, 7, 22);

      ctx.fillStyle = npc.color || '#15803d';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 3, -h / 2, w - 6, h, 4);
      ctx.fill();

      // Front Engine grill
      ctx.fillStyle = '#475569';
      ctx.fillRect(-3, -h / 2 + 4, 6, 14);
    } else if (npc.type === 'ambulance' || npc.type === 'firetruck') {
      // Emergency Services with Dual Flashing Strobe Sirens (اورژانس و آتش‌نشانی)
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      ctx.fillStyle = npc.secondaryColor;
      ctx.fillRect(-4, -6, 8, 16);
      ctx.fillRect(-10, -2, 20, 8);

      // Animated Flashing Siren Beacons
      const flash = Math.sin(npc.sirenTime * 16) > 0;
      ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(-6, -h / 2 + 12, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = flash ? '#3b82f6' : '#ef4444';
      ctx.beginPath();
      ctx.arc(6, -h / 2 + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (npc.type === 'cyber') {
      // Cyberpunk 2077 Futuristic Hover-Car (سایبرکوپه نئونی)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 8);
      ctx.fill();

      // Glowing Neon Laser Strip across Hood & Rear
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(-w / 2 + 2, -h / 2 + 4, w - 4, 3);
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.fillRect(-w / 2 + 2, h / 2 - 6, w - 4, 3);
      ctx.shadowBlur = 0;

      // Dark Cockpit
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 12, w - 8, 14);
    } else {
      // Standard Commuter Sedan / Sports Car
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      // Windshields
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, 10);
      ctx.fillRect(-w / 2 + 3, h / 2 - 18, w - 6, 8);
    }

    // Turn Indicators / Swerve warning blinkers (راهنما چپ و راست)
    const isBlinkerOn = Math.sin(frameTime * 18) > 0;
    if (isBlinkerOn) {
      ctx.fillStyle = '#f59e0b';
      if (npc.turnSignal === 'left' || npc.isHonked) {
        ctx.beginPath();
        ctx.arc(-w / 2 - 1, -h / 2 + 3, 3, 0, Math.PI * 2);
        ctx.arc(-w / 2 - 1, h / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (npc.turnSignal === 'right' || npc.isHonked) {
        ctx.beginPath();
        ctx.arc(w / 2 + 1, -h / 2 + 3, 3, 0, Math.PI * 2);
        ctx.arc(w / 2 + 1, h / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Taillights / Sudden Brake Lights
    if (npc.isBraking) {
      ctx.fillStyle = '#ff0000';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillRect(-w / 2 + 1, h / 2 - 4, 7, 4);
      ctx.fillRect(w / 2 - 8, h / 2 - 4, 7, 4);
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-w / 2 + 2, h / 2 - 2, 5, 2);
      ctx.fillRect(w / 2 - 7, h / 2 - 2, 5, 2);
    }

    ctx.restore();
  }

  /**
   * Procedural Road Hazard & Obstacle Renderer (موانع راهداری و جاده‌ای)
   */
  public static drawRoadObstacle(
    ctx: CanvasRenderingContext2D,
    type: string,
    x: number,
    y: number,
    frameTime: number
  ): void {
    ctx.save();
    ctx.translate(x, y);

    if (type === 'barrier') {
      // Concrete Highway Jersey Barrier (نیوجرسی بتنی راهداری با شبرنگ قرمز و سفید)
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-18, 4, 36, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 3);
      ctx.fill();

      // Red & White reflective stripes
      for (let s = -14; s < 14; s += 7) {
        ctx.fillStyle = Math.floor((s + 14) / 7) % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(s, -6, 6, 12);
      }
    } else if (type === 'barrel') {
      // Striped Crash Cushion Barrel (بشکه راهداری زرد و مشکی)
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.arc(0, 4, 11, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Barrel Body
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Black reflective Chevron Bands
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7, -4, 14, 4);
      ctx.fillRect(-7, 2, 14, 3);
    } else if (type === 'oilSlick') {
      // Slippery Oil Slick (لکه روغن لغزنده براق)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Iridescent sheen
      const sheenGrad = ctx.createLinearGradient(-15, -8, 15, 8);
      sheenGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      sheenGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
      sheenGrad.addColorStop(1, 'rgba(234, 179, 8, 0.4)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'rock') {
      // Mountain Boulder / Sand Rock (قلوه‌سنگ بزرگ جاده)
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(2, 4, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.moveTo(-12, 4);
      ctx.lineTo(-6, -10);
      ctx.lineTo(6, -8);
      ctx.lineTo(12, 2);
      ctx.lineTo(4, 8);
      ctx.lineTo(-8, 7);
      ctx.closePath();
      ctx.fill();

      // Highlight
      ctx.fillStyle = '#a8a29e';
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(2, -8);
      ctx.lineTo(0, -2);
      ctx.lineTo(-6, -2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'cone') {
      // Traffic Cone with reflective collar (مخروط ترافیکی شبرنگ)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base square
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-7, 0, 14, 5);

      // Orange Cone
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(-6, 2);
      ctx.lineTo(6, 2);
      ctx.closePath();
      ctx.fill();

      // White reflective band
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(2, -6);
      ctx.lineTo(3.5, -2);
      ctx.lineTo(-3.5, -2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'sponsorSign') {
      // Roadside Sponsor Billboard / House for ShahinEdu Aparat Channel
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(-24, 6, 48, 10);

      // Billboard Structure (Gold/Amber Theme)
      const signGrad = ctx.createLinearGradient(-22, -22, 22, 22);
      signGrad.addColorStop(0, '#f59e0b');
      signGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = signGrad;
      ctx.beginPath();
      ctx.roundRect(-22, -22, 44, 30, 4);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sign text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('کانال آپارات', 0, -10);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px Vazirmatn, sans-serif';
      ctx.fillText('شاهین آموز', 0, 2);
    }

    ctx.restore();
  }

  /**
   * Draw Highway & Environment Biome Shading with Rich Map Details and Curving Road
   */
  public static drawRoadEnvironment(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    biome: BiomeConfig,
    roadScrollY: number,
    baseRoadLeftX: number,
    roadWidth: number,
    laneCount: number = 3,
    curveFn?: (y: number) => number
  ): void {
    // 1. Biome Grass / Terrain Background
    ctx.fillStyle = biome.grassColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const stripH = 24;
    const getCurve = (y: number) => (curveFn ? curveFn(y) : 0);

    // 2. Rich Side Scenery Details based on Biome
    if (biome.id === 'noir' || biome.id === 'mountain' || biome.id === 'paradise') {
      // Blue Modern Apartments and Swimming Pools along roadside!
      for (let y = -120; y < canvasHeight + 120; y += 140) {
        const offset = (roadScrollY + y) % (canvasHeight + 240) - 120;
        const curCurve = getCurve(offset);
        const rLeft = baseRoadLeftX + curCurve;

        // Left Blue Apartment Building
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rLeft - 52, offset, 36, 64);
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 2;
        ctx.strokeRect(rLeft - 52, offset, 36, 64);

        // Apartment windows grid (lit yellow/white)
        ctx.fillStyle = '#fef08a';
        for (let rw = 0; rw < 3; rw++) {
          for (let cl = 0; cl < 3; cl++) {
            ctx.fillRect(rLeft - 46 + cl * 10, offset + 8 + rw * 16, 6, 10);
          }
        }

        // Right Swimming Pool & Palm Tree
        ctx.fillStyle = '#38bdf8'; // Pool water
        ctx.beginPath();
        ctx.roundRect(rLeft + roadWidth + 16, offset + 20, 40, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Palm tree near pool
        ctx.fillStyle = '#78350f'; // Trunk
        ctx.fillRect(rLeft + roadWidth + 64, offset + 15, 5, 30);
        ctx.fillStyle = '#15803d'; // Leaves
        ctx.beginPath();
        ctx.arc(rLeft + roadWidth + 66, offset + 12, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome.id === 'forest') {
      // Dense roadside pine trees & shrubs
      ctx.fillStyle = '#14532d';
      for (let y = -80; y < canvasHeight + 80; y += 70) {
        const offset = (roadScrollY + y) % (canvasHeight + 160) - 80;
        const curCurve = getCurve(offset);
        const rLeft = baseRoadLeftX + curCurve;
        // Left trees
        ctx.beginPath();
        ctx.arc(rLeft - 28, offset, 16, 0, Math.PI * 2);
        ctx.arc(rLeft - 16, offset + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        // Right trees
        ctx.beginPath();
        ctx.arc(rLeft + roadWidth + 28, offset + 35, 16, 0, Math.PI * 2);
        ctx.arc(rLeft + roadWidth + 16, offset + 47, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome.id === 'desert') {
      // Desert sand dunes & Saguaro Cacti
      ctx.fillStyle = '#15803d';
      for (let y = -100; y < canvasHeight + 100; y += 120) {
        const offset = (roadScrollY + y) % (canvasHeight + 200) - 100;
        const curCurve = getCurve(offset);
        const rLeft = baseRoadLeftX + curCurve;
        // Left Cactus
        ctx.fillRect(rLeft - 24, offset, 5, 22);
        ctx.fillRect(rLeft - 30, offset + 6, 14, 4);
        ctx.fillRect(rLeft - 30, offset + 2, 4, 8);
        ctx.fillRect(rLeft - 20, offset + 4, 4, 8);
      }
    } else if (biome.id === 'rain') {
      // Wet reflective asphalt & Highway puddles
      ctx.fillStyle = '#0284c7';
      for (let y = 0; y < canvasHeight; y += stripH) {
        const c1 = getCurve(y);
        const c2 = getCurve(y + stripH);
        const r1 = baseRoadLeftX + c1;
        const r2 = baseRoadLeftX + c2;
        ctx.fillRect(0, y, Math.max(0, r1 - 8), stripH);
        ctx.fillRect(r1 + roadWidth + 8, y, canvasWidth, stripH);
      }
    } else if (biome.id === 'snow') {
      // Snow banks along road edges
      ctx.fillStyle = '#f8fafc';
      for (let y = 0; y < canvasHeight; y += stripH) {
        const c = getCurve(y);
        const r = baseRoadLeftX + c;
        ctx.fillRect(r - 20, y, 14, stripH);
        ctx.fillRect(r + roadWidth + 6, y, 14, stripH);
      }
    } else if (biome.id === 'ocean') {
      // Ocean water waves on left/right & palm trees
      ctx.fillStyle = '#0284c7';
      for (let y = 0; y < canvasHeight; y += stripH) {
        const c = getCurve(y);
        const r = baseRoadLeftX + c;
        ctx.fillRect(0, y, Math.max(0, r), stripH);
        ctx.fillRect(r + roadWidth, y, Math.max(0, canvasWidth - (r + roadWidth)), stripH);
      }
      ctx.fillStyle = '#166534';
      for (let y = -100; y < canvasHeight + 100; y += 140) {
        const offset = (roadScrollY + y) % (canvasHeight + 200) - 100;
        const c = getCurve(offset);
        const rLeft = baseRoadLeftX + c;
        ctx.beginPath();
        ctx.arc(rLeft - 22, offset, 14, 0, Math.PI * 2);
        ctx.arc(rLeft + roadWidth + 22, offset + 70, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome.id === 'lava') {
      // Magma cracks on shoulders
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const py = ((roadScrollY * 0.5 + i * 120) % canvasHeight);
        ctx.beginPath();
        ctx.moveTo(8, py);
        ctx.lineTo(24, py + 20);
        ctx.lineTo(14, py + 40);
        ctx.stroke();
      }
    } else if (biome.id === 'cyberpunk') {
      // Neon Cyber Grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
    }


    // 3. Road Asphalt Surface (Trapezoidal Slices for Curves)
    ctx.fillStyle = biome.roadColor;
    for (let y = 0; y < canvasHeight; y += stripH) {
      const yNext = Math.min(canvasHeight, y + stripH);
      const rx1 = baseRoadLeftX + getCurve(y);
      const rx2 = baseRoadLeftX + getCurve(yNext);

      ctx.beginPath();
      ctx.moveTo(rx1, y);
      ctx.lineTo(rx1 + roadWidth, y);
      ctx.lineTo(rx2 + roadWidth, yNext);
      ctx.lineTo(rx2, yNext);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Red & White Striped Road Curbs (Curved)
    const curbW = 8;
    const curbSegmentH = 28;
    const curbOffset = roadScrollY % (curbSegmentH * 2);

    for (let y = 0; y < canvasHeight; y += stripH) {
      const yNext = Math.min(canvasHeight, y + stripH);
      const rx1 = baseRoadLeftX + getCurve(y);
      const rx2 = baseRoadLeftX + getCurve(yNext);

      const isAlt = Math.floor((y + curbOffset) / curbSegmentH) % 2 === 0;
      ctx.fillStyle = isAlt ? biome.curbColor1 : biome.curbColor2;

      // Left curb
      ctx.beginPath();
      ctx.moveTo(rx1 - curbW, y);
      ctx.lineTo(rx1, y);
      ctx.lineTo(rx2, yNext);
      ctx.lineTo(rx2 - curbW, yNext);
      ctx.closePath();
      ctx.fill();

      // Right curb
      ctx.beginPath();
      ctx.moveTo(rx1 + roadWidth, y);
      ctx.lineTo(rx1 + roadWidth + curbW, y);
      ctx.lineTo(rx2 + roadWidth + curbW, yNext);
      ctx.lineTo(rx2 + roadWidth, yNext);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Dashed Lane Dividers with Cat-Eye Reflectors (Curved)
    const laneW = roadWidth / laneCount;
    const dashH = 36;
    const gapH = 28;
    const totalDashH = dashH + gapH;
    const dashOffset = roadScrollY % totalDashH;

    ctx.fillStyle = biome.laneColor;
    for (let l = 1; l < laneCount; l++) {
      for (let y = -totalDashH; y < canvasHeight + totalDashH; y += totalDashH) {
        const topY = y + dashOffset;
        const botY = topY + dashH;
        if (botY < 0 || topY > canvasHeight) continue;

        const cTop = getCurve(topY);
        const cBot = getCurve(botY);
        const lxTop = baseRoadLeftX + cTop + l * laneW - 2;
        const lxBot = baseRoadLeftX + cBot + l * laneW - 2;

        ctx.fillStyle = biome.laneColor;
        ctx.beginPath();
        ctx.moveTo(lxTop, topY);
        ctx.lineTo(lxTop + 4, topY);
        ctx.lineTo(lxBot + 4, botY);
        ctx.lineTo(lxBot, botY);
        ctx.closePath();
        ctx.fill();

        // Small amber cat-eye reflector in the gap
        const midY = topY + dashH + gapH / 2;
        const midC = getCurve(midY);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(baseRoadLeftX + midC + l * laneW - 1, midY - 2, 2, 4);
      }
    }

    // 6. Highway Asphalt Markings (Speed Limits & Arrows)
    const markerPeriod = 600;
    const markOffset = roadScrollY % markerPeriod;
    for (let y = -markerPeriod; y < canvasHeight + markerPeriod; y += markerPeriod) {
      const my = y + markOffset;
      const curC = getCurve(my);
      const curLeft = baseRoadLeftX + curC;

      // Highway Speed Limit '110' on middle lane
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('110', curLeft + roadWidth / 2, my);

      // Forward arrow on right lane
      ctx.beginPath();
      const ax = curLeft + laneW * 0.5;
      ctx.moveTo(ax, my - 60);
      ctx.lineTo(ax - 8, my - 45);
      ctx.lineTo(ax - 3, my - 45);
      ctx.lineTo(ax - 3, my - 30);
      ctx.lineTo(ax + 3, my - 30);
      ctx.lineTo(ax + 3, my - 45);
      ctx.lineTo(ax + 8, my - 45);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Helper: Adjust Hex Color Brightness
   */
  private static lightenDarkenColor(hex: string, amt: number): string {
    if (!hex.startsWith('#') || hex.length < 7) return hex;
    let usePound = false;
    if (hex[0] === '#') {
      hex = hex.slice(1);
      usePound = true;
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }
}
