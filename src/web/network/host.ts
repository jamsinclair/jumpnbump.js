import type { DataConnection, Peer } from 'peerjs';
import { WEB_PACKET_TYPE, WebPacket, openPeer } from './index';

const deferSocketClose = (socket: DataConnection) => {
    setTimeout(() => {
        try {
            socket.close();
        } catch (e) {
            console.error(e);
        }
    }, 500);
};

export class GameHost {
    gameId: string;
    clientId: string;
    sockets: DataConnection[] = [];
    peer: Peer;
    isPlaying: boolean = false;
    #onDataCallback = (_packet: WebPacket, connection?: DataConnection) => {};

    async #initPeer(): Promise<void> {
        this.peer = await openPeer(this.gameId);
        this.peer.on('connection', this.#handlePlayerConnection.bind(this));
    }

    async #handlePlayerConnection(clientSocket: DataConnection): Promise<void> {
        let isConnectionOpen = false;
        let isAckReceived = false;

        if (this.#hasMaxPlayers()) {
            clientSocket.send({
                type: WEB_PACKET_TYPE.NACK,
            });
            deferSocketClose(clientSocket);
            return;
        }

        clientSocket.on('open', () => {
            if (this.#hasMaxPlayers()) {
                clientSocket.send({
                    type: WEB_PACKET_TYPE.NACK,
                });
                deferSocketClose(clientSocket);
                return;
            }

            isConnectionOpen = true;
            console.log(`SERVER: Player connected ${clientSocket.peer}`);
            setTimeout(() => {
                if (!isAckReceived) {
                    clientSocket.send({
                        type: WEB_PACKET_TYPE.NACK,
                    });
                    deferSocketClose(clientSocket);
                }
            }, 2000);
        });

        clientSocket.on('close', () => {
            this.sockets = this.sockets.filter((sock) => sock.peer !== clientSocket.peer);
            this.#onDataCallback(
                {
                    type: WEB_PACKET_TYPE.BYE,
                },
                clientSocket
            );
            console.log(`SERVER: Player disconnected ${clientSocket.peer}`);
        });

        clientSocket.on('data', (packet: WebPacket) => {
            console.log('HOST: received packet', packet);

            if (!isConnectionOpen) {
                return;
            }

            if (packet.type === WEB_PACKET_TYPE.HELLO) {
                isAckReceived = true;
                this.sockets.push(clientSocket);
                console.log(`SERVER: Player acknowledged ${clientSocket.peer}`);
                clientSocket.send({
                    type: WEB_PACKET_TYPE.ACK,
                });
                // Echo the HELLO packet so it can be accessed by callback consumers
                this.#onDataCallback(packet, clientSocket);
                return;
            }

            if (this.isPlaying) {
                return;
            }

            this.#onDataCallback(packet, clientSocket);
        });
    }

    #hasMaxPlayers(): boolean {
        return this.sockets.length >= 3;
    }

    async start(gameId: string): Promise<void> {
        this.gameId = `jnb-${gameId}`;
        await this.#initPeer();
    }

    broadcast(packet: WebPacket) {
        this.sockets.forEach((sock) => sock.send(packet));
    }

    stop() {
        this.sockets.forEach((sock) => sock.close());

        if (this.peer) {
            this.peer.destroy();
        }
    }

    onData(callback: (packet: WebPacket, connection: DataConnection) => void) {
        this.#onDataCallback = callback;
    }

    getAllSockets(): [Peer, ...DataConnection[]] {
        const sockets = [this.peer, ...this.sockets];
        return sockets as [Peer, ...DataConnection[]];
    }
}
