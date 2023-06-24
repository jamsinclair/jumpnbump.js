import { player_anims } from './animation';
import { rnd, toShort } from './c';
import { add_object, add_score } from './renderer';
import { dj_play_sfx } from './sdl/sound';
import { JNB_END_SCORE, JNB_MAX_PLAYERS, MOVEMENT, OBJ, SFX, SFX_FREQ } from './constants';
import ctx from './context';
import { get_gob } from './assets';
import Peer, { type DataConnection } from 'peerjs';

const TILE_SIZE = 16;
const MAX_POSITION_DIFFERENCE = 3 * TILE_SIZE;

type NetPacket = {
    cmd: NETCMD;
    arg?: string | number;
    arg2?: string | number;
    arg3?: string | number;
    arg4?: string | number;
    arg5?: string | number;
};

type NetworkState = {
    buggered_off: boolean;
    peer: Peer | null;
    sock: DataConnection | null;
    socketset: NetPacket[];
    movementTick: number;
};

const network_state: NetworkState = {
    buggered_off: false,
    peer: null,
    sock: null,
    socketset: [],
    movementTick: 0,
};
const net_info: {
    sock?: DataConnection;
    socketset: NetPacket[];
    hasBeenAcknowledged?: boolean;
    movementTick: number;
}[] = [];

export enum NETCMD {
    NACK = 0,
    ACK = 1,
    HELLO = 2,
    GREENLIGHT = 3,
    MOVE = 4,
    BYE = 5,
    POSITION = 6,
    ALIVE = 7,
    KILL = 8,
}

/**
 * In order to provide ever so slightly faster networking, we're going to use our own serializer
 * From my own testing, slightly faster to serialize than JSON.stringify and for small messages
 * a dramatically smaller byte size which should help with latency.
 */
export const serializePacket = (pkt: NetPacket) => {
    return Object.values(pkt).join(',');
};

export const deserializePacket = (str: string): NetPacket => {
    const [cmd, arg, arg2, arg3, arg4, arg5] = str.split(',');
    return {
        cmd: parseInt(cmd),
        arg,
        arg2,
        arg3,
        arg4,
        arg5,
    };
};

export function serverSendKillPacket(killer: number, victim: number) {
    const player = ctx.player;
    const pkt = {
        cmd: NETCMD.KILL,
        arg: killer,
        arg2: victim,
        arg3: player[victim].x,
        arg4: player[victim].y,
    };

    processKillPacket(pkt);
    if (ctx.is_net) {
        sendPacketToAll(pkt);
    }
}

function processAlivePacket(packet) {
    const player_id = Number(packet.arg);
    ctx.player[player_id].dead_flag = false;

    ctx.player[player_id].x = Number(packet.arg2);
    ctx.player[player_id].y = Number(packet.arg3);

    // Reset animation and frame info for player
    // This is a bit of a hack, but prevents a bug where players respawn
    // in different positions on host and client
    ctx.player[player_id].anim = 6;
    ctx.player[player_id].frame = 0;
    ctx.player[player_id].frame_tick = 0;
    ctx.player[player_id].x_add = 0;
    ctx.player[player_id].y_add = 0;
}

