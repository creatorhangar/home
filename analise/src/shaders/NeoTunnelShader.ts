import * as THREE from 'three';

export const NeoTunnelShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#00F5FF') },
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

        // Raymarching primitives
        float sdTorus(vec3 p, vec2 t) {
            vec2 q = vec2(length(p.xz) - t.x, p.y);
            return length(q) - t.y;
        }

        // Scene mapping
        float map(vec3 p) {
            // Twist - softer
            float twist = sin(p.z * 0.1 + uTime * uSpeed * 0.5) * 0.25;
            float c = cos(twist);
            float s = sin(twist);
            mat2 m = mat2(c, -s, s, c);
            p.xy = m * p.xy;

            // Repetition
            vec3 q = p;
            q.z = mod(p.z + uTime * 2.0 * uSpeed, 10.0) - 5.0;

            return sdTorus(q, vec2(2.0, 0.2));
        }

        void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;

            vec3 ro = vec3(0.0, 0.0, -5.0); // Ray origin
            vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

            float t = 0.0;
            float d = 0.0;
            int steps = 0;

            // Raymarching loop
            for(int i = 0; i < 64; i++) {
                vec3 p = ro + rd * t;
                d = map(p);
                if(d < 0.001 || t > 100.0) break;
                t += d;
                steps = i;
            }

            // Glow calculation based on steps/distance
            float glow = 1.0 - float(steps) / 64.0;
            glow = pow(glow, 2.0) * uGlow;

            vec3 col = uColor * glow;

            // Fog
            col = mix(col, vec3(0.0), 1.0 - exp(-0.05 * t));

            gl_FragColor = vec4(col, 1.0);
        }
    `
};
