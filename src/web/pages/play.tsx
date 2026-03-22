import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { Card } from '../components/card';
import { Layout } from '../layout';
import { Level, LevelSelector } from '../components/level-selector';
import { OptionalGameOptions } from 'engine';
import { GameInfoOverlay } from '../components/game-info-overlay';
import { PageMeta, usePageMeta } from '../hooks/page-meta';
import { lazy } from 'preact-iso';
import { Controls } from '../components/controls';
import { DEFAULT_CONTROLS } from '../../constants';
import type { GameInputDevice } from '../../inputs';

const DEBUG_GAMEPAD = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
const GamepadDebug: (() => JSX.Element) | null = DEBUG_GAMEPAD
    ? (lazy(() =>
          import('../components/gamepad-debug').then((m) => ({ default: m.GamepadDebug }))
      ) as unknown as () => JSX.Element)
    : null;

const playPageMeta: PageMeta = {
    title: "Play Jump 'n Bump Online - Free Browser Game",
    description:
        "Play Jump 'n Bump in your browser with keyboard or gamepad! Choose from 200+ levels and enjoy multiplayer bunny action with controller support.",
    keywords: [
        "Jump 'n Bump",
        'browser game',
        'play online',
        'multiplayer game',
        'retro game',
        'brainchild design',
        'bunny game',
        'custom levels',
        'gamepad support',
        'controller support',
    ],
    ogImage: 'https://jumpnbump.net/jump-og.jpg',
    ogDescription:
        "Play Jump 'n Bump in your browser with keyboard or gamepad! Gather friends and choose from over 200 levels. Full controller support.",
    ogTitle: "Play Jump 'n Bump Online - Free Browser Game",
    ogType: 'website',
    ogUrl: 'https://jumpnbump.net/',
    canonical: 'https://jumpnbump.net/',
    structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'VideoGame',
                url: 'https://jumpnbump.net/',
                name: "Jump 'n Bump",
                description:
                    "A classic multiplayer game where cute bunnies jump on each other's heads. Play in your browser with keyboard or gamepad controller support.",
                playMode: 'MultiPlayer',
                applicationCategory: 'Game',
                genre: 'Platformer',
                gamePlatform: 'Web Browser',
                operatingSystem: ['Windows', 'macOS', 'Linux', 'Chrome OS', 'Android'],
                accessibilityFeature: ['alternativeInput'],
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
                        jobTitle: 'Programmer',
                    },
                    {
                        '@type': 'Person',
                        name: 'Andreas Brynervall',
                        jobTitle: 'Graphic Designer',
                    },
                    {
                        '@type': 'Person',
                        name: 'Martin Magnusson',
                        jobTitle: 'Graphic Designer',
                    },
                    {
                        '@type': 'Person',
                        name: 'Anders JG Nilsson',
                        jobTitle: 'Composer & Sound Designer',
                    },
                ],
                contributor: {
                    '@type': 'Person',
                    name: 'Jamie Sinclair',
                    jobTitle: 'JavaScript Developer',
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Play', item: 'https://jumpnbump.net/' }],
            },
        ],
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
    const [hasControlsError, setHasControlsError] = useState(false);
    const [gameOptions, setGameOptions] = useState<OptionalGameOptions>({
        noflies: false,
        nogore: false,
        nosound: false,
        musicnosound: false,
        controls: DEFAULT_CONTROLS,
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

    const [savedControlState, setSavedControlState] = useState<{
        playerControlIds: Record<string, string>;
        gamepadConfigs: Record<string, string[]>;
    }>({ playerControlIds: {}, gamepadConfigs: {} });

    const onControlsChange = (controls: GameInputDevice[], errors: string[]) => {
        setGameOptions((prev) => ({ ...prev, controls }));
        setHasControlsError(errors.length > 0);
    };

    const onControlsStateChange = (
        playerControlIds: Record<string, string>,
        gamepadConfigs: Record<string, string[]>
    ) => {
        setSavedControlState({ playerControlIds, gamepadConfigs });
    };

    const [showBanner, setShowBanner] = useState(
        () => typeof window === 'undefined' || localStorage.getItem('hideBanner') !== 'true'
    );

    const dismissBanner = () => {
        localStorage.setItem('hideBanner', 'true');
        setShowBanner(false);
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

    const prefersReducedMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const banner = showBanner ? (
        <div
            className="group relative w-full border-t-1 border-b-1 border-black bg-brainchild-secondary text-white font-bold text-sm overflow-hidden py-0.5 cursor-pointer select-none"
            onClick={dismissBanner}
        >
            {prefersReducedMotion ? (
                <p className="text-center">★ NEW! Gamepad &amp; Controller Support Added! ★</p>
            ) : (
                <div className="overflow-hidden whitespace-nowrap">
                    <span className="inline-block animate-marquee">
                        ★ NEW! Gamepad &amp; Controller Support Added! ★ Plug in your controller, press a button, and
                        start playing! &nbsp;&nbsp;&nbsp;★ NEW! Gamepad &amp; Controller Support Added! ★ Plug in your
                        controller, press a button, and start playing! &nbsp;&nbsp;&nbsp;
                    </span>
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-brainchild-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ✕ Dismiss
            </div>
        </div>
    ) : null;

    return (
        <Layout title="Play" banner={banner}>
            {GamepadDebug && <GamepadDebug />}
            <div className="flex flex-col w-full gap-2">
                <Card title="Jump 'n Bump" className="w-full md:w-86 flex-shrink-0 pb-3">
                    <p className="text-sm md:text-xs pt-3">
                        Play <span className="italic">Jump 'n Bump</span> right here in your web browser! This is a
                        loving port of the{' '}
                        <a className="text-brainchild-secondary font-bold" href="/about">
                            original 1998 game by Brainchild Design
                        </a>
                        . Gather your friends around the keyboard or gamepad and let the lagomorphic playful violence
                        begin!
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
                <Card title="How to Play" className="w-full md:w-86">
                    <p className="text-sm md:text-xs pt-3">
                        Jump on the other bunnies' heads to score points. Use left and right to move and up to jump.
                        Assign each player a keyboard or gamepad below.
                    </p>
                    <Controls
                        onControlsChange={onControlsChange}
                        defaultPlayerControlIds={savedControlState.playerControlIds}
                        defaultGamepadConfigs={savedControlState.gamepadConfigs}
                        onStateChange={onControlsStateChange}
                    />
                    <p className="text-sm md:text-xs pt-3">
                        Connect a gamepad via USB or Bluetooth, press a button on it, and it will appear in the
                        dropdowns above.
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
                        className="w-full mt-2 mx-auto block bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-brainchild-tertiary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setIsGameRunning(true)}
                        disabled={hasControlsError}
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
                <Card title="Game Info">
                    <ul className="text-sm md:text-xs pt-3 space-y-1">
                        <li>
                            <span className="font-bold">Year:</span> 1998
                        </li>
                        <li>
                            <span className="font-bold">Developer:</span> Brainchild Design
                        </li>
                        <li>
                            <span className="font-bold">Genre:</span> Platformer
                        </li>
                        <li>
                            <span className="font-bold">Players:</span> 1–4
                        </li>
                        <li>
                            <span className="font-bold">Input:</span> Keyboard, Gamepad
                        </li>
                        <li>
                            <span className="font-bold">Platform:</span> Web Browser
                        </li>
                    </ul>
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
