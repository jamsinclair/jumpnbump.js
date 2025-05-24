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
            <div className="[width:690px] mt-10 p-2">
                <h2 className="italic text-lg text-right uppercase tracking-[.25em] px-4">
                    Inspired by Brainchild Design
                </h2>
                <div className="bg-brainchild-fg border-2 border-black rounded-3xl rounded-tl-none w-151 relative mr-0 ml-auto">
                    <header className="">
                        <ParallaxLogo />
                    </header>
                    <div className="bg-brainchild-separator border-t-1 border-b-1 border-black w-full p-1 flex flex-row justify-end items-center text-xs">
                        <div className="pr-4">
                            <span className="font-bold">Members:</span> <span>4362.</span>
                            <span className="pl-1 font-bold">Online:</span> <span>{onlineCount}.</span>
                        </div>
                    </div>
                    <div className="ml-9 mr-5 pt-4 border-b-1 border-black">
                        <div className="w-66 bg-gradient-to-r from-brainchild-fg to-brainchild-separator-darker px-2 ml-auto text-right">
                            <h2 className="uppercase text-xl italic text-white font-bold text-stroke-1 leading-none">
                                {title}
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-row py-4 pl-9 pr-5 gap-2 relative items-start">
                        <div className="flex flex-col gap-0.5 absolute -left-19">
                            <a
                                href="/"
                                className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-right font-bold px-2 flex-grow-0 w-25 cursor-pointer"
                            >
                                PLAY
                            </a>
                            <a
                                href="/levels"
                                className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-right font-bold px-2 flex-grow-0 w-25 cursor-pointer"
                            >
                                LEVELS
                            </a>
                            <a
                                href="/about"
                                className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-right font-bold px-2 flex-grow-0 w-25 cursor-pointer"
                            >
                                ABOUT
                            </a>
                            <a
                                href="https://github.com/jamsinclair/jumpnbump.js"
                                className="bg-brainchild-primary hover:bg-brainchild-primary-hover border-1 text-black text-sm text-right font-bold px-2 flex-grow-0 w-25 cursor-pointer"
                            >
                                SOURCE
                            </a>
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
