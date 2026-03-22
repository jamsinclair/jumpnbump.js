import { useState, useEffect } from 'preact/hooks';
import { Card } from './card';

type ConfigPhase = 'left' | 'right' | 'jump' | 'confirm';

type ConfigureControllerProps = {
    gamepad: Gamepad;
    onComplete: (mappings: string[]) => void;
    onCancel: () => void;
};

export function ConfigureController({ gamepad, onComplete, onCancel }: ConfigureControllerProps) {
    const [phase, setPhase] = useState<ConfigPhase>('left');
    const [mappings, setMappings] = useState<string[]>(['', '', '']);
    const [listening, setListening] = useState(true);
    const [detectedButton, setDetectedButton] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(false);

    // Snapshot axis resting values on mount so we only detect deliberate movement
    const [axisBaseline] = useState<number[]>(() => {
        const gp = navigator.getGamepads()[gamepad.index];
        return gp ? Array.from(gp.axes) : [];
    });

    const phaseLabels: Record<ConfigPhase, string> = {
        left: 'Move Left',
        right: 'Move Right',
        jump: 'Jump',
        confirm: 'Confirm Configuration',
    };

    const phaseDescriptions: Record<ConfigPhase, string> = {
        left: 'Press the button you want to use to move left',
        right: 'Press the button you want to use to move right',
        jump: 'Press the button you want to use to jump',
        confirm: 'Review your controller configuration',
    };

    const phaseIndex = ['left', 'right', 'jump', 'confirm'].indexOf(phase);

    // Listen for gamepad button presses
    useEffect(() => {
        if (!listening || phase === 'confirm' || cooldown) return;

        let frameId: number;
        let lastPressedButton: string | null = null;

        const checkButtons = () => {
            const freshGamepad = navigator.getGamepads()[gamepad.index];
            if (!freshGamepad) return;

            // Check for button presses
            for (let i = 0; i < freshGamepad.buttons.length; i++) {
                if (freshGamepad.buttons[i].pressed && freshGamepad.buttons[i].value > 0.5) {
                    const buttonId = `button_${i}`;

                    // Prevent duplicate detection of the same press
                    if (buttonId !== lastPressedButton) {
                        // Skip if this button is already assigned to another action
                        if (mappings.includes(buttonId)) {
                            lastPressedButton = buttonId;
                            continue;
                        }

                        lastPressedButton = buttonId;
                        setDetectedButton(buttonId);
                        setListening(false);
                        setCooldown(true);

                        const newMappings = [...mappings];
                        if (phase === 'left') newMappings[0] = buttonId;
                        if (phase === 'right') newMappings[1] = buttonId;
                        if (phase === 'jump') newMappings[2] = buttonId;

                        setMappings(newMappings);

                        // Move to next phase after a short delay
                        setTimeout(() => {
                            if (phase === 'left') setPhase('right');
                            else if (phase === 'right') setPhase('jump');
                            else if (phase === 'jump') setPhase('confirm');

                            setDetectedButton(null);
                            setListening(true);

                            // Add a cooldown to prevent accidental inputs
                            setTimeout(() => {
                                setCooldown(false);
                            }, 500);
                        }, 1000);

                        return;
                    }
                } else if (lastPressedButton === `button_${i}`) {
                    // Button was released
                    lastPressedButton = null;
                }
            }

            // Check for axis movement (for analog sticks)
            for (let i = 0; i < freshGamepad.axes.length; i++) {
                const value = freshGamepad.axes[i];
                const baseline = axisBaseline[i] ?? 0;
                // Detect movement relative to resting position to handle axes that don't rest at 0
                if (Math.abs(value - baseline) > 0.5) {
                    const axisId = `axis_${i}_${value > baseline ? 'pos' : 'neg'}_${baseline.toFixed(2)}`;

                    // Skip if this axis is already assigned to another action
                    if (mappings.includes(axisId)) {
                        lastPressedButton = axisId;
                        continue;
                    }

                    // Prevent duplicate detection
                    if (axisId !== lastPressedButton) {
                        lastPressedButton = axisId;
                        setDetectedButton(axisId);
                        setListening(false);
                        setCooldown(true);

                        const newMappings = [...mappings];
                        if (phase === 'left') newMappings[0] = axisId;
                        if (phase === 'right') newMappings[1] = axisId;
                        if (phase === 'jump') newMappings[2] = axisId;

                        setMappings(newMappings);

                        // Move to next phase after a short delay
                        setTimeout(() => {
                            if (phase === 'left') setPhase('right');
                            else if (phase === 'right') setPhase('jump');
                            else if (phase === 'jump') setPhase('confirm');

                            setDetectedButton(null);
                            setListening(true);

                            // Add a cooldown to prevent accidental inputs
                            setTimeout(() => {
                                setCooldown(false);
                            }, 500);
                        }, 1000);

                        return;
                    }
                } else if (lastPressedButton && lastPressedButton.startsWith(`axis_${i}`)) {
                    // Axis returned to neutral position
                    lastPressedButton = null;
                }
            }

            frameId = requestAnimationFrame(checkButtons);
        };

        frameId = requestAnimationFrame(checkButtons);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [gamepad, phase, listening, mappings, cooldown]);

    const handleConfirm = () => {
        onComplete(mappings);
    };

    const handleReset = () => {
        setMappings(['', '', '']);
        setPhase('left');
    };

    const getFriendlyButtonName = (mapping: string) => {
        if (!mapping) return 'Not set';

        if (mapping.startsWith('button_')) {
            const buttonIndex = parseInt(mapping.replace('button_', ''), 10);
            return `Button ${buttonIndex}`;
        }

        if (mapping.startsWith('axis_')) {
            const [_, axisIndex, direction] = mapping.split('_');
            return `Axis ${axisIndex} ${direction === 'pos' ? '(Positive)' : '(Negative)'}`;
        }

        return mapping;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="w-full max-w-md p-8">
                <Card title="Configure Controller" className="w-full">
                    <div className="flex flex-col gap-3 mt-3">
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between mb-2">
                            {['left', 'right', 'jump', 'confirm'].map((step, index) => (
                                <div
                                    key={step}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                        index < phaseIndex
                                            ? 'bg-brainchild-secondary text-white'
                                            : index === phaseIndex
                                              ? 'bg-brainchild-tertiary border-2 border-black'
                                              : 'bg-gray-200 border-2 border-gray-400'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-bold text-center">{phaseLabels[phase]}</h3>
                        <p className="text-sm md:text-xs text-center mb-4">{phaseDescriptions[phase]}</p>

                        {phase === 'confirm' ? (
                            <div className="mt-2">
                                <h4 className="text-md font-bold">Your Configuration:</h4>
                                <ul className="list-disc list-inside text-sm md:text-xs mt-2">
                                    <li>
                                        <span className="font-bold">Move Left:</span>{' '}
                                        {getFriendlyButtonName(mappings[0])}
                                    </li>
                                    <li>
                                        <span className="font-bold">Move Right:</span>{' '}
                                        {getFriendlyButtonName(mappings[1])}
                                    </li>
                                    <li>
                                        <span className="font-bold">Jump:</span> {getFriendlyButtonName(mappings[2])}
                                    </li>
                                </ul>

                                {mappings.some((m, i) => mappings.indexOf(m) !== i && m !== '') && (
                                    <div className="mt-2 p-2 bg-red-100 border-red-300 border rounded text-sm text-red-700">
                                        Warning: You have assigned the same input to multiple actions, which may cause
                                        issues during gameplay.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-100 border-2 border-black rounded-lg p-4 text-center h-16 flex items-center justify-center">
                                {listening ? (
                                    <p className="text-sm animate-pulse">Waiting for input...</p>
                                ) : (
                                    <p className="text-sm font-bold">
                                        Detected: {getFriendlyButtonName(detectedButton || '')}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between gap-2 mt-4">
                            <button
                                onClick={onCancel}
                                className="bg-gray-300 hover:bg-gray-400 border-1 border-black p-1 text-md md:text-sm font-bold uppercase"
                            >
                                Cancel
                            </button>

                            {phase === 'confirm' ? (
                                <>
                                    <button
                                        onClick={handleReset}
                                        className="bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase"
                                    >
                                        Confirm
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (phase === 'left') setPhase('right');
                                        else if (phase === 'right') setPhase('jump');
                                        else if (phase === 'jump') setPhase('confirm');
                                    }}
                                    className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 border-black p-1 text-md md:text-sm font-bold uppercase"
                                >
                                    Skip
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
