import * as THREE from 'three';

export const SacredMandalaShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#FFD700') }, // Gold
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

        // Rotation matrix
        mat2 rot(float a) {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }

        // Palette function for coloring
        vec3 palette(float t) {
            vec3 a = vec3(0.5, 0.5, 0.5);
            vec3 b = vec3(0.5, 0.5, 0.5);
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec3 d = vec3(0.263, 0.416, 0.557);
            return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;
            vec2 uv0 = uv;
            
            vec3 finalColor = vec3(0.0);
            
            for (float i = 0.0; i < 4.0; i++) {
                uv = fract(uv * 1.5) - 0.5;

                float d = length(uv) * exp(-length(uv0));

                vec3 col = palette(length(uv0) + i * 0.4 + uTime * uSpeed * 0.2);

                // Breathing effect - slower and deeper
                d = sin(d * 8.0 + uTime * uSpeed * 0.5) / 8.0;
                d = abs(d);

                d = pow(0.01 / d, 1.2);

                finalColor += col * d;
            }
            
            // Apply user color tint and glow
            finalColor *= uColor * uGlow;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};
