import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '../components/ThreeCanvas';
import type { VideoTemplateProps } from '../types';
import { loadTextures } from '../utils/threeHelpers';

export const ParallaxDrift: React.FC<VideoTemplateProps> = ({
    images,
    isPlaying,
    currentTime,
    duration,
    canvasRef,
    width = 1080,
    height = 1080
}) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleInit = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
        let textures = await loadTextures(images);

        if (textures.length === 0) {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 512, 512); }
            textures = [new THREE.CanvasTexture(canvas)];
        }

        setIsLoaded(true);

        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        // Create layers
        // Layer 0: Background (furthest)
        if (textures[0]) {
            const geo = new THREE.PlaneGeometry(4, 4);
            const mat = new THREE.MeshBasicMaterial({ map: textures[0], transparent: true, opacity: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = -2;
            group.add(mesh);
        }

        // Layer 1: Middle
        if (textures[1]) {
            const geo = new THREE.PlaneGeometry(1.5, 1.5);
            const mat = new THREE.MeshBasicMaterial({ map: textures[1] });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = 0;
            mesh.position.x = -0.5;
            mesh.rotation.z = 0.1;
            group.add(mesh);
        }

        // Layer 2: Front
        if (textures[2]) {
            const geo = new THREE.PlaneGeometry(1.2, 1.2);
            const mat = new THREE.MeshBasicMaterial({ map: textures[2] });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = 1;
            mesh.position.x = 0.5;
            mesh.position.y = -0.5;
            mesh.rotation.z = -0.1;
            group.add(mesh);
        }

        // Particles
        const particleGeo = new THREE.BufferGeometry();
        const count = 50;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
        const particles = new THREE.Points(particleGeo, particleMat);
        group.add(particles);
    };

    const handleAnimate = (time: number, deltaTime: number) => {
        if (!groupRef.current) return;

        const effectiveTime = currentTime !== undefined ? currentTime : time;

        // Parallax movement based on time
        // Move camera or group

        // Rotate group slightly
        groupRef.current.rotation.y = Math.sin(effectiveTime * 0.2) * 0.1;
        groupRef.current.rotation.x = Math.cos(effectiveTime * 0.15) * 0.05;

        // Move layers independently (simulated by accessing children)
        const children = groupRef.current.children;

        if (children[0]) { // BG
            children[0].position.x = Math.sin(effectiveTime * 0.1) * 0.2;
        }
        if (children[1]) { // Middle
            children[1].position.y = Math.cos(effectiveTime * 0.3) * 0.1;
        }
        if (children[2]) { // Front
            children[2].position.x = 0.5 + Math.sin(effectiveTime * 0.4) * 0.1;
        }

        // Particles rotation
        if (children[3]) {
            children[3].rotation.y = effectiveTime * 0.1;
        }
    };

    return (
        <div className="relative w-full h-full bg-stone-900">
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-white">Loading Parallax...</div>}
            <ThreeCanvas
                onInit={handleInit}
                onAnimate={handleAnimate}
                canvasRef={canvasRef}
                width={width}
                height={height}
                className="w-full h-full"
            />
        </div>
    );
};
