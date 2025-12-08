import * as THREE from 'three';

import * as THREE from 'three';

export const InterstellarSingularityShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#FF8C00') }, // Default orange accretion disk
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

        #define PI 3.14159265359

        // Noise functions for texture
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            // Normalize UVs to -1.0 to 1.0, correcting for aspect ratio
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;

            float r = length(uv);
            float angle = atan(uv.y, uv.x);

            // Black Hole Parameters
            float eventHorizonRadius = 0.25;
            float accretionDiskInner = 0.35;
            float accretionDiskOuter = 0.85;
            
            // Gravitational Lensing Distortion
            // Light bends around the black hole. 
            // We simulate this by distorting the UVs based on distance to center.
            float distortion = eventHorizonRadius * 2.0 / (r + 0.001);
            float bend = 1.0 - distortion * 0.3; 
            vec2 distortedUV = uv * bend;

            // --- Background Starfield (Lensed) ---
            vec2 starUV = distortedUV * 15.0; // Scale for stars
            float starNoise = hash(floor(starUV));
            float stars = 0.0;
            if (starNoise > 0.97) {
                vec2 f = fract(starUV) - 0.5;
                float star = smoothstep(0.4, 0.0, length(f));
                // Twinkle
                star *= 0.8 + 0.2 * sin(uTime * uSpeed * 5.0 + starNoise * 100.0);
                stars += star;
            }
            
            // --- Accretion Disk ---
            // The disk should look like swirling gas.
            // We use FBM noise mapped to polar coordinates.
            
            // Rotate the disk over time - Slower, more majestic
            float rotation = uTime * uSpeed * 0.2;
            
            // Map to polar coordinates for the disk texture
            // We add the rotation to the angle
            vec2 diskUV = vec2(r * 3.0, angle * 2.0 + rotation + 10.0 / (r + 0.1)); 
            
            float gas = fbm(diskUV);
            
            // Add some turbulence - reduced frequency for smoothness
            gas += 0.3 * fbm(diskUV * 1.5 - vec2(uTime * uSpeed * 0.1, 0.0));
            
            // Define the disk shape
            float diskShape = smoothstep(accretionDiskInner - 0.1, accretionDiskInner, r) * 
                              smoothstep(accretionDiskOuter, accretionDiskOuter - 0.2, r);
            
            // Colorize the disk
            // Core is hotter (brighter/whiter), edges are cooler (redder/darker)
            vec3 diskColor = mix(uColor, vec3(1.0, 1.0, 0.8), gas * 1.5);
            diskColor *= gas * 2.0; // Intensity
            
            // Doppler beaming (simulated): One side is brighter (moving towards us)
            // Simple approximation using sin of angle
            float doppler = 1.0 + 0.3 * sin(angle); 
            diskColor *= doppler;
            
            // Apply disk shape and glow
            vec3 accretion = diskColor * diskShape * uGlow;

            // --- Photon Ring ---
            // A thin, bright ring just outside the event horizon
            float photonRing = smoothstep(eventHorizonRadius + 0.02, eventHorizonRadius, r) * 
                               smoothstep(eventHorizonRadius - 0.01, eventHorizonRadius, r);
            vec3 ringColor = vec3(1.0, 0.9, 0.8) * photonRing * 5.0 * uGlow;

            // --- Event Horizon (The Black Hole) ---
            float shadow = smoothstep(eventHorizonRadius + 0.01, eventHorizonRadius - 0.01, r);
            
            // Combine elements
            vec3 finalColor = vec3(stars) * 0.5; // Dim stars slightly
            finalColor += accretion;
            finalColor += ringColor;
            
            // Apply the black hole shadow (it blocks everything behind it)
            finalColor = mix(finalColor, vec3(0.0), shadow);

            // Tone mapping / Output
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};