function processKillPacket(pkt: NetPacket) {
    const player = ctx.player;
    let c1 = Number(pkt.arg);
    let c2 = Number(pkt.arg2);
    let x = Number(pkt.arg3);
    let y = Number(pkt.arg4);
    let c4 = 0;
    let s1 = 0;

    const number_gobs = get_gob('numbers');

    player[c1].y_add = -player[c1].y_add;
    if (player[c1].y_add > -262144) player[c1].y_add = -262144;
    player[c1].jump_abort = 1;
    player[c2].dead_flag = true;
    if (player[c2].anim != 6) {
        player[c2].anim = 6;
        player[c2].frame = 0;
        player[c2].frame_tick = 0;
        player[c2].image = player_anims[player[c2].anim].frame[player[c2].frame].image + player[c2].direction * 9;
        if (!ctx.info.no_gore) {
            for (c4 = 0; c4 < 6; c4++)
                add_object(
                    OBJ.FUR,
                    (x >> 16) + 6 + rnd(5),
                    (y >> 16) + 6 + rnd(5),
                    (rnd(65535) - 32768) * 3,
                    (rnd(65535) - 32768) * 3,
                    0,
                    44 + c2 * 8
                );
            for (c4 = 0; c4 < 6; c4++)
                add_object(
                    OBJ.FLESH,
                    (x >> 16) + 6 + rnd(5),
                    (y >> 16) + 6 + rnd(5),
                    (rnd(65535) - 32768) * 3,
                    (rnd(65535) - 32768) * 3,
                    0,
                    76
                );
            for (c4 = 0; c4 < 6; c4++)
                add_object(
                    OBJ.FLESH,
                    (x >> 16) + 6 + rnd(5),
                    (y >> 16) + 6 + rnd(5),
                    (rnd(65535) - 32768) * 3,
                    (rnd(65535) - 32768) * 3,
                    0,
                    77
                );
            for (c4 = 0; c4 < 8; c4++)
                add_object(
                    OBJ.FLESH,
                    (x >> 16) + 6 + rnd(5),
                    (y >> 16) + 6 + rnd(5),
                    (rnd(65535) - 32768) * 3,
                    (rnd(65535) - 32768) * 3,
                    0,
                    78
                );
            for (c4 = 0; c4 < 10; c4++)
                add_object(
                    OBJ.FLESH,
                    (x >> 16) + 6 + rnd(5),
                    (y >> 16) + 6 + rnd(5),
                    (rnd(65535) - 32768) * 3,
                    (rnd(65535) - 32768) * 3,
                    0,
                    79
                );
        }
        dj_play_sfx(SFX.DEATH, toShort(SFX_FREQ.DEATH + rnd(2000) - 1000), 64, 0, 0, -1);
        player[c1].bumps++;
        if (player[c1].bumps >= JNB_END_SCORE) {
            // endscore_reached = 1;
        }
        player[c1].bumped[c2]++;
        s1 = player[c1].bumps % 100;
        add_score(c1, 0, 360, 34 + c1 * 64, Math.floor(s1 / 10), number_gobs);
        add_score(c1, 1, 376, 34 + c1 * 64, s1 % 10, number_gobs);
    }
}

function processMovePacket(pkt: NetPacket, is_local?: boolean) {
    const player = ctx.player;
    const player_id = Number(pkt.arg);
    const movement_type = Number(pkt.arg2[0]);
    const new_val = pkt.arg2[1] === '1';
    const packetMovementTick = Number(pkt.arg5);

    if (player_id === ctx.client_player_num && !is_local) {
        return;
    }

    if (ctx.is_server && !is_local) {
        if (packetMovementTick < net_info[player_id].movementTick) {
            // Ignore packets that arrive after a newer one has already been processed
            // This can happen if a packet is delayed in transit
            return;
        }

        net_info[player_id].movementTick = packetMovementTick;
    }

    if (movement_type == MOVEMENT.LEFT) {
        player[player_id].action_left = new_val;
    } else if (movement_type == MOVEMENT.RIGHT) {
        player[player_id].action_right = new_val;
    } else if (movement_type == MOVEMENT.UP) {
        player[player_id].action_up = new_val;
    } else {
        console.log('bogus MOVE packet!\n');
    }

    const newX = Number(pkt.arg3);
    const newY = Number(pkt.arg4);

    const dx = Math.abs(newX - ctx.player[player_id].x) >> 16;
    const dy = Math.abs(newY - ctx.player[player_id].y) >> 16;

    if (dx < MAX_POSITION_DIFFERENCE && dy < MAX_POSITION_DIFFERENCE) {
        // Ignore packets that are too close to our current position
        // This helps prevent jittery movement of other players
        return;
    }

    player[player_id].x = Number(pkt.arg3);
    player[player_id].y = Number(pkt.arg4);
}

function processPositionPacket(packet) {
    const player_id = packet.arg;
    const newX = Number(packet.arg2);
    const newY = Number(packet.arg3);
    console.log(`got position packet Player: ${packet.arg} | X: ${packet.arg2} | Y: ${packet.arg3}`)

    const dx = Math.abs(newX - ctx.player[player_id].x) >> 16;
    const dy = Math.abs(newY - ctx.player[player_id].y) >> 16;

    if (dx < MAX_POSITION_DIFFERENCE && dy < MAX_POSITION_DIFFERENCE) {
        // Ignore packets that are too close to our current position
        // This helps prevent jittery movement of other players
        return;
    }


    ctx.player[player_id].x = newX;
    ctx.player[player_id].y = newY;
}

