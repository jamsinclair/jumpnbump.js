import { useMemo, useState } from 'preact/hooks';
import { useGamepads } from '../hooks/gamepads';
import { ConfigureController } from './configure-controller';
import { DEFAULT_CONTROLS } from '../../constants';
import type { GameInputDevice } from '../../inputs';

const PLAYERS = ['Dott', 'Jiffy', 'Fizz', 'Mijji'] as const;

type ControlMapping = {
    id: string;
    name: string;
    type: 'keyboard' | 'mouse' | 'gamepad';
    mappings: (string | number)[];
};

const MAPPINGS: ControlMapping[] = [
    { id: 'keyboard_arrows', name: 'Keyboard (Arrow Keys)', type: 'keyboard', mappings: DEFAULT_CONTROLS[0].mappings },
    { id: 'keyboard_awd', name: 'Keyboard (A, W, D)', type: 'keyboard', mappings: DEFAULT_CONTROLS[1].mappings },
    { id: 'keyboard_jil', name: 'Keyboard (J, I, L)', type: 'keyboard', mappings: DEFAULT_CONTROLS[2].mappings },
    { id: 'keyboard_numpad', name: 'Keyboard (Numpad)', type: 'keyboard', mappings: DEFAULT_CONTROLS[3].mappings },
    { id: 'mouse', name: 'Mouse (Left Click, Middle Button, Right Click)', type: 'mouse', mappings: [0, 2, 1] },
];

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

const KNOWN_GAMEPAD_DEFAULTS: Array<{ pattern: string; defaults: { chrome?: string[]; firefox?: string[] } }> = [
    {
        pattern: '8BitDo Micro',
        defaults: {
            chrome: ['axis_0_neg_0.00', 'axis_0_pos_0.00', 'button_0'],
            firefox: ['axis_1_neg_0.00', 'axis_1_pos_0.00', 'button_0'],
        },
    },
    {
        pattern: 'Joy-Con (L)',
        defaults: {
            chrome: ['axis_0_neg_0.00', 'axis_0_pos_0.00', 'button_1'],
        },
    },
    {
        pattern: 'Joy-Con (R)',
        defaults: {
            chrome: ['axis_0_neg_0.00', 'axis_0_pos_0.00', 'button_1'],
        },
    },
];

const getKnownGamepadDefaults = (gamepadId: string): string[] | null => {
    const lowerGamepadId = gamepadId.toLowerCase();
    const known = KNOWN_GAMEPAD_DEFAULTS.find((k) => lowerGamepadId.includes(k.pattern.toLowerCase()));
    if (!known) return null;
    const browser = isFirefox ? 'firefox' : 'chrome';
    return known.defaults[browser] ?? null;
};

const getFriendlyGamepadName = (gamepad: Gamepad) => {
    const id = gamepad.id.replace(/^[\da-zA-Z]+\-[\da-zA-Z]+\-/, '');
    return `${id} (${gamepad.index + 1})`;
};

const getGamepadId = (gamepad: Gamepad) => {
    return gamepad.id + '_' + gamepad.index;
};

const getDefaultPlayerControls = () =>
    PLAYERS.reduce(
        (acc, player, index) => ({
            ...acc,
            [player]: MAPPINGS[index]?.id || '',
        }),
        {} as PlayerControls
    );

export type PlayerControls = Record<(typeof PLAYERS)[number], string>;
export type ControlErrors = Partial<Record<(typeof PLAYERS)[number], string>>;

type ControlsProps = {
    onControlsChange: (controls: GameInputDevice[], errors: string[]) => void;
    defaultPlayerControlIds?: Record<string, string>;
    defaultGamepadConfigs?: Record<string, string[]>;
    onStateChange?: (playerControlIds: Record<string, string>, gamepadConfigs: Record<string, string[]>) => void;
};

