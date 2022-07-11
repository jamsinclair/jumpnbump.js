import { player_anims } from './animation';
import { rnd, toShort } from './c';
import { JNB_END_SCORE } from './core';
import { add_leftovers, add_object, add_score } from './renderer';
import { dj_play_sfx } from './sdl/sound';
import { MOVEMENT, OBJ, SFX, SFX_FREQ } from './constants';
import ctx from './context';

const player = ctx.player;
const is_server = true;
const is_net = false;
const sock = null;

enum NETCMD {
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

type NetPacket = {
    cmd: NETCMD;
    arg: number;
    arg2: any;
    arg3: any;
    arg4: any;
}

export function serverSendKillPacket(killer: number, victim: number) {
    const pkt = {
        cmd: NETCMD.KILL,
        arg: killer,
        arg2: victim,
        arg3: player[victim].x,
        arg4: player[victim].y,
    };

	processKillPacket(pkt);
	if (is_net) {
		sendPacketToAll(pkt);
    }
}

function processKillPacket(pkt: NetPacket) {
	let c1 = pkt.arg;
	let c2 = pkt.arg2;
	let x = pkt.arg3;
	let y = pkt.arg4;
	let c4 = 0;
	let s1 = 0;

	player[c1].y_add = -player[c1].y_add;
	if (player[c1].y_add > -262144)
		player[c1].y_add = -262144;
	player[c1].jump_abort = 1;
	player[c2].dead_flag = true;
	if (player[c2].anim != 6) {
		player[c2].anim = 6;
		player[c2].frame = 0;
		player[c2].frame_tick = 0;
		player[c2].image = player_anims[player[c2].anim].frame[player[c2].frame].image + player[c2].direction * 9;
		if (!ctx.info.no_gore) {
			for (c4 = 0; c4 < 6; c4++)
				add_object(OBJ.FUR, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 44 + c2 * 8);
			for (c4 = 0; c4 < 6; c4++)
				add_object(OBJ.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 76);
			for (c4 = 0; c4 < 6; c4++)
				add_object(OBJ.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 77);
			for (c4 = 0; c4 < 8; c4++)
				add_object(OBJ.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 78);
			for (c4 = 0; c4 < 10; c4++)
				add_object(OBJ.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 79);
		}
		dj_play_sfx(SFX.DEATH, toShort((SFX_FREQ.DEATH + rnd(2000) - 1000)), 64, 0, 0, -1);
		player[c1].bumps++;
		if (player[c1].bumps >= JNB_END_SCORE) {
			// endscore_reached = 1;
		}
		player[c1].bumped[c2]++;
		s1 = player[c1].bumps % 100;
		add_score(c1, 0, 360, 34 + c1 * 64, Math.floor(s1 / 10), ctx.number_gobs);
		add_score(c1, 1, 376, 34 + c1 * 64, s1 % 10, ctx.number_gobs);
	}
}


export function processMovePacket(pkt: NetPacket) {
    const playerid = pkt.arg;
	const { movement_type, new_val } = pkt.arg2

	if (movement_type == MOVEMENT.LEFT) {
		player[playerid].action_left = new_val;
	} else if (movement_type == MOVEMENT.RIGHT) {
		player[playerid].action_right = new_val;
	} else if (movement_type == MOVEMENT.UP) {
		player[playerid].action_up = new_val;
	} else {
		console.log("bogus MOVE packet!\n");
	}

	player[playerid].x = pkt.arg3;
	player[playerid].y = pkt.arg4;
}

export function tellServerPlayerMoved(player_id: number, movement_type: MOVEMENT, new_val: boolean) {
    const pkt: NetPacket = {
        cmd: NETCMD.MOVE,
        arg: player_id,
        arg2: {
            movement_type,
            new_val,
        },
        arg3: player[player_id].x,
        arg4: player[player_id].y,
    };

	if (is_server) {
		processMovePacket(pkt);
		if (is_net) {
			sendPacketToAll(pkt);
        }
	} else {
		sendPacketToSock(sock, pkt);
	}
}

export function serverSendAlive(player_id: number) {

}

export function serverTellEveryoneGoodbye () {

}

export function tellServerGoodbye () {

}

export function update_players_from_clients () {
    
}

export function update_players_from_server (): boolean {
    return true;
}

export function tellServerNewPosition () {
    
}

function sendPacketToAll (pkt: NetPacket) {
}

function sendPacketToSock (sock: any, pkt: NetPacket) {
}
