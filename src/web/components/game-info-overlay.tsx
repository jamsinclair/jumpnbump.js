import { useEffect, useRef } from 'preact/hooks';
import { Close } from '../icons/close';

const shortcuts = [
    {
        keys: '? (SHIFT + /)',
        description: 'Toggles this overlay',
    },
    {
        keys: 'ESC',
        description:
            'Exits the current phase. Exiting from the in-game menu will bring you back to the level selection screen.',
    },
    {
        keys: 'F (SHIFT + f)',
        description: 'Toggle fullscreen',
    },
];

const controls = [
    {
        keys: '←, ↑, →',
        description: 'To steer Dot',
    },
    {
        keys: 'A, W, D',
        description: 'To steer Jiffy',
    },
    {
        keys: 'J, I, L',
        description: 'To steer Fizz',
    },
    {
        keys: '4, 8, 6',
        description: 'To steer Mijji (on the numeric pad)',
    },
];

const toggleAi = [
    {
        keys: '1',
        description: 'Toggle ai for Dot',
    },
    {
        keys: '2',
        description: 'Toggle ai for Jiffy',
    },
    {
        keys: '3',
        description: 'Toggle ai for Fizz',
    },
    {
        keys: '4',
        description: 'Toggle ai for Mijji',
    },
];

export function GameInfoOverlay() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dismissDialog = () => {
        if (dialogRef.current && dialogRef.current.open) {
            dialogRef.current.close();
        }
    };

    const toggleDialog = (e?: unknown) => {
        if (e instanceof KeyboardEvent && e.key !== 'enter') return;

        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        } else if (dialogRef.current) {
            dialogRef.current.close();
        }
    };

    const onButtonKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            dismissDialog();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismissDialog();
            if (e.key === '?') toggleDialog();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [dialogRef]);

    return (
        <>
            <dialog
                className="opacity-85 p-4 fixed inset-0 m-auto w-max h-max max-w-[90%] max-h-[90%] overflow-auto"
                ref={dialogRef}
            >
                <h2 className="text-sm md:text-xs uppercase font-semibold px-2 my-2">General</h2>
                <table className="w-full border-collapse text-sm md:text-xs">
                    <tbody>
                        {shortcuts.map(({ keys, description }) => (
                            <tr key={keys} className="border-t border-black">
                                <td className="p-2 w-[70%]">{description}</td>
                                <td className="p-2 w-[30%] font-bold">{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2 className="text-sm md:text-xs uppercase font-semibold px-2 my-2">Controls</h2>
                <table className="w-full border-collapse text-sm md:text-xs">
                    <tbody>
                        {controls.map(({ keys, description }) => (
                            <tr key={keys} className="border-t border-black">
                                <td className="p-2 w-[70%]">{description}</td>
                                <td className="p-2 w-[30%] font-bold">{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2 className="text-sm md:text-xs uppercase font-semibold px-2 my-2">
                    Toggle AI Players (when game is in progress)
                </h2>
                <table className="w-full border-collapse text-sm md:text-xs">
                    <tbody>
                        {toggleAi.map(({ keys, description }) => (
                            <tr key={keys} className="border-t border-black">
                                <td className="p-2 w-[70%]">{description}</td>
                                <td className="p-2 w-[30%] font-bold">{keys}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    className="absolute top-0 right-0 p-2 cursor-pointer bg-transparent border-none outline-1 outline-black -outline-offset-1 text-black transition-all duration-200 ease-in-out hover:outline-offset-[-3px] hover:outline-[3px] active:outline-offset-[-3px] active:outline-[3px] active:bg-black active:text-white focus:outline-[3px] focus:outline-offset-[-3px]"
                    onClick={dismissDialog}
                    onKeyDown={onButtonKeyDown}
                    aria-label="Close Controls & Shortcuts Overlay"
                >
                    <Close className="w-6 h-6" />
                </button>
            </dialog>
            <button
                className="fixed bottom-4 right-4 cursor-pointer p-2 bg-transparent text-[1.2rem] w-8 h-8 text-center leading-none m-0 outline-1 outline-white -outline-offset-1 text-white transition-all duration-200 ease-in-out hover:outline-offset-[-3px] hover:outline-[3px] active:outline-offset-[-3px] active:outline-[3px] active:bg-white active:text-black"
                aria-label="Toggle Controls & Shortcuts Overlay"
                onClick={toggleDialog}
                onKeyDown={toggleDialog}
            >
                ?
            </button>
        </>
    );
}
