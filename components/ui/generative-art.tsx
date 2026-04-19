"use client";

import { useEffect } from "react";

// Generative art canvas component using particle/dot animations
export function GenerativeArt() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── utility helpers ──────────────────────────────────────────────────────
    const getNs = (n: number, v: number) => Array.from({ length: n }, () => v);
    const getRndYLinspaceX = (n: number, xMin: number, xMax: number, yMin: number, yMax: number) => {
      const s = (xMax - xMin) / n;
      return Array.from({ length: n }, (_, i) => ({ x: xMin + i * s, y: yMin + Math.random() * (yMax - yMin) }));
    };
    const getLinspaceYLinspaceX = (n: number, xMin: number, xMax: number, yMin: number, yMax: number) => {
      const sX = (xMax - xMin) / n, sY = (yMax - yMin) / n;
      return Array.from({ length: n }, (_, i) => ({ x: xMin + i * sX, y: yMin + i * sY }));
    };
    const getCirc = (n: number, ix: number, iy: number, rad: number) => {
      const d = (2 * Math.PI) / n;
      return Array.from({ length: n }, (_, i) => ({ x: ix + Math.cos(i * d) * rad, y: iy + Math.sin(i * d) * rad }));
    };
    const getRndCirc = (n: number, ix: number, iy: number, rad: number) =>
      Array.from({ length: n }, () => { const a = Math.random() * 2 * Math.PI; return { x: ix + Math.cos(a) * rad, y: iy + Math.sin(a) * rad }; });
    const permuteY = (path: { x: number; y: number }[], noise: number) =>
      path.map(({ x, y }) => ({ x, y: y + (1 - 2 * Math.random()) * noise }));
    const permute = (arr: number[], noise: number) =>
      arr.map((v) => v + (1 - 2 * Math.random()) * noise);
    const limit = (v: number, ma: number, mi: number) => Math.max(Math.min(v, ma), mi);
    const drawDots = (ctx: CanvasRenderingContext2D, p: { x: number; y: number }[], rad: number, fill: boolean) => {
      for (const { x, y } of p) {
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 2 * Math.PI);
        fill ? ctx.fill() : ctx.stroke();
      }
    };
    const clear = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.fill();
    };
    const getCanvasSize = () => ({ width: Math.max(window.innerWidth - 60, 320), height: Math.max(0.6 * window.innerHeight, 400) });
    const isInViewport = (el: HTMLElement) => {
      const { bottom, top } = el.getBoundingClientRect();
      const mid = 0.5 * (bottom + top);
      return mid > 0 && mid < (window.innerHeight || document.documentElement.clientHeight);
    };

    type Pt = { x: number; y: number };
    const WHITE = "rgba(12,10,9,1.0)", GRAY = "rgba(202,138,4,0.8)", LINEWIDTH = 2;

    const getBoundary = (w: number, h: number) => {
      const edgeX = 0.05 * w, edgeTopY = 0.2 * h, edgeBottomY = 0.2 * h;
      const xMin = edgeX, xMax = w - edgeX, yMin = edgeTopY, yMax = h - edgeBottomY;
      return { xMin, xMax, yMin, yMax, yMid: 0.5 * (yMax + yMin), xMid: 0.5 * (xMax + xMin), xl: 0, xr: w, yb: h, yt: 0 };
    };

    type SceneFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => () => void;
    const drawings: Record<string, number | undefined> = {};

    const animloop = (f: () => void, id: string) => {
      drawings[id] = requestAnimationFrame(() => animloop(f, id));
      f();
    };

    const updateAndStartCanvas = (name: string, getScene: SceneFn) => {
      const canvasId = `canvas-${name}`, containerId = `container-${name}`;
      const { width, height } = getCanvasSize();
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = `<canvas width="${width}" height="${height}" style="display:block;" id="${canvasId}"></canvas>`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const scene = getScene(ctx, width, height);
      const scrollHandler = () => {
        const inView = isInViewport(container);
        const animId = drawings[canvasId];
        if (inView && !animId) animloop(scene, canvasId);
        else if (!inView && animId) { cancelAnimationFrame(animId); drawings[canvasId] = undefined; }
      };
      if (isInViewport(container)) animloop(scene, canvasId);
      window.addEventListener("scroll", scrollHandler, { passive: true });
    };

    // ── scenes ───────────────────────────────────────────────────────────────
    const scenes: Record<string, SceneFn> = {
      // Wave of dots transitioning between random positions
      multiple: (ctx, w, h) => {
        const b = getBoundary(w, h); const num = Math.floor(w / 20);
        let path1 = getLinspaceYLinspaceX(num, b.xMin, b.xMax, b.yMid, b.yMid),
            path2 = getRndYLinspaceX(num, b.xMin, b.xMax, b.yMin, b.yMax), itt = 0;
        ctx.strokeStyle = GRAY; ctx.fillStyle = GRAY; ctx.lineWidth = LINEWIDTH;
        return () => {
          itt++; ctx.fillStyle = WHITE; clear(ctx, w, h); ctx.fillStyle = GRAY;
          if (itt % 120 === 0) { path1 = path2; path2 = getRndYLinspaceX(num, b.xMin, b.xMax, b.yMin, b.yMax); }
          const path = path1.map(({ x }, i) => ({
            x, y: path1[i].y + Math.sin((itt % 120) / 120 * Math.PI * 0.5) * (path2[i].y - path1[i].y),
          }));
          drawDots(ctx, path, 4, true);
        };
      },
      // Particle cloud drifting outward from a circle
      "new-beginnings": (ctx, w, h) => {
        const b = getBoundary(w, h); const num = Math.floor(w * 0.6), rad = Math.min(0.15 * w, 0.15 * h);
        let path: Pt[] = getCirc(num, b.xMid, b.yMid, rad);
        let velx = getNs(num, 0) as number[], vely = getNs(num, 0) as number[];
        ctx.lineWidth = 1; ctx.fillStyle = WHITE; clear(ctx, w, h);
        ctx.strokeStyle = GRAY; ctx.fillStyle = "rgba(202,138,4,0.06)";
        return () => {
          velx = permute(velx, 0.01); vely = permute(vely, 0.01);
          let sx = 0, sy = 0;
          path = path.map(({ x, y }, i) => {
            sx += velx[i]; sy += vely[i];
            return { x: limit(x + sx, b.xr, b.xl), y: limit(y + sy, b.yb, b.yt) };
          });
          drawDots(ctx, path, 1, true);
        };
      },
    };

    Object.entries(scenes).forEach(([name, fn]) => updateAndStartCanvas(name, fn));

    return () => {
      Object.keys(drawings).forEach((id) => { if (drawings[id]) cancelAnimationFrame(drawings[id]!); });
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        id="container-multiple"
        className="w-full rounded-xl overflow-hidden border border-white/5"
        title="Wave — click to regenerate"
      />
      <div
        id="container-new-beginnings"
        className="w-full rounded-xl overflow-hidden border border-white/5"
        title="Particles — click to regenerate"
      />
    </div>
  );
}
