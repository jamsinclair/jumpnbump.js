import React, { useEffect, useState } from 'react';
import { LEVELS, RECOMMENDED_LEVELS } from './constants';
import { LevelItem } from './level-item';
import './level-selector.css';

const IMAGE_BASE_URL = '/levels/';

export function LevelSelector({
    close,
    selectedLevel,
    setSelectedLevel,
}: {
    close: () => void;
    selectedLevel: string;
    setSelectedLevel: (name: string) => void;
}) {
    const onSelection = (name: string) => {
        setSelectedLevel(name);
        close();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="level-selector">
            <button className="level-selector-close" onClick={close}>
                <svg viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M12 10.586L7.707 6.293a1 1 0 00-1.414 1.414L10.586 12l-4.293 4.293a1 1 0 101.414 1.414L12 13.414l4.293 4.293a1 1 0 001.414-1.414L13.414 12l4.293-4.293a1 1 0 00-1.414-1.414L12 10.586z"
                    ></path>
                </svg>
            </button>
            <h1>Recommended</h1>
            <ul>
                {RECOMMENDED_LEVELS.map((level) => (
                    <li key={level}>
                        <LevelItem
                            name={level}
                            imageSrc={`${IMAGE_BASE_URL}${level}.jpg`}
                            selected={level === selectedLevel}
                            onSelection={onSelection}
                        />
                    </li>
                ))}
            </ul>
            <h1>All</h1>
            <ul>
                {LEVELS.map((level) => (
                    <li key={level}>
                        <LevelItem
                            name={level}
                            imageSrc={`${IMAGE_BASE_URL}${level}.jpg`}
                            selected={level === selectedLevel}
                            onSelection={onSelection}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
