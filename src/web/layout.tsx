import { useEffect, useMemo, useRef } from 'preact/hooks';
import { ComponentChildren } from 'preact';

function ParallaxLogo() {
    const parallaxLayerRef = useRef<HTMLDivElement>(null);
    const parallaxIntensity = 8;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!parallaxLayerRef.current) {
                return;
            }
            const { clientX, clientY } = e;
            const { left, top, width, height } = parallaxLayerRef.current.getBoundingClientRect();
            const x = ((clientX - left) / width) * parallaxIntensity;
            const y = ((clientY - top) / height) * parallaxIntensity;
            parallaxLayerRef.current.style.setProperty('--x', x.toString());
            parallaxLayerRef.current.style.setProperty('--y', y.toString());
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [parallaxLayerRef]);

    return (
        <div className="logo-container">
            <div ref={parallaxLayerRef} className="logo-parallax-layer">
                <h1>Jump 'n Bump</h1>
            </div>
        </div>
    );
}

export function Layout({ title, children }: { title: string; children: ComponentChildren }) {
    const onlineCount = useMemo(() => Math.floor(Math.random() * 20), []);

    return (
        <div className="bg-brainchild-bg w-full h-full min-h-screen flex justify-center">
            <div className="w-full [max-width:690px]  mx-auto mt-2 md:mt-10 p-2 sm:p-4">
                <h2 className="italic text-sm md:text-lg text-right uppercase tracking-[.25em] px-4">
                    Inspired by Brainchild Design
                </h2>
                <div className="bg-brainchild-fg border-2 border-black rounded-3xl rounded-tl-none w-full md:w-151 md:ml-auto md:mr-0 relative overflow-hidden md:overflow-visible">
                    <header>
                        <ParallaxLogo />
                    </header>
                    <div className="bg-brainchild-separator border-t-1 border-b-1 border-black w-full p-1 flex flex-row justify-end items-center text-xs">
                        <div className="pr-4">
                            <span className="font-bold">Members:</span> <span>4362.</span>
                            <span className="pl-1 font-bold">Online:</span> <span>{onlineCount}.</span>
                        </div>
                    </div>
                    <div className="mx-4 md:ml-9 md:mr-5 pt-4 border-b-1 border-black">
                        <div className="w-66 bg-gradient-to-r from-brainchild-fg to-brainchild-separator-darker px-2 ml-auto text-right">
                            <h2 className="uppercase text-xl italic text-white font-bold text-stroke-1 leading-none">
                                {title}
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row p-4 md:py-4 md:pl-9 md:pr-5 md:gap-2 relative md:items-start">
                        <nav className="order-first md:order-none md:absolute md:-left-19 md:mb-0">
                            <ul className="flex flex-row flex-wrap justify-center gap-2 mb-4 md:flex-col md:gap-0.5 list-none p-0 m-0">
                                <li>
                                    <a
                                        href="/"
                                        className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-center md:text-right font-bold px-3 py-1 md:px-2 md:py-0 flex-grow-0 w-auto md:w-25 cursor-pointer block"
                                    >
                                        PLAY
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/levels"
                                        className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-center md:text-right font-bold px-3 py-1 md:px-2 md:py-0 flex-grow-0 w-auto md:w-25 cursor-pointer block"
                                    >
                                        LEVELS
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/about"
                                        className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-center md:text-right font-bold px-3 py-1 md:px-2 md:py-0 flex-grow-0 w-auto md:w-25 cursor-pointer block"
                                    >
                                        ABOUT
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/jamsinclair/jumpnbump.js"
                                        className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-center md:text-right font-bold px-3 py-1 md:px-2 md:py-0 flex-grow-0 w-auto md:w-25 cursor-pointer block"
                                    >
                                        SOURCE
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <div className="hidden md:block absolute top-34 -left-19 pointer-events-none">
                            <img src="/sidebar.gif" alt="sidebar gif animation" className="[width:100px]" />
                        </div>
                        {children}
                    </div>
                </div>
                <footer className="">
                    <p className="text-xs text-center">
                        Website and JavaScript port by{' '}
                        <a href="https://github.com/jamsinclair/jumpnbump.js" className="underline">
                            Jamie Sinclair
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
