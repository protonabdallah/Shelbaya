"use client";

import React, { useRef, useEffect } from 'react';

const shaderSource = `#version 300 es
precision lowp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)),
        c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.;
  for (int i=0; i<3; i++) {  // reduced from 5 to 3
    t+=a*noise(p); p*=2.; a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<2.; i++) {  // reduced from 3 to 2
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a); d=a; p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<7.; i++) {  // reduced from 12 to 6
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(3,1,5))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.18,bg*.08,bg*.38),d);
  }
  O=vec4(col,1);
}`;

export const ShaderHeroBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', {
      powerPreference: 'low-power',
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;
    const W = Math.floor(window.innerWidth * 0.5);
    const H = Math.floor(window.innerHeight * 0.5);
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
    const vtxSrc = `#version 300 es
precision lowp float;
in vec4 position;
void main(){gl_Position=position;}`;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(vs, vtxSrc);
    gl.compileShader(vs);
    gl.shaderSource(fs, shaderSource);
    gl.compileShader(fs);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');
    const TARGET_FPS = 30;
    const FRAME_MS = 1000 / TARGET_FPS;
    let lastFrame = 0;

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      gl.useProgram(prog);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    render(0);

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'black', imageRendering: 'auto', objectFit: 'cover' }}
    />
  );
};