export function tellServerPlayerMoved(player_id: number, movement_type: MOVEMENT, new_val: boolean) {
    const player = ctx.player;
    const pkt: NetPacket = {
        cmd: NETCMD.MOVE,
        arg: player_id,
        arg2: `${movement_type}${new_val ? 1 : 0}`,
        arg3: player[player_id].x,
        arg4: player[player_id].y,
        arg5: ++network_state.movementTick,
    };

    // Always process the move on the client.
    // This gives feedback to the player immediately and makes non-host players feel more responsive.
    //
    // It will mean that the game logic is not 100% in sync with the server and invalid deaths may occur.
    // This is a tradeoff I'm willing to make to get an MVP Peer-to-Peer mode working.
    // A large refactor and new network approach would be needed to add more integrity for online play.
    processMovePacket(pkt, true);

    if (ctx.is_server) {
        if (ctx.is_net) {
            sendPacketToAll(pkt);
        }
    } else {
        sendPacketToSock(network_state.sock, pkt);
    }
}

export function serverSendAlive(player_id: number) {
    if (!ctx.is_server) {
        return;
    }

    const packet = {
        cmd: NETCMD.ALIVE,
        arg: player_id,
        arg2: ctx.player[player_id].x,
        arg3: ctx.player[player_id].y,
    };
    sendPacketToAll(packet);
}

export function serverTellEveryoneGoodbye() {
    const { buggered_off, peer } = network_state;
    if (!buggered_off) {
        network_state.buggered_off = true;
        for (let i = 0; i < JNB_MAX_PLAYERS; i++) {
            if (ctx.player[i].enabled) {
                const newPacket = {
                    cmd: NETCMD.BYE,
                    arg: i,
                };
                sendPacketToAll(newPacket);
            }
        }
    }
    if (peer) {
        setTimeout(() => {
            peer.destroy();
            network_state.peer = null;
        }, 1000);
    }
}

export function tellServerGoodbye() {
    if (!network_state.buggered_off) {
        network_state.buggered_off = true;
        const packet = {
            cmd: NETCMD.BYE,
            arg: ctx.client_player_num,
        };
        sendPacketToSock(network_state.sock, packet);
    }
}

export function update_players_from_clients() {
    if (!ctx.is_server) {
        return;
    }

    for (let i = 0; i < JNB_MAX_PLAYERS; i++) {
        if (i === ctx.client_player_num || !ctx.player[i].enabled) {
            continue;
        }

        const playerId = i;
        net_info[playerId].socketset.forEach((packet: NetPacket) => {
            if (packet.cmd === NETCMD.POSITION) {
                processPositionPacket(packet);
                for (i = 0; i < JNB_MAX_PLAYERS; i++) {
                    if (i != playerId) {
                        sendPacket(i, packet);
                    }
                }
            } else if (packet.cmd === NETCMD.MOVE) {
                processMovePacket(packet);
                sendPacketToAll(packet);
            } else {
                console.warn(`SERVER: Got unknown packet ${packet.cmd}`);
            }
        });

        net_info[playerId].socketset = [];
    }
}

export function update_players_from_server(): boolean {
    const { player } = ctx;
    const { socketset } = network_state;
    if (ctx.is_server) {
        return false;
    }

    const packets = socketset.splice(0, socketset.length);

    packets.forEach((packet) => {
        if (packet.cmd === NETCMD.BYE) {
            player[Number(packet.arg)].enabled = false;
        } else if (packet.cmd === NETCMD.MOVE) {
            processMovePacket(packet);
        } else if (packet.cmd === NETCMD.ALIVE) {
            processAlivePacket(packet);
        } else if (packet.cmd === NETCMD.POSITION) {
            processPositionPacket(packet);
        } else if (packet.cmd === NETCMD.KILL) {
            processKillPacket(packet);
        } else {
            console.warn(`CLIENT: Got an unknown packet: ${packet.cmd}`);
        }
    });

    return true;
}

export function tellServerNewPosition() {
    const { client_player_num, is_server } = ctx;
    const newPacket = {
      cmd: NETCMD.POSITION,
      arg: client_player_num,
      arg2: ctx.player[client_player_num].x,
      arg3: ctx.player[client_player_num].y,
      arg4: ++network_state.movementTick,
    };
    if (is_server) {
      sendPacketToAll(newPacket);
    } else {
      sendPacketToSock(network_state.sock, newPacket);
    }
}

/**
 * This code differs from the libregames network initialization code.
 * Rather than handle the connection of peers, we leave that to the consumer.
 * They need to pass in a list of PeerJS Connections, and we will handle the rest.
 * The first socket is the server (Peer), and the rest are clients (DataConnection).
 */
