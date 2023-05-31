import React, { useEffect, useRef, useState } from 'react';
import { Engine } from '../engine';
import type { OptionalGameOptions } from '../engine';

const BASE_LEVEL_URL = '/levels';

export function Game({
    level,
    gameOptions = {},
    onExit,
}: {
    level: string;
    gameOptions?: OptionalGameOptions;
    onExit: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [_engine, setEngine] = useState<Engine | null>(null);
    const [datFile, setDatFile] = useState<ArrayBuffer | null>(null);

    useEffect(() => {
        if (gameOptions.dat) {
            setDatFile(gameOptions.dat);
            return;
        }

        fetch(`${BASE_LEVEL_URL}/${level}.dat`)
            .then((res) => res.arrayBuffer())
            .then((dat) => {
                setDatFile(dat);
            });
    }, [level, gameOptions]);

    useEffect(() => {
        if (!canvasRef.current || !datFile) {
            return;
        }

        const engine = new Engine(canvasRef.current);
        setEngine(engine);
        engine.init({ ...gameOptions, dat: datFile });
        engine.run();
        engine.onExit(() => {
            console.log('exiting game');
            setEngine(null);
            setDatFile(null);
            onExit();
        });
    }, [datFile, setEngine, setDatFile]);

    return <canvas id="canvas" ref={canvasRef}></canvas>;
}
