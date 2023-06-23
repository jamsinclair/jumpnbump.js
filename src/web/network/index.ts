import type { Peer } from 'peerjs';
import { ClientPlayer } from './client';
import { GameHost } from './host';

export type OnlinePlayer = {
    name: string;
    clientId: string;
    clientNum: number;
    isHost: boolean;
};

export type GameAlert =
    | { type: 'info'; title: string; content: string }
    | { type: 'error'; title: string; content: Error };

export type NetworkState = {
    gameAlert: GameAlert;
    client: ClientPlayer | null;
    gameId: string | null;
    host: GameHost | null;
    isConnected: boolean;
    isGameStarted: boolean;
    isHost: boolean;
    players: OnlinePlayer[];
    selectedLevel: string | null;
    showLevelSelector: boolean;
};

export const WEB_PACKET_TYPE = {
    NACK: 0,
    ACK: 1,
    HELLO: 2,
    START_GAME: 3,
    BYE: 5,
    PING: 7,
    PONG: 8,
    PLAYERS: 9,
    LEVEL: 10,
    UPDATE_NAME: 11,
} as const;

export type WebPacket = {
    type: (typeof WEB_PACKET_TYPE)[keyof typeof WEB_PACKET_TYPE];
    data?: any;
};

export const getShortPeerId = (peerId: string): string => {
    return peerId.slice(4, 17);
};

export const openPeer = async (id: string, timeoutMs = 5000): Promise<Peer> => {
    const { Peer } = await import('peerjs');

    return new Promise((resolve, reject) => {
        let resolved = false;
        let timeout = setTimeout(() => {
            if (!resolved) {
                reject(new Error('Peer open connection timed out'));
            }
        }, timeoutMs);

        const peer = new Peer(id);
        peer.on('open', (connection) => {
            resolved = true;
            clearTimeout(timeout);
            resolve(peer);
        });
        peer.on('error', (error) => {
            if (!resolved) {
                clearTimeout(timeout);
                reject(error);
            }
            console.error(error);
        });
    });
};
