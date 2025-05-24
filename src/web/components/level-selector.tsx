import { useEffect, useRef, useState } from 'preact/hooks';
import { RECOMMENDED_LEVELS } from '../constants';
import { LevelItem } from './level-item';
import levels from '../levels.json';

const IMAGE_BASE_URL = '/levels/';

const recommendedLevels = levels.filter((level) => RECOMMENDED_LEVELS.includes(level.datFile));

export type Level = {
    name: string;
    datFile: string;
    imageUrl: string;
    custom?: boolean;
};

export function LevelSelector({
    close,
    selectedLevel,
    setSelectedLevel,
}: {
    close: () => void;
    selectedLevel: Level;
    setSelectedLevel: (level: Level) => void;
}) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLevels, setFilteredLevels] = useState(levels);

    const onSelection = (level: Level) => {
        setSelectedLevel(level);
        close();
    };

    useEffect(() => {
        if (searchQuery.length < 3) {
            setFilteredLevels(levels);
            return;
        }

        setFilteredLevels(levels.filter((level) => level.name.toLowerCase().includes(searchQuery.toLowerCase())));
    }, [searchQuery]);

    useEffect(() => {
        // Store the previously focused element
        previousFocusRef.current = document.activeElement as HTMLElement;

        const getFocusableElements = () => {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            return focusableElements ? Array.from(focusableElements) : [];
        };

        // Focus the first focusable element in the modal
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        let focusableArray = focusableElements ? Array.from(focusableElements) : [];

        if (focusableArray.length > 0) {
            (focusableArray[0] as HTMLElement).focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
                return;
            }

            focusableArray = getFocusableElements();

            // Only trap focus if we're still in the modal
            if (e.key === 'Tab' && modalRef.current && focusableArray.length > 0) {
                // Check if the active element is inside our modal
                if (!modalRef.current.contains(document.activeElement)) {
                    e.preventDefault();
                    (focusableArray[0] as HTMLElement).focus();
                    return;
                }

                const firstElement = focusableArray[0] as HTMLElement;
                const lastElement = focusableArray[focusableArray.length - 1] as HTMLElement;

                // If shift+tab on first element, move to last element
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
                // If tab on last element, move to first element
                else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Set initial focus after a short delay to ensure the modal is fully rendered
        setTimeout(() => {
            if (focusableArray.length > 0) {
                (focusableArray[0] as HTMLElement).focus();
            }
        }, 50);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
            }
        };
    }, [close]);

    return (
        <div className="fixed inset-0 w-full h-full bg-black/50 z-[1000] flex items-center justify-center overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-white border-2 border-black rounded-3xl max-h-[90vh] max-w-[90vw] w-[800px] relative overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="level-selector-title"
            >
                <div className="bg-brainchild-separator border-b-1 border-black w-full py-3 px-4 flex flex-col">
                    <div className="flex flex-row justify-between items-center">
                        <h2 id="level-selector-title" className="text-xl font-bold">
                            Select Level
                        </h2>
                        <button
                            className="p-1 cursor-pointer bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 border-black transition-all duration-200 flex items-center justify-center"
                            onClick={close}
                            aria-label="Close Level Selector"
                        >
                            <span className="block w-16 h-6">Close</span>
                        </button>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Search by name"
                            className="border-inset border-2 px-1 bg-white text-sm"
                            onInput={(e: any) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)] mt-2" tabIndex={-1}>
                    {searchQuery.length < 3 && (
                        <>
                            <h3 className="underline text-black text-lg font-bold mb-2">Recommended</h3>
                            <ul className="grid gap-3 grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] list-none p-0 m-0 mb-6 ">
                                {recommendedLevels.map((level) => (
                                    <li key={`recommended-${level.datFile}`}>
                                        <LevelItem
                                            name={level.name}
                                            imageSrc={`${IMAGE_BASE_URL}${level.imageUrl}`}
                                            selected={level.datFile === selectedLevel.datFile}
                                            onSelection={() => onSelection(level)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <h3 className="underline text-black text-lg font-bold mb-2">
                        {searchQuery.length > 2 ? 'Search Results' : 'All'}
                    </h3>
                    <ul className="grid gap-3 grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] list-none p-0 m-0">
                        {filteredLevels.map((level) => (
                            <li key={level.datFile}>
                                <LevelItem
                                    name={level.name}
                                    imageSrc={`${IMAGE_BASE_URL}${level.imageUrl}`}
                                    selected={level.datFile === selectedLevel.datFile && !selectedLevel.custom}
                                    onSelection={() => onSelection(level)}
                                />
                            </li>
                        ))}
                        {filteredLevels.length === 0 && <li>No levels found</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
