import { DataConnection } from 'peerjs';
import { WEB_PACKET_TYPE, getShortPeerId } from '../network';
import type { NetworkState, OnlinePlayer, WebPacket } from '../network';
import { ACTION_TYPE, Action } from '../actions/multiplayer';

let playerNumSeed = 0;
const getDefaultName = () => `P${++playerNumSeed}`.slice(0, 6);

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getDefaultMultiplayerState = (overrides?: Partial<NetworkState>): NetworkState => ({
    client: null,
    gameAlert: null,
    gameId: null,
    host: null,
    isConnected: false,
    isGameStarted: false,
    isHost: false,
    players: [],
    selectedLevel: 'jumpbump',
    showLevelSelector: false,
    ...overrides,
});

const gameHostWebPacketReducer = (
    state: NetworkState,
    action: { type: 'webPacket'; data: WebPacket; socket: DataConnection }
): NetworkState => {
    const packet = action.data;
    switch (packet.type) {
        case WEB_PACKET_TYPE.HELLO: {
            const { host, players } = state;
            const newPlayers: OnlinePlayer[] = [players[0]];
            host.sockets.forEach((s) => {
                const shortPeerId = getShortPeerId(s.peer);
                const player = players.find((p) => p.clientId === shortPeerId);
                if (player) {
                    newPlayers.push(player);
                    return;
                }
                newPlayers.push({ name: getDefaultName(), clientId: shortPeerId, clientNum: -1, isHost: false });
            });
            host.broadcast({ type: WEB_PACKET_TYPE.PLAYERS, data: newPlayers });
            return { ...state, players: newPlayers };
        }
        case WEB_PACKET_TYPE.UPDATE_NAME: {
            const { host, players } = state;
            const newPlayers = deepCopy(players).map((p) => {
                if (p.clientId === getShortPeerId(action.socket.peer)) {
                    return { ...p, name: packet.data };
                }
                return p;
            });
            host.broadcast({ type: WEB_PACKET_TYPE.PLAYERS, data: newPlayers });
            return { ...state, players: newPlayers };
        }
        case WEB_PACKET_TYPE.BYE: {
            const { host, players } = state;
            const newPlayers = players.filter((p) => p.clientId !== getShortPeerId(action.socket.peer));
            host.broadcast({ type: WEB_PACKET_TYPE.PLAYERS, data: newPlayers });
            return { ...state, players: newPlayers };
        }
    }
    throw Error('Unknown WebPacket action: ' + packet.type);
};

const clientWebPacketReducer = (
    state: NetworkState,
    action: { type: 'webPacket'; data: WebPacket; socket: DataConnection }
) => {
    const packet = action.data;
    switch (packet.type) {
        case WEB_PACKET_TYPE.PLAYERS: {
            return { ...state, players: packet.data };
        }
        case WEB_PACKET_TYPE.LEVEL: {
            return { ...state, selectedLevel: packet.data };
        }
        case WEB_PACKET_TYPE.START_GAME: {
            const { players, level } = packet.data;
            state.client.isPlaying = true;
            return { ...state, isGameStarted: true, players, selectedLevel: level };
        }
    }
    throw Error('Unknown WebPacket action: ' + packet.type);
};

export const multiplayerReducer = (state: NetworkState, action: Action): NetworkState => {
    if (action.type === ACTION_TYPE.WEB_PACKET) {
        if (state.isHost) {
            return gameHostWebPacketReducer(state, action);
        }
        return clientWebPacketReducer(state, action);
    }

    switch (action.type) {
        case ACTION_TYPE.CHANGE_LEVEL: {
            const { host } = state;
            const selectedLevel = action.data;
            host.broadcast({ type: WEB_PACKET_TYPE.LEVEL, data: selectedLevel });
            return { ...state, selectedLevel };
        }
        case ACTION_TYPE.CHANGE_NAME: {
            const { client, isHost, host, players } = state;
            const name = action.data;
            if (isHost && host) {
                const newPlayers = deepCopy(players);
                newPlayers[0].name = name;
                host.broadcast({ type: WEB_PACKET_TYPE.PLAYERS, data: newPlayers });
                return { ...state, players: newPlayers };
            }
            if (client) {
                client.send({ type: WEB_PACKET_TYPE.UPDATE_NAME, data: name });
                return state;
            }
        }
        case ACTION_TYPE.ERROR: {
            const { client, host } = state;
            if (host) {
                host.stop();
            }
            if (client) {
                client.stop();
            }
            playerNumSeed = 0;
            const newState = getDefaultMultiplayerState();
            newState.gameAlert = {
                type: 'error',
                title: 'Something went wrong',
                content: action.data,
            };
            return newState;
        }
        case ACTION_TYPE.HOST_DISCONNECTED: {
            const { client } = state;
            if (client) {
                client.stop();
            }
            const newState = getDefaultMultiplayerState();
            newState.gameAlert = {
                type: 'info',
                title: 'Host Disconnected',
                content: 'Your game host appears to have left the game or disconnected.',
            };
            return newState;
        }
        case ACTION_TYPE.IS_CONNECTED: {
            return { ...state, isConnected: true };
        }
        case ACTION_TYPE.JOIN_GAME: {
            const { gameId, client } = action.data;
            return { ...state, isHost: false, client, gameId };
        }
        case ACTION_TYPE.RESET:
        case ACTION_TYPE.LEAVE_GAME: {
            const { client, host } = state;
            if (host) {
                host.stop();
            }
            if (client) {
                client.stop();
            }
            playerNumSeed = 0;
            return getDefaultMultiplayerState();
        }
        case ACTION_TYPE.CREATE_HOST_GAME: {
            const { gameId, host } = action.data;
            const players = [{ name: getDefaultName(), clientId: `jnb-${gameId}`, clientNum: 0, isHost: true }];
            return { ...state, isHost: true, host, gameId, players };
        }
        case ACTION_TYPE.START_GAME: {
            if (!state.isHost || !state.host) {
                return state;
            }

            const { host } = state;
            host.isPlaying = true;
            host.broadcast({
                type: WEB_PACKET_TYPE.START_GAME,
                data: {
                    level: state.selectedLevel,
                    players: state.players,
                },
            });
            return { ...state, isGameStarted: true };
        }
        case ACTION_TYPE.TOGGLE_LEVEL_SELECTOR: {
            return { ...state, showLevelSelector: action.data };
        }
    }
};
