import React, { useEffect, useRef } from 'react';

import './header.css';

export function Header() {
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
        <header className="header">
            <div className="header-logo-container">
                <div ref={parallaxLayerRef} className="header-logo-parallax-layer">
                    <h1>Jump 'n Bump</h1>
                </div>
            </div>
        </header>
    );
}
