// src/components/ui/ContourLines.tsx
'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// High performance WebGL Shader architecture running entirely on the GPU
const TopoShader = {
    vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float uTime;
        uniform float uSpeed;
        
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
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 a0 = x - floor(x + 0.5);
            vec3 m0 = m * ( 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ) );
            vec3 g;
            g.x  = a0.x * x0.x  + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vUv = uv;
            vec2 noiseUv = uv * 2.2;
            float timeOffset = uTime * uSpeed;
            
            float n1 = snoise(noiseUv + vec2(timeOffset * 0.15, timeOffset * 0.08));
            float n2 = snoise(noiseUv * 2.3 - vec2(timeOffset * 0.07)) * 0.4;
            float combinedNoise = n1 + n2;
            
            vElevation = combinedNoise;
            vec3 displacedPosition = position;
            displacedPosition.z += combinedNoise * 1.5;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform vec3 uLineColor;
        uniform vec3 uBgColor;
        uniform float uContourDensity;
        uniform float uLineWidth;

        void main() {
            float fraction = vElevation * uContourDensity;
            float widthFactor = uLineWidth;
            
            float isIndexContour = mod(floor(fraction + 0.5), 5.0) == 0.0 ? 1.5 : 0.75;
            
            float df = fwidth(fraction);
            float g = abs(fract(fraction - 0.5) - 0.5) / (df * widthFactor * isIndexContour);
            float lineIntensity = 1.0 - min(g, 1.0);
            
            float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) *
                             smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
            
            vec3 finalColor = mix(uBgColor, uLineColor, lineIntensity * edgeFade * 0.35);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

const TopoMesh = ({ lineColor, bgColor }: { lineColor: string; bgColor: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSpeed: { value: 0.03 },
        uContourDensity: { value: 14.0 },
        uLineWidth: { value: 1.0 },
        uLineColor: { value: new THREE.Color(lineColor) },
        uBgColor: { value: new THREE.Color(bgColor) }
    }), [lineColor, bgColor]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 3.2, 0, Math.PI / 16]} position={[0, -0.3, 0]}>
            <planeGeometry args={[34, 24, 100, 100]} />
            <shaderMaterial
                vertexShader={TopoShader.vertexShader}
                fragmentShader={TopoShader.fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export interface ContourLinesProps {
    lineColor?: string;
    bgColor?: string;
    className?: string;
}

export default function ContourLines({ lineColor, bgColor, className }: ContourLinesProps = {}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const colors = useMemo(() => {
        if (lineColor && bgColor) return { line: lineColor, bg: bgColor };
        return resolvedTheme === 'light'
            ? { line: lineColor || '#00b4d8', bg: bgColor || '#f8fafc' }
            : { line: lineColor || '#00b4d8', bg: bgColor || '#040d18' };
    }, [resolvedTheme, lineColor, bgColor]);

    if (!mounted) {
        return <div className="absolute inset-0 bg-background" />;
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} className={`pointer-events-none overflow-hidden ${className || ''}`}>
            {/* Usar `key={resolvedTheme}` destruye la instancia completa del Canvas de Three.js 
              y la vuelve a renderizar con la configuración inicial de GPU correcta en el instante exacto 
              en que cambia el tema, evitando cualquier tipo de retraso o estela blanca residual.
            */}
            <Canvas 
                key={`${resolvedTheme}-${colors.bg}-${colors.line}`} 
                camera={{ position: [0, 2, 8], fov: 60 }} 
                gl={{ antialias: true }}
                onCreated={({ gl }) => {
                    gl.setClearColor(new THREE.Color(colors.bg), 1);
                }}
            >
                <TopoMesh lineColor={colors.line} bgColor={colors.bg} />
            </Canvas>
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
    );
}