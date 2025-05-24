import { useEffect, useState } from 'preact/hooks';
import { Card } from '../components/card';
import { Layout } from '../layout';
import { useLocation, useRoute } from 'preact-iso';
import levelData from '../levels.json';
import debounce from 'debounce';
import { PageMeta, usePageMeta } from '../hooks/page-meta';

const levelsPageMeta: PageMeta = {
    title: "Jump 'n Bump Custom Levels - Download Fan-Made Levels",
    description:
        "Browse and download over 200 custom fan-made levels for Jump 'n Bump. Search by level name or author and enhance your gameplay experience.",
    keywords: [
        "Jump 'n Bump",
        'custom levels',
        'game levels',
        'fan-made levels',
        'level download',
        'retro game levels',
        'multiplayer game levels',
    ],
    ogImage: '/screenshot-large.jpg',
    ogDescription:
        "Discover and download over 200 custom fan-made levels for the classic multiplayer game Jump 'n Bump. Browse by page or search by creator.",
    ogTitle: "Jump 'n Bump Level Library - Fan-Made Custom Levels",
    ogType: 'website',
    ogUrl: 'https://jumpnbump.net/levels',
    structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: "Jump 'n Bump Custom Levels",
        description: "Browse and download over 200 custom fan-made levels for the classic game Jump 'n Bump",
        numberOfItems: 256,
        author: {
            '@type': 'Person',
            name: 'Jamie Sinclair',
        },
    },
};

