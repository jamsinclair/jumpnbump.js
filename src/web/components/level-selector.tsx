import React, { useEffect } from 'react';
import { LEVELS, RECOMMENDED_LEVELS } from '../constants';
import { LevelItem } from './level-item';
import './level-selector.css';
import { CloseIcon } from './close-icon';

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
            <button className="level-selector-close" onClick={close} aria-label="Close Level Selector">
                <CloseIcon />
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
