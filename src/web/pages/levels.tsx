import { useEffect, useMemo, useState } from 'preact/hooks';
import { Card } from '../card';
import { Layout } from '../layout';
import { useLocation, useRoute } from 'preact-iso';
import levelData from '../../../public/levels/meta.json';
import debounce from 'debounce';

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

    const onPageSelect = (e: any) => {
        const page = Number(e.target.value);
        if (Number.isInteger(page) && page > 0 && page <= numberOfPages) {
            route(`/levels/${page}`);
        }
    };

    const matchesNameOrAuthor = (level: { name: string, author: string }, searchQuery: string) => {
        return level.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) || level.author.toLowerCase().includes(searchQuery.toLowerCase().trim());
    };

    useEffect(() => {
        console.log('Effect triggered with page:', page, 'and search query:', searchQuery);
        
        // Parse page number
        let pageNumber = page ? Math.abs(parseInt(page)) : 1;
        pageNumber = Number.isInteger(pageNumber) ? pageNumber : 1;
        console.log('Parsed page number:', pageNumber);
        let _filteredLevels = levels;

        // Handle invalid page numbers
        if (pageNumber < 1) {
            console.log('Invalid page number, redirecting to page 1');
            route(`/levels/1${searchQuery ? `?search=${searchQuery}` : ''}`, true);
            return;
        }

        // Filter levels based on search
        if (searchQuery.length > 2) {
            console.log('Filtering levels with search query:', searchQuery);
            _filteredLevels = levels.filter((level) => matchesNameOrAuthor(level, searchQuery));
        } else if (filteredLevels.length !== levels.length) {
            console.log('Resetting filtered levels to all levels');
            _filteredLevels = levels;
        }


        // Calculate number of pages
        const _numberOfPages = Math.ceil(_filteredLevels.length / levelsPerPage) || 1;
        console.log('Calculated number of pages:', _numberOfPages);

        // Handle page number exceeding available pages
        if (pageNumber > _numberOfPages) {
            console.log('Page number exceeds available pages, redirecting to last page');
            route(`/levels/${_numberOfPages}${searchQuery ? `?search=${searchQuery}` : ''}`, true);
            return;
        }

        // Update state
        console.log('Updating state with page:', pageNumber);
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
            <Card title="Jump 'n Bump Levels" className="w-full px-3">
                <p className="text-xs pt-3">
                    Here you can download some of the levels that fans of Jump 'n Bump have made. If you want to add your own,
                    or update the information for a level, please <a href="https://github.com/jamsinclair/jumpnbump.js/issues/new?title=Level%20Submission%20or%20Update&body=Level%20Name%3A%0A%0AAuthor%3A%0A%0ADescription%3A%0A%0AImage%20URL%20(if%20available)%3A%0A%0AAuthor%20URL%20(if%20available)%3A%0A%0ADAT%20file%20URL%3A%0A%0AAdditional%20Notes%3A" className="text-brainchild-secondary font-bold">open an issue on GitHub</a>.
                </p>
                <div className="pt-3 flex justify-between items-center gap-1">
                    <div>
                        <input
                            type="text"
                            className="text-xs border-2 border-inset min-w-30 px-1"
                            placeholder="Search by name or author"
                            value={searchQuery}
                            onInput={debounce(onSearchQueryInput, 300)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold mr-1">Show:</label>
                        <select
                            className="text-xs border-2 border-inset min-w-30 px-1"
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
                    {levelsToShow.length === 0 && (
                        <div className="text-center text-xs">
                            No levels found
                        </div>
                    )}
                    {levelsToShow.map((level) => (
                        <div key={level.datFile} className="flex flex-row gap-4">
                            <div className="w-[40%]">
                                <img
                                    src={`/levels/${level.imageUrl}`}
                                    alt={level.name}
                                    className="w-full max-w-50 h-auto"
                                />
                            </div>
                            <div className="w-[60%] flex flex-col gap-1">
                                <h3 className="font-bold text-sm italic">{level.name}</h3>
                                <div className="text-xs">
                                    by:{' '}
                                    {level.authorUrl ? (
                                        <a href={level.authorUrl} className="text-brainchild-secondary font-bold">
                                            {level.author}
                                        </a>
                                    ) : (
                                        <span className="font-bold">{level.author}</span>
                                    )}
                                </div>
                                <ul className="list-none text-xs mt-3">
                                    <li>
                                        <span className="font-bold">Size:</span> {level.size}
                                    </li>
                                    <li>
                                        <span className="font-bold">Description:</span> {level.description}
                                    </li>
                                </ul>
                                <a
                                    href={`/levels/${level.datFile}`}
                                    className="text-brainchild-secondary text-xs font-bold mt-1"
                                    download={`${level.name}.dat`}
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
                                className="text-brainchild-secondary text-xs font-bold"
                            >
                                Previous Page
                            </a>
                        )}
                    </div>
                    <div className="w-1/3 text-center">
                        <span className="text-xs">
                            Page {currentPage} of {numberOfPages}
                        </span>
                    </div>
                    <div className="w-1/3 text-right">
                        {currentPage < numberOfPages && (
                            <a
                                href={`/levels/${currentPage + 1}`}
                                className="text-brainchild-secondary text-xs font-bold"
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
