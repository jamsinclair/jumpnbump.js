import React from 'react';
import './level-item.css';

export function LevelItem({
    name,
    imageSrc,
    selected,
    onSelection,
}: {
    name: string;
    imageSrc: string;
    selected: boolean;
    onSelection: (name: string) => void;
}) {
    const selectedClass = selected ? ' selected' : '';
    return (
        <button className={`level-item${selectedClass}`} onClick={() => onSelection(name)}>
            <img src={imageSrc} alt={name} loading="lazy" />
            {name}
        </button>
    );
}
