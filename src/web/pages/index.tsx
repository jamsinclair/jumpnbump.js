import React, { useState } from 'react';
import { Link } from 'preact-router/match';
import { LevelSelector } from '../components/level-selector';
import type { OptionalGameOptions } from '../../engine';
import { Game } from '../components/game';

import '../menu.css';
import { Header } from '../components/header';
import { LevelPreview } from '../components/level-preview';

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

export function IndexPage({ path }: { path: string }) {
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
                <LevelPreview level={selectedLevel} onClick={() => setShowLevelSelector(true)} />
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
                    <li>
                        <Link className="menu-button" href="/online-multiplayer">
                            Online Multiplayer
                        </Link>
                    </li>
                    <li>
                        <a
                            className="menu-button"
                            href="https://github.com/jamsinclair/jumpnbump.js#jump-n-bump-javascript"
                        >
                            About
                        </a>
                    </li>
                </ul>
                <GameOptions gameOptions={gameOptions} setGameOptions={setGameOptions} />
                <footer className="menu-footer">
                    <p>Jump 'n Bump is a game by Brainchild Design.</p>
                    <p>
                        The source code for this version of Jump 'n Bump is available on{' '}
                        <a href="https://github.com/jamsinclair/jumpnbump.js">GitHub</a>.
                    </p>
                </footer>
            </main>
            {showLevelSelector ? (
                <LevelSelector
                    selectedLevel={selectedLevel}
                    setSelectedLevel={onSetSelectedLevel}
                    close={() => setShowLevelSelector(false)}
                />
            ) : null}
        </>
    );
}
