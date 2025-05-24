import { useEffect, useRef, useState } from 'preact/hooks';
import { Engine } from '../../engine';
import type { GameState, OptionalGameOptions } from '../../engine';

const BASE_LEVEL_URL = '/levels';

export default function Game({
    datFileName,
    gameOptions = {},
    onExit,
}: {
    datFileName: string;
    gameOptions?: OptionalGameOptions;
    onExit: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [_engine, setEngine] = useState<Engine | null>(null);
    const [datFile, setDatFile] = useState<ArrayBuffer | null>(null);
    const [gameState, setGameState] = useState<GameState>('initial');

    useEffect(() => {
        if (gameOptions.dat) {
            setDatFile(gameOptions.dat);
            return;
        }

        fetch(`${BASE_LEVEL_URL}/${datFileName}`)
            .then((res) => res.arrayBuffer())
            .then((dat) => {
                setDatFile(dat);
            });
    }, [datFileName, gameOptions]);

    useEffect(() => {
        if (!canvasRef.current || !datFile) {
            return;
        }

        const engine = new Engine(canvasRef.current);
        setEngine(engine);
        engine.init({ ...gameOptions, dat: datFile });
        engine.onStateChange((state) => {
            setGameState(state);
        });
        engine.run();
        engine.onExit(() => {
            setEngine(null);
            setDatFile(null);
            onExit();
        });
    }, [datFile, setEngine, setDatFile]);

    return (
        <div className="h-screen w-screen bg-black">
            {gameState === 'initial' && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="text-white text-center text-2xl font-bold mt-2">Loading...</div>
                </div>
            )}
            <canvas
                id="canvas"
                className={`game-canvas ${gameState === 'initial' ? 'game-canvas-loading' : ''}`}
                ref={canvasRef}
            ></canvas>
        </div>
    );
}
