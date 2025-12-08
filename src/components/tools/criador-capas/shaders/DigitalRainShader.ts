import * as THREE from 'three';

export const DigitalRainShader = {
    uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uColor: { value: new THREE.Color('#00FF00') }, // Matrix Green
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

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vUv;
            uv.x *= uResolution.x / uResolution.y;
            
            // Grid
            vec2 grid = vec2(50.0, 20.0); // Columns, Rows
            vec2 ipos = floor(uv * grid);
            vec2 fpos = fract(uv * grid);
            
            // Rain speed
            float t = uTime * uSpeed * 5.0;
            float speed = random(vec2(ipos.x, 0.0)) * 0.5 + 0.5;
            float y = mod(ipos.y + t * speed, grid.y);
            
            // Character trail
            float trail = 1.0 - y / grid.y;
            trail = smoothstep(0.0, 1.0, trail);
            
            // Random characters (simulated by noise)
            float char = random(ipos + floor(t * 2.0));
            float charShape = step(0.5, char); // Simple on/off for now
            
            // Head of the trail (brightest)
            float head = step(grid.y - 1.0, y);
            
            vec3 color = uColor * trail * charShape;
            
            // Make head white
            color += vec3(1.0) * head * charShape;
            
            // Glow
            color *= uGlow;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};
