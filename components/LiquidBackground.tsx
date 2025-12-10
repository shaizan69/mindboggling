"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector2, Color } from "three";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  
  // Aspect ratio correction
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUV = uv;
  aspectUV.x *= aspect;

  // Mouse influence
  vec2 mouse = uMouse * vec2(aspect, 1.0);
  float dist = distance(aspectUV, mouse);
  float mouseDistortion = smoothstep(0.4, 0.0, dist) * 0.1;

  // Liquid movement
  float time = uTime * 0.2;
  float noise1 = snoise(aspectUV * 3.0 + time + mouseDistortion);
  float noise2 = snoise(aspectUV * 6.0 - time * 1.5 + noise1);
  
  // Mixing noises for fluid effect
  float fluid = snoise(aspectUV * 2.0 + vec2(noise1, noise2) * 0.5);
  
  // Color palette (Dark Liquid)
  vec3 color1 = vec3(0.02, 0.02, 0.02); // Deep black/grey
  vec3 color2 = vec3(0.1, 0.1, 0.12);   // Slightly bluish grey
  vec3 color3 = vec3(0.05, 0.05, 0.05); // Mid grey
  
  vec3 finalColor = mix(color1, color2, smoothstep(-0.5, 0.5, fluid));
  finalColor = mix(finalColor, color3, smoothstep(0.2, 0.8, noise2));
  
  // Vignette
  float vignette = smoothstep(1.5, 0.5, length(uv - 0.5));
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const LiquidPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(size.width, size.height) },
    }),
    [size]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Update mouse position (normalized 0-1)
      const x = (state.pointer.x + 1) / 2;
      const y = (state.pointer.y + 1) / 2;
      
      // Smoothly interpolate mouse uniform
      material.uniforms.uMouse.value.lerp(new Vector2(x, y), 0.1);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        <LiquidPlane />
      </Canvas>
    </div>
  );
}

