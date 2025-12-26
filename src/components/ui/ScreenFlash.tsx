import React, { useEffect, useState } from 'react';

export interface ScreenFlashProps {
    /** Whether the flash is currently active. */
    active?: boolean;
    /** Duration of the flash in milliseconds. Default: 150. */
    duration?: number;
    /** Color of the flash. Default: 'rgba(255, 0, 0, 0.3)'. */
    color?: string;
    /** Called when the flash completes. */
    onComplete?: () => void;
}

/**
 * A generalized screen flash effect for damage or other notifications.
 *
 * @category UI
 */
export function ScreenFlash({
    active = false,
    duration = 150,
    color = 'rgba(255, 0, 0, 0.3)',
    onComplete,
}: ScreenFlashProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: color,
                pointerEvents: 'none',
                zIndex: 9999,
                transition: `opacity ${duration / 2}ms ease-out`,
            }}
        />
    );
}
