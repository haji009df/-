import { BiomeConfig, CarData, CharacterData, GameSaveData, NpcCarType, PooledBullet, PooledParticle, PooledRoadItem, PooledTrafficCar, RoadItemType, StageMilestoneInfo } from '../types';
import { audioManager } from './audio';
import { CARS, CHARACTERS, getBiomeForStage, getStageMilestones, saveGameSave } from './constants';
import { GraphicsRenderer } from './proceduralGraphics';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  // Viewport & Scale
  public width: number = 360;
  public height: number = 640;
  public roadLeftX: number = 40;
  public roadWidth: number = 280;
  public laneCount: number = 3;

  // Save State & Progression
  public saveData: GameSaveData;
  public currentStage: number = 1;
  public stageDistance: number = 0;
  public targetStageDistance: number = 1200; // meters per stage
  public currentBiome: BiomeConfig;
  public milestones: StageMilestoneInfo;

  // Player State
  public playerCar: CarData;
  public playerCharacter: CharacterData;
  public playerX: number = 180;
  public playerY: number = 520;
  public playerAngle: number = 0;
  public playerSpeedKmh: number = 0;
  public currentGear: number = 1; // 1, 2, 3
  public lives: number = 3;
  public maxLives: number = 3;
  public isInvulnerable: boolean = false;
  public invulnerableTimer: number = 0;
  
  // Nitro & Gun State
  public nitroActive: boolean = false;
  public nitroTimer: number = 0;
  public nitroCharges: number = 1;
  public gunAmmo: number = 3;
  public lastShotTime: number = 0;

  // Controls Input State
  public steeringWheelAngle: number = 0; // -1 to +1 normalized
  public isSteeringActive: boolean = false;
  public isHornPressed: boolean = false;

  // Object Pools (Zero Allocations in Loop)
  private readonly MAX_TRAFFIC = 25;
  private readonly MAX_PARTICLES = 160;
  private readonly MAX_BULLETS = 10;
  private readonly MAX_ROAD_ITEMS = 45;

  public trafficPool: PooledTrafficCar[] = [];
  public particlePool: PooledParticle[] = [];
  public bulletPool: PooledBullet[] = [];
  public roadItemPool: PooledRoadItem[] = [];

  // Loop & Timing
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public stageCompleteBannerTimer: number = 0;
  public stageCompleteBannerText: string = '';
  public lastFrameTime: number = 0;
  public totalGameTime: number = 0;
  public roadScrollY: number = 0;

  // Statistics for active run
  public stageCoinsCollected: number = 0;
  public stageOvertakenCount: number = 0;

  // UI Callback listeners
  public onStateUpdate?: (engine: GameEngine) => void;
  public onGameOver?: (engine: GameEngine) => void;
  public onStageClear?: (stage: number, bonusCoins: number) => void;

  constructor(canvas: HTMLCanvasElement, saveData: GameSaveData) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not create Canvas 2D context');
    this.ctx = context;
    this.saveData = saveData;

    this.currentStage = saveData.highestStage || 1;
    this.currentBiome = getBiomeForStage(this.currentStage);
    this.milestones = getStageMilestones(this.currentStage);

    this.playerCar = CARS.find(c => c.id === saveData.selectedCarId) || CARS[0];
    this.playerCharacter = CHARACTERS.find(c => c.id === saveData.selectedCharacterId) || CHARACTERS[0];

    this.initPools();
    this.resetPlayerState();
  }

  /**
   * Pre-allocate all Object Pools once
   */
  private initPools(): void {
    // 1. Traffic Pool
    this.trafficPool = [];
    for (let i = 0; i < this.MAX_TRAFFIC; i++) {
      this.trafficPool.push({
        active: false,
        x: 0,
        y: 0,
        lane: 0,
        targetLane: 0,
        laneChangeProgress: 1,
        speed: 0,
        width: 32,
        height: 60,
        color: '#ef4444',
        secondaryColor: '#ffffff',
        type: 'sedan',
        health: 1,
        maxHealth: 1,
        isHonked: false,
        sirenTime: 0,
        overtaken: false,
        aiBehavior: 'normal',
        swervedTowardsPlayer: false,
        turnSignal: 'none',
        turnSignalTimer: 0,
        isBraking: false,
        brakeTimer: 0,
        reactionDistance: 180,
        aggression: 0,
      });
    }

    // 2. Particle Pool
    this.particlePool = [];
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particlePool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 1,
        type: 'smoke',
      });
    }

    // 3. Bullet Pool
    this.bulletPool = [];
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      this.bulletPool.push({
        active: false,
        x: 0,
        y: 0,
        vy: -15,
        width: 6,
        height: 16,
        damage: 1,
      });
    }

    // 4. Road Items Pool
    this.roadItemPool = [];
    for (let i = 0; i < this.MAX_ROAD_ITEMS; i++) {
      this.roadItemPool.push({
        active: false,
        x: 0,
        y: 0,
        type: 'coin',
        value: 1,
        rotation: 0,
        collected: false,
        scale: 1,
      });
    }
  }

  /**
   * Reset player state for stage or new run
   */
  public resetPlayerState(): void {
    this.milestones = getStageMilestones(this.currentStage);
    this.currentBiome = getBiomeForStage(this.currentStage);

    // Max lives = base + character extra lives
    this.maxLives = this.milestones.maxLives + this.playerCharacter.perks.extraLives;
    this.lives = this.maxLives;
    
    this.nitroCharges = this.milestones.nitroMaxCharges;
    this.gunAmmo = this.milestones.gunMaxAmmo;
    this.nitroActive = false;
    this.nitroTimer = 0;

    this.playerX = this.roadLeftX + this.roadWidth / 2;
    this.playerY = this.height - 130;
    this.playerAngle = 0;
    this.playerSpeedKmh = 0;
    this.currentGear = 1;
    this.stageDistance = 0;
    this.targetStageDistance = 800 + this.currentStage * 35;
    this.isInvulnerable = true;
    this.invulnerableTimer = 2.0; // 2 sec spawn protection
    this.isGameOver = false;

    // Reset pools
    for (let i = 0; i < this.MAX_TRAFFIC; i++) this.trafficPool[i].active = false;
    for (let i = 0; i < this.MAX_PARTICLES; i++) this.particlePool[i].active = false;
    for (let i = 0; i < this.MAX_BULLETS; i++) this.bulletPool[i].active = false;
    for (let i = 0; i < this.MAX_ROAD_ITEMS; i++) this.roadItemPool[i].active = false;

    // Pre-seed road with 4 initial traffic vehicles ahead so the road is vibrant immediately!
    const laneW = this.roadWidth / this.laneCount;
    const stageProgress = Math.min(1, (this.currentStage - 1) / 40);
    for (let l = 0; l < this.laneCount; l++) {
      const initialY = -60 + l * 120;
      this.spawnTrafficCarAt(l, this.roadLeftX + (l + 0.5) * laneW, initialY, stageProgress);
    }
  }

  public setCharacter(character: CharacterData): void {
    this.playerCharacter = character;
    this.saveData.selectedCharacterId = character.id;
    saveGameSave(this.saveData);
    this.resetPlayerState();
  }

  public setCar(car: CarData): void {
    this.playerCar = car;
    this.saveData.selectedCarId = car.id;
    saveGameSave(this.saveData);
  }

  public setStage(stage: number): void {
    this.currentStage = Math.max(1, Math.min(100, stage));
    this.saveData.highestStage = Math.max(this.saveData.highestStage, this.currentStage);
    saveGameSave(this.saveData);
    this.resetPlayerState();
  }

  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.roadWidth = Math.min(w * 0.8, 300);
    this.roadLeftX = (w - this.roadWidth) / 2;
    this.playerY = h - 130;
  }

  public start(): void {
    audioManager.init();
    audioManager.resumeIfSuspended();
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // ==========================================
  // INPUT HANDLERS
  // ==========================================
  public setSteering(normalizedAngle: number): void {
    this.steeringWheelAngle = Math.max(-1, Math.min(1, normalizedAngle));
    this.isSteeringActive = Math.abs(normalizedAngle) > 0.05;
  }

  public shiftGear(gear: number): void {
    const targetGear = Math.max(1, Math.min(3, gear));
    if (this.currentGear !== targetGear) {
      this.currentGear = targetGear;
      audioManager.updateEnginePitch(this.playerSpeedKmh, this.currentGear);
    }
  }

  public triggerHorn(): void {
    audioManager.playHorn();
    this.isHornPressed = true;
    
    // NPC Horn evasion trigger: vehicles in player's lane within 250px move aside
    const playerLane = this.getLaneFromX(this.playerX);
    for (let i = 0; i < this.MAX_TRAFFIC; i++) {
      const npc = this.trafficPool[i];
      if (npc.active && npc.y < this.playerY && npc.y > this.playerY - 260) {
        if (Math.abs(npc.x - this.playerX) < 45) {
          npc.isHonked = true;
          // Shift to right or left lane
          const newLane = npc.lane > 0 ? npc.lane - 1 : npc.lane + 1;
          npc.targetLane = Math.max(0, Math.min(this.laneCount - 1, newLane));
          npc.laneChangeProgress = 0;
        }
      }
    }
  }

  public triggerNitro(): void {
    if (!this.milestones.nitroUnlocked || this.nitroCharges <= 0 || this.nitroActive) return;
    this.nitroCharges--;
    this.nitroActive = true;
    this.nitroTimer = 2.2; // 2.2 seconds burst
    audioManager.playNitro();

    // Spawn burst particles
    for (let i = 0; i < 20; i++) {
      this.spawnParticle(this.playerX + (Math.random() * 16 - 8), this.playerY + 28, 'flame');
    }
  }

  public triggerGun(): void {
    if (!this.milestones.gunUnlocked || this.gunAmmo <= 0) return;
    const now = performance.now();
    if (now - this.lastShotTime < 200) return; // Rate limiter
    this.lastShotTime = now;
    this.gunAmmo--;
    audioManager.playGunshot();

    // Spawn 2 bullets (dual mounted hood guns)
    this.spawnBullet(this.playerX - 10, this.playerY - 25);
    this.spawnBullet(this.playerX + 10, this.playerY - 25);
  }

  // ==========================================
  // MAIN GAME LOOP (Zero Object Allocation)
  // ==========================================
  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;
    if (this.isPaused) return;

    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;
    this.totalGameTime += dt;

    this.update(dt);
    this.render();

    if (this.onStateUpdate) {
      this.onStateUpdate(this);
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number): void {
    if (this.isGameOver) return;

    // 1. Calculate Target Top Speed based on Gear, Car Stats, Character Perks & Nitro
    let maxGearSpeed = 65;
    if (this.currentGear === 2) maxGearSpeed = 125;
    if (this.currentGear === 3) maxGearSpeed = 205;

    // Factor in car topSpeed stat & character multiplier
    const carMaxSpeed = this.playerCar.topSpeed * this.playerCharacter.perks.speedMultiplier;
    let effectiveMaxSpeed = Math.min(maxGearSpeed, carMaxSpeed);

    if (this.nitroActive) {
      effectiveMaxSpeed = carMaxSpeed * 1.35;
      this.nitroTimer -= dt;
      if (this.nitroTimer <= 0) {
        this.nitroActive = false;
      }
    }

    // 2. Acceleration & Braking
    const accelRate = (this.playerCar.acceleration / 100) * (this.nitroActive ? 180 : 80);
    if (this.playerSpeedKmh < effectiveMaxSpeed) {
      this.playerSpeedKmh += accelRate * dt;
      if (this.playerSpeedKmh > effectiveMaxSpeed) this.playerSpeedKmh = effectiveMaxSpeed;
    } else if (this.playerSpeedKmh > effectiveMaxSpeed) {
      // Natural engine drag
      this.playerSpeedKmh -= 90 * dt;
      if (this.playerSpeedKmh < effectiveMaxSpeed) this.playerSpeedKmh = effectiveMaxSpeed;
    }

    // Update audio engine pitch
    audioManager.updateEnginePitch(this.playerSpeedKmh, this.currentGear);

    // 3. Steering & Chassis Physics
    const handlingPower = (this.playerCar.handling / 100) * this.playerCharacter.perks.handlingMultiplier * 260;
    const steerForce = this.steeringWheelAngle * handlingPower * (this.playerSpeedKmh / 100);
    this.playerX += steerForce * dt;

    // Keep player inside road boundaries
    const carHalfW = 16;
    const minX = this.roadLeftX + carHalfW;
    const maxX = this.roadLeftX + this.roadWidth - carHalfW;
    if (this.playerX < minX) {
      this.playerX = minX;
      // Shoulder friction
      this.playerSpeedKmh = Math.max(20, this.playerSpeedKmh - 60 * dt);
    } else if (this.playerX > maxX) {
      this.playerX = maxX;
      this.playerSpeedKmh = Math.max(20, this.playerSpeedKmh - 60 * dt);
    }

    // Chassis tilt angle
    const targetAngle = this.steeringWheelAngle * 0.22;
    this.playerAngle += (targetAngle - this.playerAngle) * Math.min(1, dt * 10);

    // Amir Mahdi Drift smoke effect
    if (this.playerCharacter.perks.hasDrift && Math.abs(this.steeringWheelAngle) > 0.45 && this.playerSpeedKmh > 70) {
      this.spawnParticle(this.playerX - 10, this.playerY + 24, 'drift');
      this.spawnParticle(this.playerX + 10, this.playerY + 24, 'drift');
    }

    // 4. Road Scrolling & Distance Progress
    const worldSpeed = (this.playerSpeedKmh / 3.6) * 12; // Pixel speed
    this.roadScrollY += worldSpeed * dt;
    this.stageDistance += (this.playerSpeedKmh / 3.6) * dt;

    // Check Stage Clear Completion
    if (this.stageDistance >= this.targetStageDistance) {
      this.handleStageCompletion();
    }

    // 5. Invulnerability Timer
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // Stage banner overlay timer
    if (this.stageCompleteBannerTimer > 0) {
      this.stageCompleteBannerTimer -= dt;
    }

    // 6. Spawn and Update Traffic, Items, Weather, Particles, Bullets
    this.updateTraffic(dt, worldSpeed);
    this.updateRoadItems(dt, worldSpeed);
    this.updateBullets(dt);
    this.updateParticles(dt, worldSpeed);
    this.spawnAmbientWeather(dt);
  }

  // ==========================================
  // TRAFFIC ENGINE & SPAWNING
  // ==========================================
  private updateTraffic(dt: number, worldSpeed: number): void {
    // Dynamic Traffic Density:
    // Ensure road has 4 to 8 traffic vehicles active for smooth, fun weaving
    const targetMinActive = Math.min(10, 4 + Math.floor(this.currentStage * 0.08));
    const activeCount = this.trafficPool.filter(c => c.active).length;

    // Spawn traffic smoothly whenever count falls below target
    if (activeCount < targetMinActive || Math.random() < dt * 1.8) {
      this.spawnTrafficCar();
    }

    const laneW = this.roadWidth / this.laneCount;

    for (let i = 0; i < this.MAX_TRAFFIC; i++) {
      const npc = this.trafficPool[i];
      if (!npc.active) continue;

      // NPC speed in px/s: Player travels faster than slower traffic, so NPC moves DOWN the screen towards player!
      const npcWorldSpeed = (npc.speed / 3.6) * 12;
      const relativeDownSpeed = worldSpeed - npcWorldSpeed;
      npc.y += relativeDownSpeed * dt;

      // Siren animation for emergency vehicles
      npc.sirenTime += dt;

      // Steady lane positioning (Cars stay strictly in their lane without swerving or drifting)
      npc.x = this.roadLeftX + (npc.lane + 0.5) * laneW;
      npc.turnSignal = 'none';

      // Honk reaction: If player honks, car speeds up slightly to acknowledge
      const distToPlayer = this.playerY - npc.y;
      if (this.isHornPressed && distToPlayer > 30 && distToPlayer < 240 && !npc.isHonked) {
        npc.isHonked = true;
        npc.speed = Math.min(75, npc.speed + 10);
      }

      // Check Overtake count
      if (!npc.overtaken && npc.y > this.playerY + 35) {
        npc.overtaken = true;
        this.stageOvertakenCount++;
        this.saveData.overtakenCount++;
      }

      // Despawn when out of view
      if (npc.y > this.height + 150 || npc.y < -400) {
        npc.active = false;
      }

      // Check Collision with Player (Fair and forgiving collision hitbox for rewarding weaving)
      if (npc.active) {
        const dx = Math.abs(npc.x - this.playerX);
        const dy = Math.abs(npc.y - this.playerY);
        const hitW = (npc.width + 16) / 2;
        const hitH = (npc.height + 36) / 2;

        if (dx < hitW && dy < hitH) {
          if (this.nitroActive) {
            // Player in Nitro smashes through NPC!
            this.destroyTrafficCar(npc);
          } else if (!this.isInvulnerable) {
            this.handlePlayerCrash(npc);
          }
        }
      }
    }
  }

  public spawnTrafficCarAt(lane: number, x: number, y: number, stageProgress: number = 0): void {
    const slot = this.trafficPool.find(c => !c.active);
    if (!slot) return;

    // Select NPC type from current biome tier
    const availableTypes = this.currentBiome.npcTypes;
    const chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    let width = 32;
    let height = 58;
    let speed = 40 + Math.random() * 25; // km/h (slower than player for overtaking!)
    let color = '#ef4444';
    let secondaryColor = '#ffffff';
    let health = 1;

    // 10-Tier Specific Color Presets and Vehicle Attributes
    const tier = Math.floor((this.currentStage - 1) / 10);
    if (chosenType === 'paykan') {
      width = 33;
      height = 58;
      speed = 36 + Math.random() * 22;
      const paykanColors = ['#f59e0b', '#15803d', '#fef08a', '#ffffff', '#dc2626', '#3b82f6'];
      color = paykanColors[Math.floor(Math.random() * paykanColors.length)];
      secondaryColor = '#cbd5e1';
      health = 1;
    } else if (chosenType === 'pride') {
      width = 30;
      height = 52;
      speed = 42 + Math.random() * 24;
      const prideColors = ['#ffffff', '#f8fafc', '#1e293b', '#94a3b8', '#eab308'];
      color = prideColors[Math.floor(Math.random() * prideColors.length)];
      secondaryColor = '#334155';
      health = 1;
    } else if (chosenType === 'nissan_blue') {
      width = 36;
      height = 68;
      speed = 35 + Math.random() * 20;
      color = '#0284c7';
      secondaryColor = '#0369a1';
      health = 2;
    } else if (chosenType === 'truck' || chosenType === 'semi') {
      width = 38;
      height = 92;
      speed = 28 + Math.random() * 20;
      color = tier === 1 ? '#ea580c' : '#b45309'; // Benz 1924 Orange
      secondaryColor = '#64748b';
      health = 3;
    } else if (chosenType === 'tanker') {
      width = 40;
      height = 98;
      speed = 30 + Math.random() * 18;
      color = '#64748b';
      secondaryColor = '#94a3b8';
      health = 3;
    } else if (chosenType === 'snowplow') {
      width = 40;
      height = 84;
      speed = 26 + Math.random() * 16;
      color = '#eab308';
      secondaryColor = '#475569';
      health = 3;
    } else if (chosenType === 'limo') {
      width = 34;
      height = 94;
      speed = 46 + Math.random() * 22;
      color = tier === 9 ? '#ffd700' : '#18181b';
      secondaryColor = '#fbbf24';
      health = 2;
    } else if (chosenType === 'bus') {
      width = 38;
      height = 110;
      speed = 34 + Math.random() * 18;
      color = '#f59e0b';
      secondaryColor = '#1e3a8a';
      health = 4;
    } else if (chosenType === 'tractor') {
      width = 34;
      height = 54;
      speed = 20 + Math.random() * 12;
      color = '#15803d';
      secondaryColor = '#dc2626';
      health = 2;
    } else if (chosenType === 'ambulance' || chosenType === 'firetruck') {
      width = 36;
      height = 76;
      speed = 55 + Math.random() * 24;
      color = chosenType === 'ambulance' ? '#f8fafc' : '#dc2626';
      secondaryColor = chosenType === 'ambulance' ? '#ef4444' : '#facc15';
      health = 2;
    } else if (chosenType === 'cyber') {
      width = 34;
      height = 64;
      speed = 60 + Math.random() * 30;
      color = '#090d16';
      secondaryColor = '#00f0ff';
      health = 2;
    } else if (chosenType === 'sports') {
      width = 34;
      height = 62;
      speed = 58 + Math.random() * 28;
      color = tier === 9 ? '#ffd700' : '#ec4899';
      secondaryColor = '#0f172a';
      health = 1;
    } else {
      // Standard Sedan
      const sedanColors = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#1e293b'];
      color = sedanColors[Math.floor(Math.random() * sedanColors.length)];
      secondaryColor = '#1f2937';
      health = 1;
    }

    slot.active = true;
    slot.x = x;
    slot.y = y;
    slot.lane = lane;
    slot.targetLane = lane;
    slot.laneChangeProgress = 1;
    slot.speed = speed;
    slot.width = width;
    slot.height = height;
    slot.color = color;
    slot.secondaryColor = secondaryColor;
    slot.type = chosenType;
    slot.health = health;
    slot.maxHealth = health;
    slot.isHonked = false;
    slot.sirenTime = 0;
    slot.overtaken = false;
    slot.aiBehavior = 'normal';
    slot.swervedTowardsPlayer = false;
    slot.turnSignal = 'none';
    slot.turnSignalTimer = 0;
    slot.isBraking = false;
    slot.brakeTimer = 0;
    slot.reactionDistance = 160;
    slot.aggression = 0;
  }

  private spawnTrafficCar(): void {
    const lane = Math.floor(Math.random() * this.laneCount);
    const laneW = this.roadWidth / this.laneCount;
    const x = this.roadLeftX + (lane + 0.5) * laneW;
    const y = -120 - Math.random() * 100;

    // Minimum distance spacing between cars in the same lane (keeps generous gap to weave)
    const minSpacing = 160;

    // Check if lane is already blocked near spawn point
    const isOccupied = this.trafficPool.some(c => c.active && Math.abs(c.x - x) < 32 && Math.abs(c.y - y) < minSpacing);
    if (isOccupied) return;

    // Prevent creating a full wall across all lanes at the same Y
    const isWallAtY = this.trafficPool.filter(c => c.active && Math.abs(c.y - y) < 80).length >= this.laneCount - 1;
    if (isWallAtY) return;

    this.spawnTrafficCarAt(lane, x, y);
  }

  // ==========================================
  // BULLET & WEAPON ENGINE
  // ==========================================
  private spawnBullet(x: number, y: number): void {
    const bullet = this.bulletPool.find(b => !b.active);
    if (!bullet) return;
    bullet.active = true;
    bullet.x = x;
    bullet.y = y;
    bullet.vy = -650;
  }

  private updateBullets(dt: number): void {
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      const b = this.bulletPool[i];
      if (!b.active) continue;

      b.y += b.vy * dt;

      // 1. Check collision with NPC traffic
      for (let t = 0; t < this.MAX_TRAFFIC; t++) {
        const npc = this.trafficPool[t];
        if (!npc.active) continue;

        if (Math.abs(b.x - npc.x) < npc.width / 2 + 3 && Math.abs(b.y - npc.y) < npc.height / 2) {
          b.active = false;
          npc.health -= b.damage;

          // Spark particle on hit
          for (let s = 0; s < 5; s++) {
            this.spawnParticle(b.x, b.y, 'spark');
          }

          if (npc.health <= 0) {
            this.destroyTrafficCar(npc);
          }
          break;
        }
      }

      // 2. Check collision with Road Obstacles
      if (b.active) {
        for (let r = 0; r < this.MAX_ROAD_ITEMS; r++) {
          const it = this.roadItemPool[r];
          if (!it.active || !it.isObstacle) continue;

          if (Math.abs(b.x - it.x) < 22 && Math.abs(b.y - it.y) < 22) {
            b.active = false;
            it.active = false;
            audioManager.playCrash();
            for (let s = 0; s < 8; s++) {
              this.spawnParticle(it.x, it.y, 'spark');
            }
            break;
          }
        }
      }

      // Despawn bullet offscreen
      if (b.y < -40) {
        b.active = false;
      }
    }
  }

  private destroyTrafficCar(npc: PooledTrafficCar): void {
    npc.active = false;
    audioManager.playCrash();

    // Explosion debris & smoke
    for (let p = 0; p < 18; p++) {
      this.spawnParticle(npc.x + (Math.random() * 20 - 10), npc.y + (Math.random() * 20 - 10), 'spark');
      this.spawnParticle(npc.x, npc.y, 'smoke');
    }

    // Drop bonus coins at wreck location
    for (let c = 0; c < 3; c++) {
      this.spawnRoadItem(npc.x + (c * 16 - 16), npc.y + (c * 8), 'coin', 2, false);
    }
  }

  // ==========================================
  // ROAD ITEMS & OBSTACLES (موانع و آیتم‌های جاده‌ای)
  // ==========================================
  private updateRoadItems(dt: number, worldSpeed: number): void {
    // Spawn road items & obstacles periodically with generous spacing
    if (Math.random() < dt * 1.5) {
      const lane = Math.floor(Math.random() * this.laneCount);
      const laneW = this.roadWidth / this.laneCount;
      const x = this.roadLeftX + (lane + 0.5) * laneW;
      
      // Check if there is an active car too close to spawn point in this lane
      const isCarNearby = this.trafficPool.some(c => c.active && Math.abs(c.x - x) < 30 && Math.abs(c.y - (-60)) < 90);
      if (!isCarNearby) {
        const rand = Math.random();
        if (rand < 0.14) {
          // Spawn Road Obstacle (موانع جاده‌ای)
          const obstacleTypes: RoadItemType[] = ['barrier', 'barrel', 'oilSlick', 'rock', 'cone'];
          const chosenObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          this.spawnRoadItem(x, -60, chosenObstacle, 0, true);
        } else if (rand < 0.28 && this.lives < this.maxLives) {
          this.spawnRoadItem(x, -60, 'heart', 1, false);
        } else if (rand < 0.42 && this.milestones.nitroUnlocked) {
          this.spawnRoadItem(x, -60, 'nitro', 1, false);
        } else if (rand < 0.56 && this.milestones.gunUnlocked) {
          this.spawnRoadItem(x, -60, 'ammo', 2, false);
        } else {
          this.spawnRoadItem(x, -60, 'coin', 1, false);
        }
      }
    }

    for (let i = 0; i < this.MAX_ROAD_ITEMS; i++) {
      const item = this.roadItemPool[i];
      if (!item.active) continue;

      item.y += worldSpeed * dt;
      item.rotation += dt * 3.5;

      // Check collision with Player
      if (!item.collected && Math.abs(item.x - this.playerX) < 28 && Math.abs(item.y - this.playerY) < 32) {
        if (item.isObstacle) {
          this.handleObstacleCollision(item);
        } else {
          this.collectRoadItem(item);
        }
      }

      if (item.y > this.height + 80) {
        item.active = false;
      }
    }
  }

  private spawnRoadItem(x: number, y: number, type: RoadItemType, value: number, isObstacle: boolean = false): void {
    const item = this.roadItemPool.find(it => !it.active);
    if (!item) return;
    item.active = true;
    item.x = x;
    item.y = y;
    item.type = type;
    item.value = value;
    item.rotation = 0;
    item.collected = false;
    item.scale = 1;
    item.isObstacle = isObstacle;
  }

  private handleObstacleCollision(item: PooledRoadItem): void {
    item.active = false;

    if (item.type === 'oilSlick') {
      // Oil slick triggers sudden slide & drift screech
      audioManager.playScreech();
      this.playerAngle = (Math.random() > 0.5 ? 0.35 : -0.35);
      this.playerSpeedKmh = Math.max(20, this.playerSpeedKmh - 30);
      for (let s = 0; s < 10; s++) {
        this.spawnParticle(this.playerX, this.playerY, 'drift');
      }
    } else if (item.type === 'cone') {
      // Cone bounces away with sparks
      audioManager.playCrash();
      for (let s = 0; s < 6; s++) {
        this.spawnParticle(item.x, item.y, 'spark');
      }
    } else {
      // Hard obstacle (barrier, barrel, rock)
      if (this.nitroActive) {
        // Ram through obstacle in nitro mode!
        audioManager.playCrash();
        for (let s = 0; s < 14; s++) {
          this.spawnParticle(item.x, item.y, 'spark');
          this.spawnParticle(item.x, item.y, 'smoke');
        }
      } else if (!this.isInvulnerable) {
        // Crash into obstacle
        this.lives--;
        audioManager.playCrash();
        this.playerSpeedKmh = Math.max(15, this.playerSpeedKmh * 0.4);
        this.isInvulnerable = true;
        this.invulnerableTimer = 1.8;

        for (let s = 0; s < 15; s++) {
          this.spawnParticle(this.playerX, this.playerY, 'spark');
        }

        if (this.lives <= 0) {
          this.isGameOver = true;
          if (this.onGameOver) {
            this.onGameOver(this);
          }
        }
      }
    }
  }

  private collectRoadItem(item: PooledRoadItem): void {
    item.collected = true;
    item.active = false;

    if (item.type === 'coin') {
      const multiplier = this.playerCharacter.perks.coinMultiplier;
      const earned = Math.round(item.value * multiplier);
      this.stageCoinsCollected += earned;
      this.saveData.coins += earned;
      audioManager.playCoin();
      // Coin sparkle particles
      for (let s = 0; s < 4; s++) {
        this.spawnParticle(item.x, item.y, 'coinGlow');
      }
    } else if (item.type === 'heart') {
      this.lives = Math.min(this.maxLives, this.lives + 1);
      audioManager.playCoin();
    } else if (item.type === 'nitro') {
      this.nitroCharges = Math.min(this.milestones.nitroMaxCharges + 1, this.nitroCharges + 1);
      audioManager.playCoin();
    } else if (item.type === 'ammo') {
      this.gunAmmo = Math.min(this.milestones.gunMaxAmmo + 3, this.gunAmmo + 3);
      audioManager.playCoin();
    }

    saveGameSave(this.saveData);
  }

  // ==========================================
  // PARTICLE & WEATHER SYSTEM
  // ==========================================
  private spawnParticle(
    x: number,
    y: number,
    type: 'smoke' | 'spark' | 'flame' | 'drift' | 'rain' | 'snow' | 'ember' | 'petal' | 'coinGlow'
  ): void {
    const p = this.particlePool.find(pt => !pt.active);
    if (!p) return;

    p.active = true;
    p.x = x;
    p.y = y;
    p.type = type;
    p.life = 0;

    if (type === 'smoke') {
      p.vx = (Math.random() * 20 - 10);
      p.vy = 20 + Math.random() * 30;
      p.size = 6 + Math.random() * 6;
      p.maxLife = 0.5 + Math.random() * 0.4;
      p.color = '#94a3b8';
      p.alpha = 0.7;
    } else if (type === 'spark') {
      p.vx = (Math.random() * 120 - 60);
      p.vy = (Math.random() * 120 - 60);
      p.size = 2 + Math.random() * 3;
      p.maxLife = 0.3 + Math.random() * 0.2;
      p.color = '#f59e0b';
      p.alpha = 1;
    } else if (type === 'flame') {
      p.vx = (Math.random() * 10 - 5);
      p.vy = 60 + Math.random() * 60;
      p.size = 4 + Math.random() * 5;
      p.maxLife = 0.25;
      p.color = '#38bdf8';
      p.alpha = 0.9;
    } else if (type === 'drift') {
      p.vx = (Math.random() * 6 - 3);
      p.vy = 40 + Math.random() * 20;
      p.size = 5 + Math.random() * 4;
      p.maxLife = 0.4;
      p.color = '#1e293b';
      p.alpha = 0.6;
    } else if (type === 'coinGlow') {
      p.vx = (Math.random() * 40 - 20);
      p.vy = -30 - Math.random() * 40;
      p.size = 3;
      p.maxLife = 0.4;
      p.color = '#fef08a';
      p.alpha = 1;
    }
  }

  private spawnAmbientWeather(dt: number): void {
    const effect = this.currentBiome.weatherEffect;
    if (!effect || effect === 'none') return;

    if (effect === 'rain' && Math.random() < dt * 35) {
      const p = this.particlePool.find(pt => !pt.active);
      if (p) {
        p.active = true;
        p.type = 'rain';
        p.x = Math.random() * this.width;
        p.y = -20;
        p.vx = -40;
        p.vy = 480 + Math.random() * 100;
        p.size = 14;
        p.life = 0;
        p.maxLife = 1.2;
        p.color = '#93c5fd';
        p.alpha = 0.6;
      }
    } else if (effect === 'snow' && Math.random() < dt * 20) {
      const p = this.particlePool.find(pt => !pt.active);
      if (p) {
        p.active = true;
        p.type = 'snow';
        p.x = Math.random() * this.width;
        p.y = -10;
        p.vx = Math.sin(this.totalGameTime * 3) * 20;
        p.vy = 90 + Math.random() * 40;
        p.size = 3 + Math.random() * 2;
        p.life = 0;
        p.maxLife = 4.0;
        p.color = '#f8fafc';
        p.alpha = 0.85;
      }
    } else if (effect === 'embers' && Math.random() < dt * 15) {
      const p = this.particlePool.find(pt => !pt.active);
      if (p) {
        p.active = true;
        p.type = 'ember';
        p.x = Math.random() * this.width;
        p.y = this.height + 10;
        p.vx = (Math.random() * 20 - 10);
        p.vy = -60 - Math.random() * 40;
        p.size = 3;
        p.life = 0;
        p.maxLife = 2.5;
        p.color = '#f97316';
        p.alpha = 0.9;
      }
    } else if (effect === 'petals' && Math.random() < dt * 12) {
      const p = this.particlePool.find(pt => !pt.active);
      if (p) {
        p.active = true;
        p.type = 'petal';
        p.x = Math.random() * this.width;
        p.y = -10;
        p.vx = Math.sin(this.totalGameTime * 2) * 30;
        p.vy = 80 + Math.random() * 30;
        p.size = 4;
        p.life = 0;
        p.maxLife = 3.5;
        p.color = '#f472b6';
        p.alpha = 0.8;
      }
    }
  }

  private updateParticles(dt: number, worldSpeed: number): void {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particlePool[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Fade alpha
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  // ==========================================
  // CRASH & STAGE MANAGEMENT
  // ==========================================
  private handlePlayerCrash(npc: PooledTrafficCar): void {
    this.lives--;
    audioManager.playCrash();
    this.playerSpeedKmh = Math.max(15, this.playerSpeedKmh * 0.4); // Slow down sharply

    // Push away NPC
    npc.speed = Math.max(10, npc.speed - 30);
    npc.y -= 30;

    // Trigger invulnerability blink
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.8;

    // Spawn collision sparks
    for (let s = 0; s < 15; s++) {
      this.spawnParticle(this.playerX, this.playerY, 'spark');
    }

    if (this.lives <= 0) {
      this.isGameOver = true;
      if (this.onGameOver) {
        this.onGameOver(this);
      }
    }
  }

  private handleStageCompletion(): void {
    const bonusCoins = 50 + this.currentStage * 10;
    this.saveData.coins += bonusCoins;
    audioManager.playStageComplete();

    this.stageCompleteBannerText = `مرحله ${this.currentStage} تکمیل شد! پاداش: +${bonusCoins} سکه`;
    this.stageCompleteBannerTimer = 3.0; // 3 sec overlay banner

    if (this.onStageClear) {
      this.onStageClear(this.currentStage, bonusCoins);
    }

    // Advance to next stage (up to 100)
    if (this.currentStage < 100) {
      this.currentStage++;
      this.saveData.highestStage = Math.max(this.saveData.highestStage, this.currentStage);
      this.currentBiome = getBiomeForStage(this.currentStage);
      this.milestones = getStageMilestones(this.currentStage);
      this.stageDistance = 0;
      this.targetStageDistance = 800 + this.currentStage * 35;
      
      // Recharge nitro and lives on stage advance
      this.nitroCharges = this.milestones.nitroMaxCharges;
      this.gunAmmo = this.milestones.gunMaxAmmo;
      this.lives = Math.min(this.maxLives, this.lives + 1);
    }

    saveGameSave(this.saveData);
  }

  // ==========================================
  // RENDER ENGINE
  // ==========================================
  private render(): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Draw Biome Road & Environment
    GraphicsRenderer.drawRoadEnvironment(
      ctx,
      w,
      h,
      this.currentBiome,
      this.roadScrollY,
      this.roadLeftX,
      this.roadWidth,
      this.laneCount
    );

    // 2. Draw Road Items & Obstacles
    for (let i = 0; i < this.MAX_ROAD_ITEMS; i++) {
      const it = this.roadItemPool[i];
      if (!it.active) continue;

      if (it.isObstacle) {
        GraphicsRenderer.drawRoadObstacle(ctx, it.type, it.x, it.y, this.totalGameTime);
      } else {
        ctx.save();
        ctx.translate(it.x, it.y);

        if (it.type === 'coin') {
          // Shiny rotating coin
          const coinW = 14 * Math.abs(Math.cos(it.rotation));
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.max(3, coinW), 14, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 9px Vazirmatn, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else if (it.type === 'heart') {
          // Red heart
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(-5, -3, 6, 0, Math.PI * 2);
          ctx.arc(5, -3, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-11, -1);
          ctx.lineTo(0, 11);
          ctx.lineTo(11, -1);
          ctx.closePath();
          ctx.fill();
        } else if (it.type === 'nitro') {
          // Blue nitro bottle
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-6, -10, 12, 20);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-4, -14, 8, 4);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('NOS', 0, 3);
        } else if (it.type === 'ammo') {
          // Golden bullets pack
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-7, -8, 5, 16);
          ctx.fillRect(2, -8, 5, 16);
        }

        ctx.restore();
      }
    }

    // 3. Draw Bullets
    for (let i = 0; i < this.MAX_BULLETS; i++) {
      const b = this.bulletPool[i];
      if (!b.active) continue;

      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
      ctx.restore();
    }

    // 4. Draw NPC Traffic Cars
    for (let i = 0; i < this.MAX_TRAFFIC; i++) {
      const npc = this.trafficPool[i];
      if (!npc.active) continue;

      GraphicsRenderer.drawTrafficCar(
        ctx,
        npc,
        this.totalGameTime
      );
    }

    // 5. Draw Dynamic Headlights (for Night/Rain/Cyberpunk/Noir or Zandayi)
    const isNight = this.currentBiome.nightMode;
    const hasRgb = this.playerCharacter.perks.hasRgbLights;

    if (isNight || hasRgb) {
      GraphicsRenderer.drawHeadlights(
        ctx,
        this.playerX,
        this.playerY,
        this.playerAngle,
        hasRgb,
        this.totalGameTime
      );
    }

    // 6. Draw Player Car (with invulnerability blinking & customizations)
    const isBlinking = this.isInvulnerable && Math.floor(this.totalGameTime * 14) % 2 === 0;
    if (!isBlinking) {
      const customization = this.saveData.carCustomizations?.[this.playerCar.id];
      GraphicsRenderer.drawCarWithCustomization(
        ctx,
        this.playerX,
        this.playerY,
        this.playerCar,
        customization,
        this.playerAngle,
        this.nitroActive,
        1.0,
        hasRgb,
        this.totalGameTime
      );
    }

    // 7. Draw Weather & Particles
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particlePool[i];
      if (!p.active) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'rain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + p.size);
        ctx.stroke();
      } else if (p.type === 'snow' || p.type === 'petal') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 8. Draw Top Analog Speedometer HUD dial
    GraphicsRenderer.drawAnalogSpeedometer(
      ctx,
      54,
      56,
      38,
      this.playerSpeedKmh,
      this.playerCar.topSpeed,
      this.currentGear,
      hasRgb,
      this.totalGameTime
    );

    // 9. Draw Stage Clear Overlay Banner (if active)
    if (this.stageCompleteBannerTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(20, h * 0.35, w - 40, 64, 12);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 15px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.stageCompleteBannerText, w / 2, h * 0.35 + 38);
      ctx.restore();
    }
  }

  private getLaneFromX(x: number): number {
    const laneW = this.roadWidth / this.laneCount;
    const lane = Math.floor((x - this.roadLeftX) / laneW);
    return Math.max(0, Math.min(this.laneCount - 1, lane));
  }
}
