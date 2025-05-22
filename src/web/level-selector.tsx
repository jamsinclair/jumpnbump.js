import { useEffect } from 'preact/hooks';
import { LEVELS, RECOMMENDED_LEVELS } from './constants';
import { LevelItem } from './level-item';
import { CloseIcon } from './close-icon';

const IMAGE_BASE_URL = '/levels/';

export function LevelSelector({
    close,
    selectedLevel,
    setSelectedLevel,
}: {
    close: () => void;
    selectedLevel: string;
    setSelectedLevel: (name: string) => void;
}) {
    const onSelection = (name: string) => {
        setSelectedLevel(name);
        close();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-black z-[1000] overflow-y-auto">
            <button
                className="absolute top-0 right-0 p-2 cursor-pointer bg-none border-none outline outline-1 outline-white outline-offset-[-1px] text-white fill-white transition-all duration-200 focus:outline-[3px] focus:outline-offset-[-3px] hover:outline-[3px] hover:outline-offset-[-3px] active:bg-white active:text-black active:fill-black"
                onClick={close}
                aria-label="Close Level Selector"
            >
                <span className="block w-8 h-8">
                    <CloseIcon />
                </span>
            </button>
            <h1 className="ml-4 underline text-white text-xl font-bold mt-4 mb-2">Recommended</h1>
            <ul className="grid gap-3 grid-cols-[repeat(auto-fill,_minmax(202px,_1fr))] list-none p-0 m-0 mb-6">
                {RECOMMENDED_LEVELS.map((level) => (
                    <li key={level}>
                        <LevelItem
                            name={level}
                            imageSrc={`${IMAGE_BASE_URL}${level}.jpg`}
                            selected={level === selectedLevel}
                            onSelection={onSelection}
                        />
                    </li>
                ))}
            </ul>
            <h1 className="ml-4 underline text-white text-xl font-bold mt-4 mb-2">All</h1>
            <ul className="grid gap-3 grid-cols-[repeat(auto-fill,_minmax(202px,_1fr))] list-none p-0 m-0">
                {LEVELS.map((level) => (
                    <li key={level}>
                        <LevelItem
                            name={level}
                            imageSrc={`${IMAGE_BASE_URL}${level}.jpg`}
                            selected={level === selectedLevel}
                            onSelection={onSelection}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
