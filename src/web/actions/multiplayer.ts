import { DataConnection } from 'peerjs';
import { Dispatch } from 'react';
import { WebPacket } from '../network';
import { ClientPlayer } from '../network/client';
import { GameHost } from '../network/host';

export const ACTION_TYPE = {
    CHANGE_LEVEL: 'changeLevel',
    CHANGE_NAME: 'changeName',
    CREATE_HOST_GAME: 'createHostGame',
    ERROR: 'error',
    HOST_DISCONNECTED: 'hostDisconnected',
    IS_CONNECTED: 'isConnected',
    JOIN_GAME: 'joinGame',
    LEAVE_GAME: 'leaveGame',
    RESET: 'reset',
    START_GAME: 'startGame',
    TOGGLE_LEVEL_SELECTOR: 'toggleLevelSelector',
    WEB_PACKET: 'webPacket',
} as const;

export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

type WebPacketAction = {
    type: typeof ACTION_TYPE.WEB_PACKET;
    data: WebPacket;
    socket: DataConnection;
};

type BaseAction = {
    type: Exclude<ActionType, typeof ACTION_TYPE.WEB_PACKET>;
    data: any;
};

export type Action = BaseAction | WebPacketAction;

const generateGameId = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 5;
    const randomChars = [...Array(length)].map(() => alphabet[Math.floor(Math.random() * alphabet.length)]);
    return randomChars.join('');
};

export const createHostGame = async (dispatch: Dispatch<Action>) => {
    const host = new GameHost();
    const gameId = generateGameId();
    dispatch({ type: ACTION_TYPE.CREATE_HOST_GAME, data: { gameId, host } });
    try {
        await host.start(gameId);
    } catch (error) {
        console.error(error);
        dispatch({ type: ACTION_TYPE.ERROR, data: error });
        return;
    }
    host.onData((packet, socket) => {
        dispatch({ type: ACTION_TYPE.WEB_PACKET, data: packet, socket });
    });
    dispatch({ type: ACTION_TYPE.IS_CONNECTED, data: { isConnected: true } });
};

export const joinGame = async (dispatch: Dispatch<Action>, gameId: string) => {
    const client = new ClientPlayer();
    dispatch({ type: ACTION_TYPE.JOIN_GAME, data: { client, gameId } });
    try {
        await client.start(gameId);
    } catch (error) {
        console.error(error);
        dispatch({ type: ACTION_TYPE.ERROR, data: error });
        return;
    }
    client.onData((packet) => {
        dispatch({ type: ACTION_TYPE.WEB_PACKET, data: packet, socket: client.conn });
    });
    client.onClose(() => {
        dispatch({ type: ACTION_TYPE.HOST_DISCONNECTED, data: {} });
    });
    dispatch({ type: ACTION_TYPE.IS_CONNECTED, data: { isConnected: true } });
};