export function init_server(sockets: [Peer, ...DataConnection[]]): Promise<void> {
    reset_network_state();

    ctx.client_player_num = 0;
    ctx.player[ctx.client_player_num].enabled = true;
    network_state.peer = sockets[0];
    net_info[0] = {
        sock: null,
        socketset: [],
        hasBeenAcknowledged: true,
        movementTick: 0,
    };

    const expectedNumberOfPlayers = sockets.filter(Boolean).length;

    return new Promise((resolve, reject) => {
        const greenlightPacket = {
            cmd: NETCMD.GREENLIGHT,
            arg: 1,
        };

        const greenlightTimeout = setTimeout(() => {
            console.warn('SERVER: Some players did not acknowledge and will not be connected - continuing anyway.');
            resolve();
            sendPacketToAll(greenlightPacket);
        }, 5000);

        const haveAllPlayersAcknowledged = () => {
            const numberOfPlayersAcknowledged = Object.values(net_info).filter((player) => {
                return player.hasBeenAcknowledged;
            }).length;
            return numberOfPlayersAcknowledged === expectedNumberOfPlayers;
        };

        for (let i = 1; i < JNB_MAX_PLAYERS; i++) {
            const socket = sockets[i] as DataConnection;

            if (socket) {
                greenlightPacket[`arg${i + 1}}`] = 0;

                socket.on('data', (data: string) => {
                    const packet = deserializePacket(data);
                    if (packet.cmd === NETCMD.HELLO) {
                        // Send an ACK to the client to let them know they are connected and what player number they are.
                        sendPacketToSock(socket, {
                            cmd: NETCMD.ACK,
                            arg: i,
                        });

                        greenlightPacket[`arg${i + 1}}`] = 1;
                        ctx.player[i].enabled = true;
                        net_info[i].hasBeenAcknowledged = true;

                        if (haveAllPlayersAcknowledged()) {
                            clearTimeout(greenlightTimeout);
                            resolve();
                            sendPacketToAll(greenlightPacket);
                        }

                        return;
                    }

                    net_info[i].socketset.push(packet);
                });
            }

            net_info[i] = {
                sock: socket,
                socketset: [],
                movementTick: 0,
            };
        }
    });
}

/**
 * This code differs from the libregames network initialization code.
 * Rather than handle connecting to the server, we leave that to the consumer.
 * They need to pass in the open connection with the server player (Using the PeerJS library).
 */
export async function connect_to_server(socket: DataConnection): Promise<void> {
    reset_network_state();
    network_state.sock = socket;

    return new Promise((resolve, reject) => {
        let haveBeenAcknowleged = false;

        sendPacketToSock(network_state.sock, {
            cmd: NETCMD.HELLO,
        });

        network_state.sock.on('data', (data: string) => {
            const packet = deserializePacket(data);

            if (!haveBeenAcknowleged && packet.cmd === NETCMD.ACK) {
                haveBeenAcknowleged = true;
                ctx.client_player_num = Number(packet.arg);
                console.log('CLIENT: Waiting for greenlight...');
            }

            if (haveBeenAcknowleged && packet.cmd === NETCMD.GREENLIGHT) {
                console.log('CLIENT: got greenlit.');

                for (let i = 0; i < JNB_MAX_PLAYERS; i++) {
                    const data = packet[i === 0 ? 'arg' : `arg${i + 1}`];
                    ctx.player[i].enabled = data === '1' ? true : false;
                }

                resolve();
                return;
            }

            network_state.socketset.push(packet);
        });
    });
}

function sendPacketToAll(pkt: NetPacket) {
    for (let i = 0; i < JNB_MAX_PLAYERS; i++) {
        sendPacket(i, pkt);
    }
}

function sendPacket(player_id, packet) {
    if (player_id < JNB_MAX_PLAYERS && player_id >= 0) {
        if (ctx.player[player_id].enabled && player_id != ctx.client_player_num) {
            sendPacketToSock(net_info[player_id]?.sock, packet);
        }
    }
}

function sendPacketToSock(socket: DataConnection | undefined, pkt: NetPacket) {
    socket && socket.send(serializePacket(pkt));
}

function reset_network_state() {
    network_state.buggered_off = false;
    network_state.peer = null;
    network_state.sock = null;
    network_state.socketset = [];
    net_info.splice(0, net_info.length);
}
