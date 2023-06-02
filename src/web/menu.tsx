import React, { useEffect, useRef, useState } from 'react';
import { LevelSelector } from './level-selector';
import type { OptionalGameOptions } from '../engine';
import { Game } from './game';

import './menu.css';
import { GameInfoOverlay } from './game-info-overlay';

function Header() {
    const parallaxLayerRef = useRef<HTMLDivElement>(null);
    const parallaxIntensity = 8;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!parallaxLayerRef.current) {
                return;
            }
            const { clientX, clientY } = e;
            const { left, top, width, height } = parallaxLayerRef.current.getBoundingClientRect();
            const x = ((clientX - left) / width) * parallaxIntensity;
            const y = ((clientY - top) / height) * parallaxIntensity;
            parallaxLayerRef.current.style.setProperty('--x', x.toString());
            parallaxLayerRef.current.style.setProperty('--y', y.toString());
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [parallaxLayerRef]);

    return (
        <header className="menu-header">
            <div className="menu-logo-container">
                <div ref={parallaxLayerRef} className="menu-logo-parallax-layer">
                    <h1>Jump 'n Bump</h1>
                </div>
            </div>
        </header>
    );
}

function LevelPreview({ level }: { level: string }) {
    return (
        <div className="menu-level-preview">
            <img src={`/levels/${level}.jpg`} alt={`Preview of the level ${level}`} />
            <p>Level: {getLevelName(level)}</p>
        </div>
    );
}

function GameOptions({
    gameOptions,
    setGameOptions,
}: {
    gameOptions: OptionalGameOptions;
    setGameOptions: React.Dispatch<React.SetStateAction<OptionalGameOptions>>;
}) {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name === 'nosound' && checked) {
            setGameOptions((prev) => ({ ...prev, musicnosound: true }));
        }
        setGameOptions((prev) => ({ ...prev, [name]: checked }));
    };

    return (
        <ul className="menu-game-options">
            <li>
                <label>
                    <input type="checkbox" name="noflies" onChange={onChange} checked={gameOptions['noflies']} />
                    <span>No Flies</span>
                </label>
            </li>
            <li>
                <label>
                    <input
                        type="checkbox"
                        name="musicnosound"
                        onChange={onChange}
                        checked={gameOptions['musicnosound']}
                    />
                    <span>No Sound Effects</span>
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" name="nosound" onChange={onChange} checked={gameOptions['nosound']} />
                    <span>No Music and Sound Effects</span>
                </label>
            </li>
        </ul>
    );
}

const getLevelName = (level: string) => {
    if (level === 'jumpbump') {
        return 'jumpbump (original level)';
    }
    return level;
};

export function Menu() {
    const [selectedLevel, setSelectedLevel] = useState('jumpbump');
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [gameOptions, setGameOptions] = useState<OptionalGameOptions>({
        nosound: false,
        musicnosound: false,
        noflies: false,
    });

    if (isGameRunning) {
        return (
            <>
                <GameInfoOverlay />
                <Game level={selectedLevel} gameOptions={gameOptions} onExit={() => setIsGameRunning(false)} />
            </>
        );
    }

    const onSetSelectedLevel = (name: string) => {
        setSelectedLevel(name);
        setGameOptions((prev) => ({ ...prev, dat: undefined }));
    };

    const onCustomLevelLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files || !files.length) {
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const dat = e.target?.result;
            if (dat instanceof ArrayBuffer) {
                setSelectedLevel('custom-level');
                setGameOptions((prev) => ({ ...prev, dat }));
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <>
            <Header />
            <main className="menu-main">
                <LevelPreview level={selectedLevel} />
                <ul>
                    <li>
                        <button className="menu-button" onClick={() => setIsGameRunning(true)}>
                            Start Game
                        </button>
                    </li>
                    <li>
                        <button className="menu-button" onClick={() => setShowLevelSelector(true)}>
                            Change Level
                        </button>
                    </li>
                    <li>
                        <input
                            className="menu-custom-level-load-input"
                            id="custom-level"
                            type="file"
                            onChange={onCustomLevelLoad}
                        />
                        <label
                            className="menu-button"
                            htmlFor="custom-level"
                            title="Load a custom level from your computer. Jump 'n Bump levels usually have the .dat extension."
                        >
                            Load Custom Level
                        </label>
                    </li>
                </ul>
                <GameOptions gameOptions={gameOptions} setGameOptions={setGameOptions} />
            </main>
            {showLevelSelector ? (
                <LevelSelector
                    selectedLevel={selectedLevel}
                    setSelectedLevel={onSetSelectedLevel}
                    close={() => setShowLevelSelector(false)}
                />
            ) : null}
            <GameInfoOverlay />
        </>
    );
}
