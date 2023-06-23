import type { DataConnection, Peer } from 'peerjs';
import { WebPacket, OnlinePlayer, WEB_PACKET_TYPE, openPeer } from './index';

const generateClientId = () => `jnb-${window.crypto.randomUUID()}`;

export class ClientPlayer {
    gameId: string;
    clientId: string;
    peer: Peer;
    conn: DataConnection | null = null;
    isPlaying: boolean = false;
    #onDataCallback = (_packet: WebPacket) => {};
    #onCloseCallback = () => {};

    async #initPeer(): Promise<void> {
        this.clientId = generateClientId();
        this.peer = await openPeer(this.clientId);

        this.peer.on('connection', (c) => {
            c.on('open', function () {
                c.send('Client does not accept incoming connections');
                setTimeout(() => c.close(), 500);
            });
        });

        this.peer.on('disconnected', () => {
            console.log('CLIENT: Connection lost. Please reconnect');
            this.peer.reconnect();
        });

        this.peer.on('close', () => {
            this.peer = null;
            console.log('CLIENT: connection destroyed');
        });
    }

    async #connectToHost(gameId: string): Promise<void> {
        await this.#initPeer();
        this.gameId = `jnb-${gameId}`;
        this.conn = this.peer.connect(this.gameId);

        this.conn.on('open', () => {
            console.log(`CLIENT: connected to host ${this.gameId}`);
            console.log('CLIENT: Sending HELLO packet...');
            const packet = {
                type: WEB_PACKET_TYPE.HELLO,
            };
            this.conn.send(packet);
        });

        this.conn.on('close', () => {
            console.log('CLIENT: connection closed by host');
            this.conn = null;
            if (typeof this.#onCloseCallback === 'function') {
                this.#onCloseCallback();
            }
        });

        return new Promise((resolve, reject) => {
            let receivedAck = false;

            const handleConnectionTimeout = setTimeout(() => {
                console.log('CLIENT: Connection timed out');
                reject(new Error('Could not connect to host. Is the Game ID valid?'));
            }, 5000);

            this.conn.on('error', (err) => {
                console.error('CLIENT: error', err);
                if (!receivedAck) {
                    clearTimeout(handleConnectionTimeout);
                    reject();
                }
            });

            this.conn.on('data', (packet: WebPacket) => {
                if (this.isPlaying) {
                    return;
                }

                console.log('CLIENT: received packet', packet);

                if (!packet || typeof packet.type !== 'number') {
                    console.error('CLIENT: invalid packet received from server');
                    return;
                }

                if (!receivedAck && packet.type === WEB_PACKET_TYPE.NACK) {
                    console.log('CLIENT: Server forbid us from playing');
                    this.conn.close();
                    reject(new Error('Host lobby is full, too many players. Please try again later.'));
                    return;
                }

                if (!receivedAck && packet.type === WEB_PACKET_TYPE.ACK) {
                    receivedAck = true;
                    clearTimeout(handleConnectionTimeout);
                    resolve();
                    return;
                }

                if (typeof this.#onDataCallback === 'function') {
                    this.#onDataCallback(packet);
                }
            });
        });
    }

    async start(gameId: string): Promise<void> {
        return this.#connectToHost(gameId);
    }

    send(packet: WebPacket) {
        if (this.conn) {
            this.conn.send(packet);
        }
    }

    stop() {
        if (this.conn) {
            this.conn.close();
        }

        if (this.peer) {
            this.peer.destroy();
        }
    }

    onData(callback: (packet: WebPacket) => void) {
        this.#onDataCallback = callback;
    }

    onClose(callback: () => void) {
        this.#onCloseCallback = callback;
    }
}
