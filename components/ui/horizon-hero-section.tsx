"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HorizonHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;
  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const threeRefs = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    stars: THREE.Points[];
    mountains: THREE.Mesh[];
    animationId: number | null;
    targetCameraX?: number;
    targetCameraY?: number;
    targetCameraZ?: number;
    locations?: number[];
  }>({
    scene: null, camera: null, renderer: null,
    stars: [], mountains: [], animationId: null,
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const refs = threeRefs.current;
    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);
    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    refs.camera.position.set(0, 20, 100);
    refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.5;

    for (let layer = 0; layer < 3; layer++) {
      const count = 3000;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      for (let j = 0; j < count; j++) {
        const r = 200 + Math.random() * 800, theta = Math.random() * Math.PI * 2, phi = Math.acos(Math.random() * 2 - 1);
        pos[j * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[j * 3 + 2] = r * Math.cos(phi);
        const c = new THREE.Color(); c.setHSL(0, 0, 0.8 + Math.random() * 0.2);
        col[j * 3] = c.r; col[j * 3 + 1] = c.g; col[j * 3 + 2] = c.b;
        sizes[j] = Math.random() * 2 + 0.5;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `attribute float size; attribute vec3 color; varying vec3 vColor; uniform float time; uniform float depth;
          void main() { vColor=color; vec3 pos=position; float a=time*0.05*(1.-depth*0.3); mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a)); pos.xy=r*pos.xy; vec4 mv=modelViewMatrix*vec4(pos,1.); gl_PointSize=size*(300./-mv.z); gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vColor; void main() { float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard; float o=1.-smoothstep(0.,0.5,d); gl_FragColor=vec4(vColor,o); }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const stars = new THREE.Points(geo, mat);
      refs.scene.add(stars); refs.stars.push(stars);
    }

    const layers = [
      { distance: -50, height: 60, color: 0x1a1a2e },
      { distance: -100, height: 80, color: 0x16213e },
      { distance: -150, height: 100, color: 0x0f3460 },
      { distance: -200, height: 120, color: 0x0a4668 },
    ];
    refs.locations = [];
    layers.forEach((layer, idx) => {
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= 50; i++) {
        const x = (i / 50 - 0.5) * 1000;
        const y = Math.sin(i * 0.1) * layer.height + Math.sin(i * 0.05) * layer.height * 0.5 - 100;
        pts.push(new THREE.Vector2(x, y));
      }
      pts.push(new THREE.Vector2(5000, -300)); pts.push(new THREE.Vector2(-5000, -300));
      const shape = new THREE.Shape(pts);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: 1 - idx * 0.2, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = layer.distance; mesh.position.y = layer.distance;
      mesh.userData = { baseZ: layer.distance };
      refs.scene!.add(mesh); refs.mountains.push(mesh);
      refs.locations![idx] = layer.distance;
    });

    // Animation loop
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      refs.stars.forEach((s) => { if ((s.material as THREE.ShaderMaterial).uniforms) (s.material as THREE.ShaderMaterial).uniforms.time.value = time; });
      if (refs.camera && refs.targetCameraX !== undefined) {
        const f = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * f;
        smoothCameraPos.current.y += (refs.targetCameraY! - smoothCameraPos.current.y) * f;
        smoothCameraPos.current.z += (refs.targetCameraZ! - smoothCameraPos.current.z) * f;
        refs.camera.position.set(
          smoothCameraPos.current.x + Math.sin(time * 0.1) * 2,
          smoothCameraPos.current.y + Math.cos(time * 0.15),
          smoothCameraPos.current.z
        );
        refs.camera.lookAt(0, 10, -600);
      }
      refs.mountains.forEach((m, i) => {
        m.position.x = Math.sin(time * 0.1) * 2 * (1 + i * 0.5);
        m.position.y = 50 + Math.cos(time * 0.15) * (1 + i * 0.5);
      });
      refs.renderer!.render(refs.scene!, refs.camera!);
    };
    animate();
    setIsReady(true);

    const handleResize = () => {
      if (!refs.camera || !refs.renderer) return;
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      refs.stars.forEach((s) => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      refs.mountains.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      refs.renderer?.dispose();
    };
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!isReady) return;
    const tl = gsap.timeline();
    if (titleRef.current) tl.from(titleRef.current.querySelectorAll(".title-char"), { y: 120, opacity: 0, duration: 1.2, stagger: 0.04, ease: "power4.out" });
    if (subtitleRef.current) tl.from(subtitleRef.current.querySelectorAll(".sub-line"), { y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" }, "-=0.6");
    if (scrollProgressRef.current) tl.from(scrollProgressRef.current, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.4");
    return () => { tl.kill(); };
  }, [isReady]);

  // Scroll camera
  useEffect(() => {
    const handler = () => {
      const prog = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
      setScrollProgress(prog);
      setCurrentSection(Math.floor(prog * totalSections));
      const refs = threeRefs.current;
      const positions = [{ x: 0, y: 30, z: 300 }, { x: 0, y: 40, z: -50 }, { x: 0, y: 50, z: -700 }];
      const sec = Math.floor(prog * totalSections);
      const frac = (prog * totalSections) % 1;
      const cur = positions[sec] ?? positions[0];
      const nxt = positions[sec + 1] ?? cur;
      refs.targetCameraX = cur.x + (nxt.x - cur.x) * frac;
      refs.targetCameraY = cur.y + (nxt.y - cur.y) * frac;
      refs.targetCameraZ = cur.z + (nxt.z - cur.z) * frac;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ background: "#000" }} />
      <div className="fixed inset-0 z-10 flex flex-col justify-center px-12 pointer-events-none">
        <h1 ref={titleRef} className="text-[80px] md:text-[140px] font-bold text-white leading-none uppercase tracking-tight">
          {"HORIZON".split("").map((c, i) => (<span key={i} className="title-char inline-block">{c}</span>))}
        </h1>
        <div ref={subtitleRef} className="mt-6 space-y-1">
          <p className="sub-line text-white/70 text-lg tracking-widest uppercase">Where vision meets reality,</p>
          <p className="sub-line text-white/50 text-base tracking-widest uppercase">we shape the future of tomorrow</p>
        </div>
      </div>
      <div ref={scrollProgressRef} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/50 text-xs tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-32 h-px bg-white/20 relative">
          <div className="absolute inset-y-0 left-0 bg-[#CA8A04] transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <span className="text-white/30 text-xs font-mono">{String(currentSection + 1).padStart(2, "0")} / {String(totalSections).padStart(2, "0")}</span>
      </div>
      <div style={{ height: `${(totalSections + 1) * 100}vh` }} />
    </div>
  );
}
