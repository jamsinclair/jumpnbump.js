import React from 'react';

import './level-preview.css';

const getLevelName = (level: string) => {
    if (level === 'jumpbump') {
        return 'jumpbump (original level)';
    }
    return level;
};

export function LevelPreview({ level, onClick }: { level: string; onClick: () => void }) {
    return (
        <div className="level-preview" onClick={onClick}>
            <img src={`/levels/${level}.jpg`} alt={`Preview of the level ${level}`} />
            <p>Level: {getLevelName(level)}</p>
        </div>
    );
}
