import { Download } from '../icons/download';
import { Card } from '../components/card';
import { Layout } from '../layout';
import { PageMeta, usePageMeta } from '../hooks/page-meta';

const aboutPageMeta: PageMeta = {
    title: "About Jump 'n Bump - History & Downloads",
    description:
        "Learn about the history of Jump 'n Bump, a classic multiplayer game created in 1998 by Brainchild Design. Find download links and source code information.",
    keywords: [
        "Jump 'n Bump",
        'Brainchild Design',
        'retro game',
        'multiplayer game',
        'game history',
        'game download',
        'open source game',
    ],
    ogImage: '/screenshot-large.jpg',
    ogDescription:
        "Discover the history of Jump 'n Bump, the classic multiplayer game created in 1998 by four friends under Brainchild Design. Download the modern version and access source code.",
    ogTitle: "About Jump 'n Bump - Game History & Downloads",
    ogType: 'website',
    ogUrl: 'https://jumpnbump.net/about',
    structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: "About Jump 'n Bump",
        description: "History and download information for the classic game Jump 'n Bump",
        author: {
            '@type': 'Person',
            name: 'Jamie Sinclair',
        },
    },
};

export default function About() {
    usePageMeta(aboutPageMeta);

    return (
        <Layout title="About">
            <Card title="History" className="w-84 flex-shrink-0">
                <p className="text-xs pt-3">
                    Sweden, 1998. Four extremely talented, smart and goodlooking friends came together to make gaming
                    history.
                </p>
                <ul className="list-disc list-inside text-xs pt-3 pl-2 pb-1">
                    <li>Mattias Brynervall (Programming, Web Development)</li>
                    <li>Andreas Brynervall (Graphics, Game Design)</li>
                    <li>Martin Magnusson (Graphics, Game Design)</li>
                    <li>Anders JG Nilsson (Music, Sound Effects)</li>
                </ul>
                <p className="text-xs pt-3">
                    Together they created Jump 'n Bump and other games under Brainchild Design. They released the game
                    for free and it quickly became popular as emailware. Being shared between friends, family and the
                    world. Bringing people together, crowded around a keyboard and providing hours of fun.
                </p>
                <p className="text-xs pt-3">
                    Not long after, they released the game's source code for free. Allowing it to live on over the years
                    and to continue to bring joy to our lives.
                </p>
                <p className="text-xs pt-3">
                    If you'd like to help expand the history or add any additional information, please feel free to{' '}
                    <a
                        href="https://github.com/jamsinclair/jumpnbump.js"
                        target="_blank"
                        className="text-brainchild-secondary font-bold"
                    >
                        open an issue
                    </a>{' '}
                    for this website's repository.
                </p>
            </Card>
            <div className="flex flex-col w-full gap-2">
                <Card title="Download Game">
                    <p className="text-xs pt-3">
                        There is a modern fork of the original game available from{' '}
                        <a href="https://libregames.gitlab.io/jumpnbump/" className="underline">
                            LibreGames
                        </a>
                        .
                    </p>
                    <a
                        href="https://gitlab.com/LibreGames/jumpnbump/-/releases"
                        target="_blank"
                        className="mt-3 mx-auto flex flex-col items-center justify-center hover:scale-105 transition-all duration-300"
                    >
                        <Download size={40} className="drop-shadow-xl/50" />
                        <span className="text-xs tracking-[.25em] text-shadow-lg">download</span>
                    </a>
                </Card>
                <Card title="Source Code">
                    <ul className="list-disc list-inside text-xs pt-3 pb-1">
                        <li>
                            <a
                                href="https://gitlab.com/LibreGames/jumpnbump"
                                target="_blank"
                                className="text-brainchild-secondary font-bold"
                            >
                                LibreGames' modern fork of the original game
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://gitlab.com/LibreGames/jumpnbump"
                                target="_blank"
                                className="text-brainchild-secondary font-bold"
                            >
                                JavaScript port of the game
                            </a>
                        </li>
                    </ul>
                </Card>
            </div>
        </Layout>
    );
}
