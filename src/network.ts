import { MOVEMENT } from './constants';
import ctx from './context';

const player = ctx.player;
const is_server = true;

type NetPacket = {
    cmd: number;
    arg: number;
    arg2: any;
    arg3: any;
    arg4: any;
}

export function serverSendKillPacket(c1, c2) {
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
        // pkt.cmd = NETCMD_MOVE;
        cmd: 4,
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
		// if (is_net) {
		// 	sendPacketToAll(pkt);
        // }
	} else {
		// sendPacketToSock(sock, pkt);
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