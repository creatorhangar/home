import React, { useState, useRef, useCallback, useEffect } from 'react';

interface JoystickProps {
    offsetX: number;
    offsetY: number;
    onChange: (coords: { x: number, y: number }) => void;
    disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export const Joystick: React.FC<JoystickProps> = ({ offsetX, offsetY, onChange, disabled }) => {
    const padRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (disabled || !padRef.current) return;
        
        e.preventDefault();
        
        const rect = padRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const x = clamp(clientX - rect.left, 0, rect.width);
        const y = clamp(clientY - rect.top, 0, rect.height);

        const newOffsetX = Math.round(((x / rect.width) * 100) - 50);
        const newOffsetY = Math.round(((y / rect.height) * 100) - 50);

        onChange({ x: newOffsetX, y: newOffsetY });
    }, [disabled, onChange]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        setIsDragging(true);
        handleInteraction(e);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            // Create a synthetic event to reuse the handleInteraction logic
            const syntheticEvent = {
                preventDefault: () => e.preventDefault(),
                clientX: e.clientX,
                clientY: e.clientY,
            } as unknown as React.MouseEvent<HTMLDivElement>;
            handleInteraction(syntheticEvent);
        }
    }, [isDragging, handleInteraction]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    // Convert offset (-50 to 50) back to percentage (0 to 100) for positioning the handle
    const handleX = offsetX + 50;
    const handleY = offsetY + 50;

    return (
        <div 
            ref={padRef}
            onMouseDown={handleMouseDown}
            className={`relative w-full aspect-square bg-light-accent dark:bg-dark-bg rounded-lg border border-light-border dark:border-border-gray select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            role="slider"
            aria-valuemin={-50}
            aria-valuemax={50}
            aria-valuenow={offsetX}
            aria-label="Watermark X offset"
        >
            {/* Center lines */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-dark-gray/20 dark:bg-light-gray/20"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-dark-gray/20 dark:bg-light-gray/20"></div>

            <div
                className="absolute w-5 h-5 bg-primary-action rounded-full border-2 border-white dark:border-dark-card shadow-lg transition-transform duration-75"
                style={{
                    top: `${handleY}%`,
                    left: `${handleX}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            ></div>
        </div>
    );
};