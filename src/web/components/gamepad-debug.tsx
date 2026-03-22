import { useEffect, useState } from 'preact/hooks';

type GamepadSnapshot = {
    id: string;
    index: number;
    mapping: string;
    buttonCount: number;
    pressedButtons: string[];
    axisCount: number;
    axes: number[];
};

function snapshot(gp: Gamepad): GamepadSnapshot {
    const pressedButtons = Array.from(gp.buttons)
        .map((b, i) => {
            if (b.pressed) return `[${i}]`;
            if (b.value > 0) return `(${i}:${b.value.toFixed(2)})`;
            return null;
        })
        .filter(Boolean) as string[];

    return {
        id: gp.id,
        index: gp.index,
        mapping: gp.mapping,
        buttonCount: gp.buttons.length,
        pressedButtons,
        axisCount: gp.axes.length,
        axes: Array.from(gp.axes),
    };
}

export function GamepadDebug() {
    const [snapshots, setSnapshots] = useState<GamepadSnapshot[]>([]);

    useEffect(() => {
        let frameId: number;

        const poll = () => {
            const gamepads = navigator.getGamepads();
            const next = Array.from(gamepads)
                .filter(Boolean)
                .map((gp) => snapshot(gp as Gamepad));
            setSnapshots(next);
            frameId = requestAnimationFrame(poll);
        };

        frameId = requestAnimationFrame(poll);
        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <div style="position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.85);color:#0f0;font-family:monospace;font-size:11px;padding:10px;z-index:99999;white-space:pre;pointer-events:none;">
            {snapshots.length === 0
                ? 'No gamepads detected. Press any button to activate.'
                : snapshots.map((gp) => (
                      <div key={gp.index}>
                          {`ID: ${gp.id}\nMapping: ${gp.mapping}\nButtons (${gp.buttonCount}): ${gp.pressedButtons.length ? gp.pressedButtons.join(' ') : 'none pressed'}\nAxes (${gp.axisCount}): [${gp.axes.map((v) => v.toFixed(3)).join(', ')}]`}
                      </div>
                  ))}
        </div>
    );
}
