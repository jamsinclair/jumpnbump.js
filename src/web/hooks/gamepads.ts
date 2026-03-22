import { useEffect } from 'preact/hooks';

import { useState } from 'preact/hooks';

const getConnectedGamepads = () => {
    return navigator.getGamepads().filter(Boolean) as Gamepad[];
};

export function useGamepads() {
    const [gamepads, setGamepads] = useState<Gamepad[]>(() =>
        typeof window !== 'undefined' ? getConnectedGamepads() : []
    );

    useEffect(() => {
        const handleGamepadConnected = () => {
            setGamepads(getConnectedGamepads());
        };

        const handleGamepadDisconnected = () => {
            setGamepads(getConnectedGamepads());
        };

        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
        };
    }, []);

    return gamepads;
}