export function Controls({
    onControlsChange,
    defaultPlayerControlIds,
    defaultGamepadConfigs,
    onStateChange,
}: ControlsProps) {
    const gamepads = useGamepads();
    const [playerControls, setPlayerControls] = useState<Record<(typeof PLAYERS)[number], string>>(() => {
        if (defaultPlayerControlIds && Object.keys(defaultPlayerControlIds).length > 0) {
            return defaultPlayerControlIds as PlayerControls;
        }
        return getDefaultPlayerControls();
    });
    const [errors, setErrors] = useState<ControlErrors>({});
    const [configuringGamepad, setConfiguringGamepad] = useState<{ player: string; gamepad: Gamepad } | null>(null);
    const [gamepadConfigs, setGamepadConfigs] = useState<Record<string, string[]>>(defaultGamepadConfigs ?? {});

    const getDeviceForId = (id: string, configs: Record<string, string[]> = gamepadConfigs): GameInputDevice => {
        const staticMapping = MAPPINGS.find((m) => m.id === id);
        if (staticMapping) {
            return {
                type: staticMapping.type as 'keyboard' | 'mouse',
                mappings: staticMapping.mappings.map(String),
            };
        }
        // Gamepad — use configured mappings, known controller defaults, or generic standard layout fallback
        return {
            type: 'gamepad',
            id,
            mappings: configs[id] ?? getKnownGamepadDefaults(id) ?? ['button_14', 'button_15', 'button_0'],
        };
    };

    const options = useMemo(() => {
        return MAPPINGS.map((mapping) => ({
            id: mapping.id,
            name: mapping.name,
        })).concat(
            gamepads.map((gamepad) => ({
                id: gamepad.id + '_' + gamepad.index,
                name: getFriendlyGamepadName(gamepad),
            }))
        );
    }, [gamepads]);

    const handleControlChange = (player: string, controlId: string, configsOverride?: Record<string, string[]>) => {
        const newPlayerControls = { ...playerControls, [player]: controlId };
        const currentConfigs = configsOverride ?? gamepadConfigs;

        const newErrors = {};
        Object.entries(newPlayerControls).forEach(([currentPlayer, control]) => {
            const duplicatePlayers = Object.entries(newPlayerControls)
                .filter(([p, c]) => c === control && p !== currentPlayer)
                .map(([p]) => p);

            if (duplicatePlayers.length > 0) {
                newErrors[currentPlayer] = `Same control scheme as ${duplicatePlayers.join(', ')}`;
            }
        });

        setPlayerControls(newPlayerControls);
        setErrors(newErrors);
        const devices = Object.values(newPlayerControls).map((id) => getDeviceForId(id, currentConfigs));
        onControlsChange(devices, Object.values(newErrors));
        onStateChange?.(newPlayerControls, currentConfigs);
    };

    const handleConfigureController = (player: string, gamepadId: string) => {
        const gamepad = gamepads.find((gp) => getGamepadId(gp) === gamepadId);
        if (gamepad) {
            setConfiguringGamepad({ player, gamepad });
        }
    };

    const handleConfigurationComplete = (mappings: string[]) => {
        if (!configuringGamepad) return;
        const gamepadId = getGamepadId(configuringGamepad.gamepad);
        const newConfigs = { ...gamepadConfigs, [gamepadId]: mappings };
        setGamepadConfigs(newConfigs);
        handleControlChange(configuringGamepad.player, gamepadId, newConfigs);
        setConfiguringGamepad(null);
    };

    const handleConfigurationCancel = () => {
        setConfiguringGamepad(null);
    };

    const isGamepadOption = (id: string) => {
        return gamepads.some((gamepad) => getGamepadId(gamepad) === id);
    };

    return (
        <>
            <ul className="list-none flex flex-col gap-2 pt-3">
                {PLAYERS.map((player, index) => (
                    <li key={player} className="flex flex-row gap-2">
                        <label
                            className="inline-block max-w-6 w-full text-sm md:text-xs font-bold mr-2"
                            htmlFor={`player-${player}`}
                        >
                            {player}:
                        </label>
                        <div className="flex flex-col max-w-55 w-full">
                            <div className="flex flex-row gap-2">
                                <select
                                    id={`player-${player}`}
                                    className={`text-sm md:text-xs border-2 ${
                                        errors[player] ? 'border-red-500' : 'border-inset'
                                    } min-w-30 p-1 md:py-0 mt-2 md:mt-0 flex-grow`}
                                    value={playerControls[player]}
                                    onChange={(e) => handleControlChange(player, (e.target as HTMLSelectElement).value)}
                                >
                                    {options.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {isGamepadOption(playerControls[player]) && (
                                    <button
                                        onClick={() => handleConfigureController(player, playerControls[player])}
                                        className="bg-brainchild-tertiary hover:bg-brainchild-tertiary-hover border-1 border-black p-1 text-xs font-bold mt-2 md:mt-0"
                                        title="Configure gamepad buttons"
                                    >
                                        Configure
                                    </button>
                                )}
                            </div>
                            {errors[player] && <span className="text-xs text-red-500 mt-1">{errors[player]}</span>}
                        </div>
                    </li>
                ))}
            </ul>

            {configuringGamepad && (
                <ConfigureController
                    gamepad={configuringGamepad.gamepad}
                    onComplete={handleConfigurationComplete}
                    onCancel={handleConfigurationCancel}
                />
            )}
        </>
    );
}
