import React, { useEffect, useState } from 'react';
import { Link } from 'preact-router/match';
import { LevelSelector } from '../components/level-selector';
import type { OptionalGameOptions } from '../../engine';
import { Game } from '../components/game';
import { ACTION_TYPE, joinGame, createHostGame } from '../actions/multiplayer';
import { OnlineMultiplayerDataProvider, useOnlineMultiplayerData } from '../contexts/online-multiplayer';

import '../menu.css';
import { Header } from '../components/header';
import { Lobby } from '../components/lobby';
import { Alert } from '../components/alert';
import { NetworkState } from '../network';

function MenuContent({ onJoinGame, onSelectHost }: { onJoinGame: (gameId: string) => void; onSelectHost: () => void }) {
    const handleJoinGame = () => {
        const gameId = prompt('Enter the Game ID');

        if (!gameId) {
            alert('Invalid Game ID, please try again.');
            return;
        }

        onJoinGame(gameId);
    };

    return (
        <>
            <p>This mode allows you to play Jump 'n Bump Peer-to-Peer with up to 3 other players.</p>
            <p>
                ⚠️ The network code is not optimised for latency. Recommended for players on the same network or nearby
                geographic region.
            </p>
            <ul>
                <li>
                    <button className="menu-button" onClick={onSelectHost}>
                        Host Game
                    </button>
                </li>
                <li>
                    <button className="menu-button" onClick={handleJoinGame}>
                        Join Game
                    </button>
                </li>
                <li>
                    <Link className="menu-button" href="/">
                        Back to Original Game
                    </Link>
                </li>
            </ul>
            <footer className="menu-footer">
                <p>Jump 'n Bump is a game by Brainchild Design.</p>
                <p>
                    The source code for this version of Jump 'n Bump is available on{' '}
                    <a href="https://github.com/jamsinclair/jumpnbump.js">GitHub</a>.
                </p>
            </footer>
        </>
    );
}

const getGameIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameId');
};

function _OnlineMultiplayerPage() {
    const [gameOptions, setGameOptions] = useState<OptionalGameOptions>({
        nosound: false,
        musicnosound: false,
        noflies: false,
        is_net: true,
    });
    const [networkState, dispatch] = useOnlineMultiplayerData();
    const { client, gameAlert, gameId, host, isHost, isGameStarted, selectedLevel, showLevelSelector }: NetworkState =
        networkState;

    const onSelectHost = () => {
        createHostGame(dispatch);
    };

    const onJoinGame = (gameId) => {
        joinGame(dispatch, gameId);
    };

    const onSetSelectedLevel = (name: string) => {
        dispatch({ type: ACTION_TYPE.CHANGE_LEVEL, data: name });
    };

    useEffect(() => {
        const gameId = getGameIdFromUrl();
        if (gameId) {
            joinGame(dispatch, gameId);
        }
    }, []);

    useEffect(() => {
        return () => {
            dispatch({ type: ACTION_TYPE.LEAVE_GAME });
        };
    }, []);

    const _gameOptions = {
        ...gameOptions,
        is_net: true,
        is_server: isHost,
        sockets: isHost && host ? host.getAllSockets() : undefined,
        hostSocket: !isHost && client?.conn ? client.conn : undefined,
    };

    if (isGameStarted && selectedLevel) {
        return (
            <>
                <Game
                    level={selectedLevel}
                    gameOptions={_gameOptions}
                    onExit={() => dispatch({ type: ACTION_TYPE.RESET })}
                />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="menu-main">
                <h2>Online Multiplayer (experimental)</h2>
                {gameId ? null : <MenuContent onSelectHost={onSelectHost} onJoinGame={onJoinGame} />}
                {gameId ? <Lobby /> : null}
            </main>
            {gameAlert ? <Alert alert={gameAlert} close={() => dispatch({ type: ACTION_TYPE.RESET })} /> : null}
            {showLevelSelector ? (
                <LevelSelector
                    selectedLevel={selectedLevel ?? 'jumpnbump'}
                    setSelectedLevel={onSetSelectedLevel}
                    close={() => dispatch({ type: ACTION_TYPE.TOGGLE_LEVEL_SELECTOR, data: false })}
                />
            ) : null}
        </>
    );
}

// Wraps _OnlineMultiplayerPage in a context provider
export function OnlineMultiplayerPage({ path: _path }: { path: string }) {
    return (
        <OnlineMultiplayerDataProvider>
            <_OnlineMultiplayerPage />
        </OnlineMultiplayerDataProvider>
    );
}
