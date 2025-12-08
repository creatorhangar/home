import * as THREE from 'three';

export const CosmicFireShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#FF4400') }, // Orange/Red
        uGlow: { value: 1.0 },
        uResolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uColor;
        uniform float uGlow;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Simplex noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;
            
            float t = uTime * uSpeed * 1.5; // Faster
            
            // Plasma / Fire effect - More turbulence
            float n = snoise(uv * 3.0 + vec2(0.0, -t));
            n += 0.5 * snoise(uv * 6.0 + vec2(0.0, -t * 1.5));
            n += 0.25 * snoise(uv * 12.0 + vec2(0.0, -t * 2.0));
            
            // Radial gradient for center heat
            float r = length(uv);
            float centerGlow = 1.0 - smoothstep(0.0, 1.2, r);
            
            // Color mapping - Hotter core
            vec3 color = mix(vec3(0.1, 0.0, 0.2), uColor, n * 0.6 + 0.4);
            color += vec3(1.0, 0.9, 0.5) * centerGlow * 0.8; // Yellow/White core
            
            // Add some purple/blue for "Cosmic" feel
            color += vec3(0.5, 0.0, 1.0) * (1.0 - n) * 0.4;
            
            // Intensity
            color *= uGlow * 1.8;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};
