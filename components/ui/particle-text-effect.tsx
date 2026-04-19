"use client";

import { useEffect, useRef } from "react";

interface Vector2D {
  x: number;
  y: number;
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };

  closeEnoughTarget = 100;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;

  startColor = { r: 0, g: 0, b: 0 };
  targetColor = { r: 0, g: 0, b: 0 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move() {
    let proximityMult = 1;
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
        Math.pow(this.pos.y - this.target.y, 2)
    );
    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };
    const mag = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    );
    if (mag > 0) {
      towardsTarget.x = (towardsTarget.x / mag) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / mag) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };
    const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerMag > 0) {
      steer.x = (steer.x / steerMag) * this.maxForce;
      steer.y = (steer.y / steerMag) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }
    const r = Math.round(
      this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight
    );
    const g = Math.round(
      this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight
    );
    const b = Math.round(
      this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight
    );
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    if (drawAsPoints) {
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const rndX = Math.random() * 1000;
      const rndY = Math.random() * 500;
      const cx = width / 2, cy = height / 2;
      const dx = rndX - cx, dy = rndY - cy;
      const m = Math.sqrt(dx * dx + dy * dy) || 1;
      const dist = (width + height) / 2;
      this.target.x = cx + (dx / m) * dist;
      this.target.y = cy + (dy / m) * dist;

      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

// Colour palette: gold → white → warm tones that match portfolio
const PALETTE = [
  { r: 202, g: 138, b: 4 },   // gold
  { r: 245, g: 245, b: 245 }, // near-white
  { r: 180, g: 83,  b: 9 },   // amber
  { r: 251, g: 191, b: 36 },  // yellow
  { r: 255, g: 255, b: 255 }, // white
];

interface ParticleTextEffectProps {
  words?: string[];
  /** px width of internal canvas (default 1000) */
  canvasWidth?: number;
  /** px height of internal canvas (default 500) */
  canvasHeight?: number;
  /** frames between word changes (default 240 ≈ 4 s at 60 fps) */
  interval?: number;
  className?: string;
}

export function ParticleTextEffect({
  words = ["AHMAD", "AL-KISWANY", "PHOTOGRAPHER", "VIDEO EDITOR", "VOLUNTEER"],
  canvasWidth = 1000,
  canvasHeight = 300,
  interval = 220,
  className,
}: ParticleTextEffectProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number>(0);
  const particles   = useRef<Particle[]>([]);
  const frameCount  = useRef(0);
  const wordIdx     = useRef(0);
  const mouseRef    = useRef({ x: 0, y: 0, isPressed: false, isRight: false });
  const colorIdx    = useRef(0);

  const spawnPos = (w: number, h: number): Vector2D => {
    const cx = w / 2, cy = h / 2;
    const rx = Math.random() * w, ry = Math.random() * h;
    const dx = rx - cx, dy = ry - cy;
    const m = Math.sqrt(dx * dx + dy * dy) || 1;
    const dist = (w + h) / 2;
    return { x: cx + (dx / m) * dist, y: cy + (dy / m) * dist };
  };

  const loadWord = (word: string, canvas: HTMLCanvasElement) => {
    const off = document.createElement("canvas");
    off.width  = canvas.width;
    off.height = canvas.height;
    const ctx2 = off.getContext("2d")!;

    // Responsive font — fill ~80% of width
    const fontSize = Math.min(Math.floor(canvas.width / (word.length * 0.58)), canvas.height * 0.62);
    ctx2.fillStyle   = "white";
    ctx2.font        = `900 ${fontSize}px "Archivo", Arial, sans-serif`;
    ctx2.textAlign   = "center";
    ctx2.textBaseline = "middle";
    ctx2.fillText(word, canvas.width / 2, canvas.height / 2);

    const data   = ctx2.getImageData(0, 0, canvas.width, canvas.height).data;
    const step   = 6; // pixel sampling stride (lower = more particles, heavier)
    const newColor = PALETTE[colorIdx.current % PALETTE.length];
    colorIdx.current++;

    const pool = particles.current;
    let pi = 0;

    // Collect lit pixel indices then shuffle for fluid emergence
    const lit: number[] = [];
    for (let i = 0; i < data.length; i += step * 4) {
      if (data[i + 3] > 0) lit.push(i);
    }
    for (let i = lit.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lit[i], lit[j]] = [lit[j], lit[i]];
    }

    for (const idx of lit) {
      const x = (idx / 4) % canvas.width;
      const y = Math.floor(idx / 4 / canvas.width);

      let p: Particle;
      if (pi < pool.length) {
        p = pool[pi];
        p.isKilled = false;
        pi++;
      } else {
        p = new Particle();
        const sp = spawnPos(canvas.width, canvas.height);
        p.pos.x = sp.x; p.pos.y = sp.y;
        p.maxSpeed     = Math.random() * 6 + 4;
        p.maxForce     = p.maxSpeed * 0.05;
        p.particleSize = Math.random() * 5 + 5;
        p.colorBlendRate = Math.random() * 0.027 + 0.003;
        pool.push(p);
      }

      p.startColor = {
        r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight,
        g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight,
        b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight,
      };
      p.targetColor  = newColor;
      p.colorWeight  = 0;
      p.target.x = x;
      p.target.y = y;
    }

    for (let i = pi; i < pool.length; i++) pool[i].kill(canvas.width, canvas.height);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pool = particles.current;

    // Dark trail fade — matches site background
    ctx.fillStyle = "rgba(12,10,9,0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.move();
      p.draw(ctx, true);
      if (p.isKilled && (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height)) {
        pool.splice(i, 1);
      }
    }

    // Right-click destroy
    if (mouseRef.current.isPressed && mouseRef.current.isRight) {
      pool.forEach((p) => {
        const dx = p.pos.x - mouseRef.current.x;
        const dy = p.pos.y - mouseRef.current.y;
        if (dx * dx + dy * dy < 2500) p.kill(canvas.width, canvas.height);
      });
    }

    frameCount.current++;
    if (frameCount.current % interval === 0) {
      wordIdx.current = (wordIdx.current + 1) % words.length;
      loadWord(words[wordIdx.current], canvas);
    }

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;

    // Fill dark background first frame
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgb(12,10,9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    loadWord(words[0], canvas);
    animRef.current = requestAnimationFrame(animate);

    const toLocal = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / r.width;
      const scaleY = canvas.height / r.height;
      return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
    };

    const onDown  = (e: MouseEvent) => { const p = toLocal(e); mouseRef.current = { ...p, isPressed: true, isRight: e.button === 2 }; };
    const onUp    = ()               => { mouseRef.current.isPressed = false; mouseRef.current.isRight = false; };
    const onMove  = (e: MouseEvent) => { const p = toLocal(e); mouseRef.current.x = p.x; mouseRef.current.y = p.y; };
    const noMenu  = (e: Event)       => e.preventDefault();

    canvas.addEventListener("mousedown",    onDown);
    canvas.addEventListener("mouseup",      onUp);
    canvas.addEventListener("mousemove",    onMove);
    canvas.addEventListener("contextmenu",  noMenu);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown",   onDown);
      canvas.removeEventListener("mouseup",     onUp);
      canvas.removeEventListener("mousemove",   onMove);
      canvas.removeEventListener("contextmenu", noMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
