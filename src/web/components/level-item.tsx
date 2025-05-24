export function LevelItem({
    name,
    imageSrc,
    selected,
    onSelection,
}: {
    name: string;
    imageSrc: string;
    selected: boolean;
    onSelection: () => void;
}) {
    const selectedClass = selected ? ' border-black' : ' border-transparent hover:border-brainchild-tertiary';

    return (
        <button
            className={`p-2 cursor-pointer transition-all duration-200 rounded-md text-black font-bold flex flex-col items-center border-2 focus:border-2 focus:border-transparent focus:outline-brainchild-tertiary focus:outline-2 ${selectedClass}`}
            onClick={() => onSelection()}
        >
            <img src={imageSrc} alt={name} loading="lazy" className="w-50 h-32 object-cover mb-1 border border-black" />
            <span className="text-md md:text-sm mt-1">{name}</span>
        </button>
    );
}
