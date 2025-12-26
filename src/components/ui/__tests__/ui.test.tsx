import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ScreenFlash, KillStreakNotification, VirtualJoystick } from '../index';

describe('UI Components', () => {
    describe('ScreenFlash', () => {
        it('should render when active', () => {
            const { container } = render(<ScreenFlash active={true} />);
            expect(container.firstChild).not.toBeNull();
        });

        it('should not render when inactive', () => {
            const { container } = render(<ScreenFlash active={false} />);
            expect(container.firstChild).toBeNull();
        });

        it('should call onComplete after duration', () => {
            vi.useFakeTimers();
            const onComplete = vi.fn();
            render(<ScreenFlash active={true} duration={100} onComplete={onComplete} />);
            
            act(() => {
                vi.advanceTimersByTime(100);
            });
            
            expect(onComplete).toHaveBeenCalled();
            vi.useRealTimers();
        });
    });

    describe('KillStreakNotification', () => {
        it('should render for streak >= 2', () => {
            render(<KillStreakNotification streak={2} />);
            expect(screen.getByText('DOUBLE KILL')).toBeDefined();
            expect(screen.getByText('2 KILLS')).toBeDefined();
        });

        it('should not render for streak < 2', () => {
            const { container } = render(<KillStreakNotification streak={1} />);
            expect(container.firstChild).toBeNull();
        });

        it('should show correct name for higher streaks', () => {
            render(<KillStreakNotification streak={7} />);
            expect(screen.getByText('MONSTER KILL')).toBeDefined();
        });
    });

    describe('VirtualJoystick', () => {
        it('should render the control area', () => {
            const { container } = render(<VirtualJoystick />);
            // The first div is the fixed container
            expect(container.firstChild).not.toBeNull();
        });
    });
});
