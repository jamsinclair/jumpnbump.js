import { useState } from 'preact/hooks';
import { Card } from '../card';
import { Layout } from '../layout';
import { LevelSelector } from '../level-selector';

function LevelPreview({ level }: { level: string }) {
    const name = level === 'jumpbump' ? 'Original' : level;

    return (
        <div>
            <img src={`/levels/${level}.jpg`} alt={`Preview of the level ${level}`} />
            <p className="text-xs font-bold py-1">{name}</p>
        </div>
    );
}

export default function Play() {
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState('jumpbump');

    return (
        <Layout title="Play">
            <div className="flex flex-col w-full gap-2">
                <Card title="Jump 'n Bump" className="w-86 flex-shrink-0 pb-3">
                    <p className="text-xs pt-3">
                        Play <span className="italic">Jump 'n Bump</span> right here in your web browser! This is a
                        loving port of the original game for the web. Gather your friends around the keyboard and let
                        the lagomorphic playful violence begin!
                    </p>
                    <p className="text-xs pt-3">
                        Start with the original level, or choose from the many levels available in the{' '}
                        <span className="italic">“Choose Level”</span> section.
                    </p>
                    <p className="text-xs pt-3">
                        You can also choose to play with no music, sound effects, or gore. Don’t forget to discover the
                        hidden&nbsp;
                        <a className="text-brainchild-secondary font-bold" href="/secrets">
                            secrets
                        </a>
                        .
                    </p>
                </Card>
                <Card title="Controls">
                    <p className="text-xs pt-3">
                        <span className="font-bold">Dott:</span> Use the arrow keys to move around.
                    </p>
                    <p className="text-xs pt-3">
                        <span className="font-bold">Jiffy:</span> Use the A,W,D keys to move around.
                    </p>
                    <p className="text-xs pt-3">
                        <span className="font-bold">Fizz:</span> Use the J,I,L keys to move around.
                    </p>
                    <p className="text-xs pt-3">
                        <span className="font-bold">Mijji:</span> Use the numpad arrow keys to move around.
                    </p>
                    <p className="text-xs pt-3">
                        Additional controls:
                        <ul className="list-disc list-inside">
                            <li>
                                <span className="font-bold">ESC:</span> End the game. Press it again to exit the game.
                            </li>
                            <li>
                                <span className="font-bold">SHIFT + F:</span> to toggle fullscreen.
                            </li>
                            <li>
                                <span className="font-bold">1-4:</span> Toggle AI for the player number.
                            </li>
                        </ul>
                    </p>
                </Card>
            </div>
            <div className="flex flex-col w-full gap-2">
                <Card title="Play">
                    <button className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-sm font-bold uppercase">
                        Start Game
                    </button>
                </Card>
                <Card title="Choose Level">
                    <div className="flex flex-col gap-1">
                        <LevelPreview level={selectedLevel} />
                        <button
                            onClick={() => setShowLevelSelector(true)}
                            className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-sm font-bold uppercase"
                        >
                            Change Level
                        </button>
                        <button className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-sm font-bold uppercase">
                            Load Level
                        </button>
                    </div>
                </Card>
                <Card title="Options">
                    <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">No Flies</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">No Gore</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">No Sound Effects</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">No Music and Sound</span>
                        </label>
                    </div>
                </Card>
            </div>
            {showLevelSelector ? (
                <LevelSelector
                    close={() => setShowLevelSelector(false)}
                    selectedLevel={selectedLevel}
                    setSelectedLevel={setSelectedLevel}
                />
            ) : null}
        </Layout>
    );
}
