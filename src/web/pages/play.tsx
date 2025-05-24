import { useState } from 'preact/hooks';
import { Card } from '../components/card';
import { Layout } from '../layout';
import { Level, LevelSelector } from '../components/level-selector';
import { OptionalGameOptions } from 'engine';
import { GameInfoOverlay } from '../components/game-info-overlay';
import { PageMeta, usePageMeta } from '../hooks/page-meta';
import { lazy } from 'preact-iso';

const playPageMeta: PageMeta = {
    title: "Play Jump 'n Bump Online - Free Browser Game",
    description:
        "Play the classic Jump 'n Bump game directly in your browser! Choose from 200+ levels, customize game options, and enjoy multiplayer bunny action with friends around one keyboard.",
    keywords: [
        "Jump 'n Bump",
        'browser game',
        'play online',
        'multiplayer game',
        'retro game',
        'brainchild design',
        'bunny game',
        'custom levels',
    ],
    ogImage: '/screenshot-large.jpg',
    ogDescription:
        "Play the classic multiplayer bunny game Jump 'n Bump directly in your browser! Gather friends around one keyboard and choose from over 200 levels.",
    ogTitle: "Play Jump 'n Bump Online - Free Browser Game",
    ogType: 'website',
    ogUrl: 'https://jumpnbump.net/',
    structuredData: {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: "Jump 'n Bump",
        description:
            "A classic multiplayer game where cute bunnies jump on each other's heads. Play directly in your browser with friends using one keyboard.",
        playMode: 'MultiPlayer',
        applicationCategory: 'Game',
        genre: 'Platformer',
        gamePlatform: 'Web Browser',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Brainchild Design',
        },
        author: [
            {
                '@type': 'Person',
                name: 'Mattias Brynervall',
                description: 'Code',
            },
            {
                '@type': 'Person',
                name: 'Andreas Brynervall',
                description: 'Graphics',
            },
            {
                '@type': 'Person',
                name: 'Martin Magnusson',
                description: 'Graphics',
            },
            {
                '@type': 'Person',
                name: 'Anders JG Nilsson',
                description: 'Music and Sound Effects',
            },
        ],
        contributor: {
            '@type': 'Person',
            name: 'Jamie Sinclair',
            description: 'JavaScript port',
        },
    },
};

function LevelPreview({ level }: { level: Level }) {
    return (
        <div>
            <img src={`/levels/${level.imageUrl}`} alt={`Preview of the level ${level.name}`} />
            <p className="text-sm md:text-xs font-bold py-1">{level.name}</p>
        </div>
    );
}

const Game = lazy(() => import('../components/game'));

