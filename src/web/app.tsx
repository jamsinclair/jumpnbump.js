import 'preact/debug';
import React from 'react';
import Router from 'preact-router';
import { createRoot } from 'react-dom/client';
import './global.css';

import { IndexPage } from './pages/index';
import { OnlineMultiplayerPage } from './pages/online-multiplayer';
import { GameInfoOverlay } from './components/game-info-overlay';

function App() {
    return (
        <>
            {/*@ts-ignore - preact-router types are finnicky*/}
            <Router>
                <IndexPage path="/" />
                <OnlineMultiplayerPage path="/online-multiplayer" />
            </Router>
            <GameInfoOverlay />
        </>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
