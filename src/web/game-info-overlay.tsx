import React, { useEffect } from 'react';
import './game-info-overlay.css';
import { CloseIcon } from './close-icon';

const shortcuts = [
    {
        keys: '? (SHIFT + /)',
        description: 'Toggles this overlay',
    },
    {
        keys: 'ESC',
        description:
            'Exits the current phase. Exiting from the in-game menu will bring you back to the level selection screen.',
    },
    {
        keys: 'F (SHIFT + f)',
        description: 'Toggle fullscreen',
    },
];

const controls = [
    {
        keys: '←, ↑, →',
        description: 'To steer Dot',
    },
    {
        keys: 'A, W, D',
        description: 'To steer Jiffy',
    },
    {
        keys: 'J, I, L',
        description: 'To steer Fizz',
    },
    {
        keys: '4, 8, 6',
        description: 'To steer Mijji (on the numeric pad)',
    },
];

const toggleAi = [
    {
        keys: '1',
        description: 'Toggle ai for Dot',
    },
    {
        keys: '2',
        description: 'Toggle ai for Jiffy',
    },
    {
        keys: '3',
        description: 'Toggle ai for Fizz',
    },
    {
        keys: '4',
        description: 'Toggle ai for Mijji',
    },
];

export function GameInfoOverlay() {
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const dismissDialog = () => {
        if (dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close();
        }
    };

    const toggleDialog = (e?: unknown) => {
        if (e instanceof KeyboardEvent && e.key !== 'enter') return;

        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        } else if (dialogRef.current) {
            dialogRef.current.close();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismissDialog();
            if (e.key === '?') toggleDialog();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [dialogRef]);

    return (
        <>
            <dialog className="game-info-overlay" ref={dialogRef}>
                <h2>General</h2>
                <table>
                    <tbody>
                        {shortcuts.map(({ keys, description }) => (
                            <tr key={keys}>
                                <td>{description}</td>
                                <td>{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2>Controls</h2>
                <table>
                    <tbody>
                        {controls.map(({ keys, description }) => (
                            <tr key={keys}>
                                <td>{description}</td>
                                <td>{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2>Toggle AI Players (when game is in progress)</h2>
                <table>
                    <tbody>
                        {toggleAi.map(({ keys, description }) => (
                            <tr key={keys}>
                                <td>{description}</td>
                                <td>{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    className="game-info-overlay-close"
                    onClick={dismissDialog}
                    onKeyDown={dismissDialog}
                    aria-label="Close Controls & Shortcuts Overlay"
                >
                    <CloseIcon />
                </button>
            </dialog>
            <button
                className="game-info-overlay-toggle"
                aria-label="Toggle Controls & Shortcuts Overlay"
                onClick={toggleDialog}
                onKeyDown={toggleDialog}
            >
                ?
            </button>
        </>
    );
}