export default function Play() {
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [gameOptions, setGameOptions] = useState<OptionalGameOptions>({
        noflies: false,
        nogore: false,
        nosound: false,
        musicnosound: false,
    });
    const [selectedLevel, setSelectedLevel] = useState<Level>({
        name: "Jump 'n Bump (Original)",
        datFile: 'jumpbump.dat',
        imageUrl: 'jumpbump.jpg',
    });

    const onCustomLevelLoad = (e: any) => {
        const { files } = e.target;
        if (!files || !files.length) {
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const dat = e.target?.result;
            if (dat instanceof ArrayBuffer) {
                setSelectedLevel({
                    name: `${file.name.split('.')[0]} (Custom Level)`,
                    datFile: file.name,
                    imageUrl: '/custom-level.jpg',
                    custom: true,
                });
                setGameOptions((prev) => ({ ...prev, dat }));
            }
        };
        reader.readAsArrayBuffer(file);
    };

    usePageMeta(playPageMeta);

    if (isGameRunning) {
        return (
            <div className="h-screen w-screen bg-black">
                <GameInfoOverlay />
                <Game
                    datFileName={selectedLevel.datFile}
                    gameOptions={gameOptions}
                    onExit={() => setIsGameRunning(false)}
                />
            </div>
        );
    }

    return (
        <Layout title="Play">
            <div className="flex flex-col w-full gap-2">
                <Card title="Jump 'n Bump" className="w-full md:w-86 flex-shrink-0 pb-3">
                    <p className="text-sm md:text-xs pt-3">
                        Play <span className="italic">Jump 'n Bump</span> right here in your web browser! This is a
                        loving port of the original game for the web. Gather your friends around the keyboard and let
                        the lagomorphic playful violence begin!
                    </p>
                    <p className="text-sm md:text-xs pt-3">
                        Start with the original level, or choose from over 200 levels available in the{' '}
                        <span className="italic">“Level”</span> section.
                    </p>
                    <p className="text-sm md:text-xs pt-3">
                        You can also choose to play with no music, sound effects, or gore. Don’t forget to discover the
                        hidden&nbsp;
                        <a className="text-brainchild-secondary font-bold" href="/secrets">
                            secrets
                        </a>
                        .
                    </p>
                </Card>
                <Card title="Controls" className="w-full md:w-86">
                    <p className="text-sm md:text-xs pt-3">
                        <span className="font-bold">Dott:</span> Use the arrow keys to move around.
                    </p>
                    <p className="text-sm md:text-xs pt-3">
                        <span className="font-bold">Jiffy:</span> Use the A,W,D keys to move around.
                    </p>
                    <p className="text-sm md:text-xs pt-3">
                        <span className="font-bold">Fizz:</span> Use the J,I,L keys to move around.
                    </p>
                    <p className="text-sm md:text-xs pt-3">
                        <span className="font-bold">Mijji:</span> Use the numpad arrow keys to move around.
                    </p>
                    <p className="text-sm md:text-xs pt-3">Additional controls:</p>
                    <ul className="list-disc list-inside text-sm md:text-xs">
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
                </Card>
            </div>
            <div className="flex flex-col w-full gap-2 pt-2 md:pt-0">
                <Card title="Play">
                    <button
                        className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-brainchild-tertiary focus:ring-offset-2"
                        onClick={() => setIsGameRunning(true)}
                    >
                        Start Game
                    </button>
                </Card>
                <Card title="Level">
                    <div className="flex flex-col gap-1">
                        <LevelPreview level={selectedLevel} />
                        <button
                            onClick={() => setShowLevelSelector(true)}
                            className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-brainchild-tertiary focus:ring-offset-2"
                        >
                            Change Level
                        </button>
                        <input
                            className="sr-only custom-level-upload-input"
                            id="custom-level"
                            type="file"
                            onChange={onCustomLevelLoad}
                        />
                        <label
                            htmlFor="custom-level"
                            title="Load a custom level from your computer. Jump 'n Bump levels usually have the .dat extension."
                            className="w-full mt-2 mx-auto block text-center bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase cursor-pointer"
                        >
                            Load Level File
                        </label>
                    </div>
                </Card>
                <Card title="Options">
                    <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={gameOptions.noflies}
                                onChange={(e: any) => setGameOptions({ ...gameOptions, noflies: e.target.checked })}
                            />
                            <span className="text-md md:text-sm">No Flies</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={gameOptions.nogore}
                                onChange={(e: any) => setGameOptions({ ...gameOptions, nogore: e.target.checked })}
                            />
                            <span className="text-md md:text-sm">No Gore</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={gameOptions.nosound || gameOptions.musicnosound}
                                onChange={(e: any) => setGameOptions({ ...gameOptions, nosound: e.target.checked })}
                                disabled={gameOptions.musicnosound}
                            />
                            <span className="text-md md:text-sm">No Sound Effects</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={gameOptions.musicnosound}
                                onChange={(e: any) =>
                                    setGameOptions({
                                        ...gameOptions,
                                        musicnosound: e.target.checked,
                                        nosound: e.target.checked ? true : gameOptions.nosound,
                                    })
                                }
                            />
                            <span className="text-md md:text-sm">No Music and Sound</span>
                        </label>
                    </div>
                </Card>
            </div>
            {showLevelSelector ? (
                <LevelSelector
                    close={() => setShowLevelSelector(false)}
                    selectedLevel={selectedLevel}
                    setSelectedLevel={(level: Level) => {
                        setGameOptions((prev) => ({ ...prev, dat: undefined }));
                        setSelectedLevel(level);
                    }}
                />
            ) : null}
        </Layout>
    );
}
