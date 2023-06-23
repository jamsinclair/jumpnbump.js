import React, { useEffect } from 'react';
import { LevelPreview } from './level-preview';
import { OnlinePlayer, WEB_PACKET_TYPE, getShortPeerId } from '../network';
import { useOnlineMultiplayerData } from '../contexts/online-multiplayer';
import { ACTION_TYPE, Action } from '../actions/multiplayer';
import { ControlledInput } from './controlled-input';

import './lobby.css';

const BUNNY_NAMES = ['Dott', 'Jiffy', 'Fizz', 'Mijji'];
const ONLY_ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

function PlayerName({ name, isCurrentPlayer }: { name: string; isCurrentPlayer?: boolean }) {
    const [, dispatch] = useOnlineMultiplayerData();
    const [_name, setName] = React.useState(name);

    useEffect(() => {
        setName(name);
    }, [name]);

    const onNameChange = (event) => {
        const newName = event.target.value;
        if (newName.length > 5) {
            setName(_name);
            return;
        }

        if (newName === name) {
            setName(_name);
            return;
        }

        if (newName.length === 0) {
            setName('');
            return;
        }

        if (!ONLY_ALPHANUMERIC_REGEX.test(newName)) {
            setName(_name);
            return;
        }

        setName(newName);
    };

    const onBlur = () => {
        if (_name === name) {
            return;
        }

        if (_name?.length === 0) {
            setName(name);
            return;
        }

        dispatch({ type: ACTION_TYPE.CHANGE_NAME, data: _name });
    };

    if (!isCurrentPlayer) {
        return <p className="player-name">{name}</p>;
    }

    return (
        <p className="player-name">
            <label htmlFor="player-name">Edit your player's name</label>
            <ControlledInput
                id="player-name"
                className="player-name-input"
                value={_name}
                onInput={onNameChange}
                onBlur={onBlur}
            />{' '}
            (You)
        </p>
    );
}

function PlayerListItem({
    player,
    clientNum,
    isCurrentPlayer,
}: {
    player?: OnlinePlayer;
    clientNum: number;
    isCurrentPlayer?: boolean;
}) {
    if (!player) {
        return (
            <li className="player-list-item unassigned">
                <div className="avatar">
                    <img src={`/avatars/${clientNum}.png`} alt="Assigned Player Avatar." />
                </div>
                <p>No Player - Invite to join?</p>
            </li>
        );
    }

    return (
        <li className="player-list-item">
            <div className="avatar">
                <img src={`/avatars/${clientNum}.png`} alt="Your player avatar." />
            </div>
            <PlayerName name={player.name} isCurrentPlayer={isCurrentPlayer} />
        </li>
    );
}

function PlayerList({ players, currentPlayer }: { players: OnlinePlayer[]; currentPlayer: number }) {
    return (
        <ul className="player-list">
            <PlayerListItem player={players[0]} clientNum={0} isCurrentPlayer={0 === currentPlayer} />
            <PlayerListItem player={players[1]} clientNum={1} isCurrentPlayer={1 === currentPlayer} />
            <PlayerListItem player={players[2]} clientNum={2} isCurrentPlayer={2 === currentPlayer} />
            <PlayerListItem player={players[3]} clientNum={3} isCurrentPlayer={3 === currentPlayer} />
        </ul>
    );
}

export function Lobby() {
    const [state, dispatch] = useOnlineMultiplayerData();
    const { isHost, isConnected, gameId, selectedLevel, players, client } = state;

    const copyGameIdUrlToClipboard = () => {
        const url = `${window.location.origin}/online-multiplayer?gameId=${gameId}`;
        navigator.clipboard.writeText(url);
    };

    const onClickLeaveLobby = () => {
        window.history.replaceState({}, '', window.location.pathname);
        dispatch({ type: ACTION_TYPE.RESET });
    };

    const onClickChangeLevel = () => {
        dispatch({ type: ACTION_TYPE.TOGGLE_LEVEL_SELECTOR, data: true });
    };

    const showLevelSelector = () => dispatch({ type: ACTION_TYPE.TOGGLE_LEVEL_SELECTOR, data: true });

    const onClickStartGame = () => {
        dispatch({ type: ACTION_TYPE.START_GAME });
    };

    const currentPlayer = isHost ? 0 : players.findIndex((p) => p.clientId === getShortPeerId(client?.peer.id || ''));

    return (
        <div className="lobby">
            <h3>
                Game ID: {gameId}{' '}
                <button className="copy-game-id" title="Copy Game ID to share" onClick={copyGameIdUrlToClipboard}>
                    🔗
                </button>
            </h3>
            {selectedLevel ? <LevelPreview level={selectedLevel} onClick={() => showLevelSelector()} /> : null}
            <p>Players:</p>
            {isConnected ? <PlayerList players={players} currentPlayer={currentPlayer} /> : <p>Connecting...</p>}
            <ul>
                {isHost ? (
                    <li>
                        <button className="menu-button" onClick={onClickStartGame} disabled={!isConnected}>
                            Start Game
                        </button>
                    </li>
                ) : null}
                {isHost ? (
                    <li>
                        <button className="menu-button" onClick={onClickChangeLevel}>
                            Change Level
                        </button>
                    </li>
                ) : null}
                <li>
                    <button className="menu-button" onClick={onClickLeaveLobby}>
                        Leave Lobby
                    </button>
                </li>
            </ul>
        </div>
    );
}
