import * as THREE from 'three';

export const PsyKaleidoscopeShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#00FF88') },
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

            vec3 a = vec3(0.5, 0.5, 0.5);
            vec3 b = vec3(0.5, 0.5, 0.5);
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec3 d = vec3(0.263, 0.416, 0.557); // Original
            // More vibrant option:
            // vec3 d = vec3(0.0, 0.33, 0.67); 
            return a + b * cos(6.28318 * (c * t + d));

        void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;
            
            vec2 uv0 = uv;
            vec3 finalColor = vec3(0.0);
            
            // Tame Impala / Oil on Water effect
            for (float i = 0.0; i < 3.0; i++) {
                uv = fract(uv * 1.5) - 0.5;

                float d = length(uv) * exp(-length(uv0));

                vec3 col = palette(length(uv0) + i * 0.4 + uTime * uSpeed * 0.4);

                d = sin(d * 8.0 + uTime * uSpeed) / 8.0;
                d = abs(d);

                d = pow(0.01 / d, 1.2);

                finalColor += col * d;
            }
            
            // Kaleidoscope symmetry
            float angle = atan(uv0.y, uv0.x);
            float radius = length(uv0);
            float symmetry = 6.0;
            angle = mod(angle, PI * 2.0 / symmetry);
            angle = abs(angle - PI / symmetry);
            vec2 symUV = vec2(cos(angle), sin(angle)) * radius;
            
            // Mix original pattern with symmetry
            finalColor += palette(length(symUV) + uTime * uSpeed) * 0.5;
            
            // Apply user color tint and glow
            finalColor = mix(finalColor, uColor, 0.3) * uGlow;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};