export default function levels() {
    const levels = levelData;
    const levelsPerPage = 10;
    const { route } = useLocation();
    const {
        query,
        params: { page },
    } = useRoute();
    const searchQuery = query.search || '';
    const [currentPage, setCurrentPage] = useState(page ? parseInt(page) : 1);
    const [filteredLevels, setFilteredLevels] = useState(levels);
    const [levelsToShow, setLevelsToShow] = useState(filteredLevels);
    const [numberOfPages, setNumberOfPages] = useState(Math.ceil(filteredLevels.length / levelsPerPage));

    const pageTitle =
        currentPage > 1 && !searchQuery
            ? `Jump 'n Bump Levels - Page ${currentPage} of ${numberOfPages}`
            : levelsPageMeta.title;

    const onPageSelect = (e: any) => {
        const page = Number(e.target.value);
        if (Number.isInteger(page) && page > 0 && page <= numberOfPages) {
            route(`/levels/${page}`);
        }
    };

    const matchesNameOrAuthor = (level: { name: string; author: string }, searchQuery: string) => {
        return (
            level.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            level.author.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
    };

    usePageMeta(
        searchQuery ? { ...levelsPageMeta, robots: 'noindex, nofollow' } : { ...levelsPageMeta, title: pageTitle }
    );

    useEffect(() => {
        // Parse page number
        let pageNumber = page ? Math.abs(parseInt(page)) : 1;
        pageNumber = Number.isInteger(pageNumber) ? pageNumber : 1;
        let _filteredLevels = levels;

        // Handle invalid page numbers
        if (pageNumber < 1) {
            route(`/levels/1${searchQuery ? `?search=${searchQuery}` : ''}`, true);
            return;
        }

        // Filter levels based on search
        if (searchQuery.length > 2) {
            _filteredLevels = levels.filter((level) => matchesNameOrAuthor(level, searchQuery));
        } else if (filteredLevels.length !== levels.length) {
            _filteredLevels = levels;
        }

        // Calculate number of pages
        const _numberOfPages = Math.ceil(_filteredLevels.length / levelsPerPage) || 1;

        // Handle page number exceeding available pages
        if (pageNumber > _numberOfPages) {
            route(`/levels/${_numberOfPages}${searchQuery ? `?search=${searchQuery}` : ''}`, true);
            return;
        }

        // Update state
        setCurrentPage(pageNumber);
        setFilteredLevels(_filteredLevels);
        setLevelsToShow(_filteredLevels.slice((pageNumber - 1) * levelsPerPage, pageNumber * levelsPerPage));
        setNumberOfPages(_numberOfPages);
    }, [page, searchQuery]);

    const onSearchQueryInput = (e: any) => {
        const newSearchQuery = e.target.value;
        route(`/levels/1${newSearchQuery ? `?search=${newSearchQuery}` : ''}`);
    };

    return (
        <Layout title="Levels">
            <Card title="Jump 'n Bump Levels" className="w-full px-4 md:px-3">
                <p className="text-sm md:text-xs pt-3">
                    Here you can download some of the levels that fans of Jump 'n Bump have made. If you want to add
                    your own, or update the information for a level, please{' '}
                    <a
                        href="https://github.com/jamsinclair/jumpnbump.js/issues/new?title=Level%20Submission%20or%20Update&body=Level%20Name%3A%0A%0AAuthor%3A%0A%0ADescription%3A%0A%0AImage%20URL%20(if%20available)%3A%0A%0AAuthor%20URL%20(if%20available)%3A%0A%0ADAT%20file%20URL%3A%0A%0AAdditional%20Notes%3A"
                        className="text-brainchild-secondary font-bold"
                    >
                        open an issue on GitHub
                    </a>
                    .
                </p>
                <div className="pt-3 flex flex-col md:flex-row justify-between md:items-center gap-1">
                    <div>
                        <input
                            type="text"
                            className="text-sm md:text-xs border-2 border-inset min-w-30 p-1 md:py-0"
                            placeholder="Search by name or author"
                            value={searchQuery}
                            onInput={debounce(onSearchQueryInput, 300)}
                        />
                    </div>
                    <div>
                        <label className="text-sm md:text-xs font-bold mr-1">Show:</label>
                        <select
                            className="text-sm md:text-xs border-2 border-inset min-w-30 p-1 md:py-0 mt-2 md:mt-0"
                            onChange={onPageSelect}
                            value={currentPage}
                        >
                            {Array.from({ length: numberOfPages }, (_, i) => (
                                <option value={i + 1}>
                                    Page {i + 1} of {numberOfPages}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-6 pt-4">
                    {levelsToShow.length === 0 && <div className="text-center text-sm md:text-xs">No levels found</div>}
                    {levelsToShow.map((level) => (
                        <div key={level.datFile} className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-[40%]">
                                <img
                                    src={`/levels/${level.imageUrl}`}
                                    alt={level.name}
                                    loading="lazy"
                                    className="w-full max-w-50 h-auto"
                                />
                            </div>
                            <div className="w-full md:w-[60%] flex flex-col gap-1">
                                <h3 className="font-bold text-md md:text-sm italic">{level.name}</h3>
                                <div className="text-sm md:text-xs">
                                    by:{' '}
                                    {level.authorUrl ? (
                                        <a href={level.authorUrl} className="text-brainchild-secondary font-bold">
                                            {level.author}
                                        </a>
                                    ) : (
                                        <span className="font-bold">{level.author}</span>
                                    )}
                                </div>
                                <ul className="list-none text-sm md:text-xs mt-3">
                                    <li>
                                        <span className="font-bold">Size:</span> {level.size}
                                    </li>
                                    <li>
                                        <span className="font-bold">Description:</span> {level.description}
                                    </li>
                                </ul>
                                <a
                                    href={`/levels/${level.datFile}`}
                                    className="text-brainchild-secondary text-sm md:text-xs font-bold mt-1"
                                    download={`${level.datFile}.dat`}
                                    target="_blank"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4">
                    <div className="w-1/3">
                        {currentPage > 1 && (
                            <a
                                href={`/levels/${currentPage - 1}`}
                                className="text-brainchild-secondary text-sm md:text-xs font-bold"
                            >
                                Previous Page
                            </a>
                        )}
                    </div>
                    <div className="w-1/3 text-center">
                        <span className="text-sm md:text-xs">
                            Page {currentPage} of {numberOfPages}
                        </span>
                    </div>
                    <div className="w-1/3 text-right">
                        {currentPage < numberOfPages && (
                            <a
                                href={`/levels/${currentPage + 1}`}
                                className="text-brainchild-secondary text-sm md:text-xs font-bold"
                            >
                                Next Page
                            </a>
                        )}
                    </div>
                </div>
            </Card>
        </Layout>
    );
}
