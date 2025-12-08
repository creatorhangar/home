import * as THREE from 'three';

export const EtherealCloudsShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#FFB6C1') }, // Pastel Pink
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

        // FBM Noise
        float random(in vec2 _st) {
            return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(in vec2 _st) {
            vec2 i = floor(_st);
            vec2 f = fract(_st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        #define NUM_OCTAVES 6

        float fbm(in vec2 _st) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
            for (int i = 0; i < NUM_OCTAVES; ++i) {
                v += a * noise(_st);
                _st = rot * _st * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;
            
            // Slow down time for clouds
            float t = uTime * uSpeed * 0.1;
            
            vec2 q = vec2(0.);
            q.x = fbm(uv + 0.00 * t);
            q.y = fbm(uv + vec2(1.0));

            vec2 r = vec2(0.);
            r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
            r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

            float f = fbm(uv + r);

            // Pastel Palette - Softer
            vec3 color = mix(vec3(0.95, 0.95, 1.0), // White
                             vec3(1.0, 0.8, 0.9), // Soft Pink
                             clamp((f*f)*3.0,0.0,1.0));

            color = mix(color,
                        vec3(0.7, 0.9, 1.0), // Soft Blue
                        clamp(length(q),0.0,1.0));

            color = mix(color,
                        uColor,
                        clamp(length(r.x),0.0,1.0));

            // Soft glow, less intense
            color *= uGlow * 1.0;
            
            // Add subtle white haze
            color += vec3(0.1);

            gl_FragColor = vec4(color, 1.0);
        }
    `
};
