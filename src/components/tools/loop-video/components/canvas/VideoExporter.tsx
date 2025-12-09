import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import * as Muxer from 'mp4-muxer';

export const VideoExporter = () => {
    const { gl, scene, camera } = useThree();
    const isExporting = useStore((state) => state.isExporting);
    const setIsExporting = useStore((state) => state.setIsExporting);
    const setExportProgress = useStore((state) => state.setExportProgress);
    const setExportTime = useStore((state) => state.setExportTime);
    const loopDuration = useStore((state) => state.loopDuration);

    const muxerRef = useRef<any>(null);
    const videoEncoderRef = useRef<VideoEncoder>(null);
    const frameCountRef = useRef(0);
    const totalFramesRef = useRef(0);

    // Configuration
    const FPS = 60;

    useEffect(() => {
        if (isExporting) {
            // Start Export
            const totalFrames = loopDuration * FPS;
            totalFramesRef.current = totalFrames;
            frameCountRef.current = 0;

            // Initialize Muxer
            muxerRef.current = new Muxer.Muxer({
                target: new Muxer.ArrayBufferTarget(),
                video: {
                    codec: 'avc',
                    width: gl.domElement.width,
                    height: gl.domElement.height
                },
                fastStart: 'in-memory'
            });

            // Initialize VideoEncoder
            videoEncoderRef.current = new VideoEncoder({
                output: (chunk, meta) => muxerRef.current.addVideoChunk(chunk, meta),
                error: (e) => console.error(e)
            });

            videoEncoderRef.current.configure({
                codec: 'avc1.42001f',
                width: gl.domElement.width,
                height: gl.domElement.height,
                bitrate: 10_000_000, // 10 Mbps
                framerate: FPS
            });

            console.log('Starting export...', totalFrames, 'frames');
        } else {
            // Cleanup if stopped externally
            if (videoEncoderRef.current) {
                // videoEncoderRef.current.close(); // Optional, might throw if already closed
            }
        }
    }, [isExporting, loopDuration, gl]);

    useFrame(() => {
        if (!isExporting || !muxerRef.current || !videoEncoderRef.current) return;

        if (frameCountRef.current < totalFramesRef.current) {
            // 1. Update Time
            const t = frameCountRef.current / FPS;
            setExportTime(t);

            // 2. Render (Implicitly handled by R3F, but we need to ensure uniforms are updated)
            // Since we updated store, ShaderCanvas should pick it up in its useFrame.
            // However, useFrame order matters. We want to capture AFTER render.
            // R3F renders automatically. We need to capture the PREVIOUS frame or force render?

            // Actually, best way is to force render here to be sure.
            gl.render(scene, camera);

            // 3. Capture Frame
            const frame = new VideoFrame(gl.domElement, {
                timestamp: frameCountRef.current * (1000000 / FPS) // microseconds
            });

            videoEncoderRef.current.encode(frame, { keyFrame: frameCountRef.current % 60 === 0 });
            frame.close();

            // 4. Update Progress
            setExportProgress((frameCountRef.current / totalFramesRef.current) * 100);

            frameCountRef.current++;
        } else {
            // Finish
            finishExport();
        }
    });

    const finishExport = async () => {
        console.log('Export finished, finalizing...');
        if (videoEncoderRef.current && muxerRef.current) {
            await videoEncoderRef.current.flush();
            muxerRef.current.finalize();

            const { buffer } = muxerRef.current.target;
            const blob = new Blob([buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ethereal-loop-${Date.now()}.mp4`;
            a.click();

            setIsExporting(false);
            setExportProgress(0);
            setExportTime(0);
        }
    };

    return null;
};
