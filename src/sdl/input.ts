import { KEY, MOVEMENT } from '../constants';
import { key_pressed } from './interrpt';
import { tellServerPlayerMoved } from '../network';
import ctx from '../context';

const client_player_num = -1;
const player = ctx.player;

export function update_player_actions() {
    let tmp = false;
    if (client_player_num < 0) {
        tmp = key_pressed(KEY.PL1_LEFT);
        if (tmp != player[0].action_left) tellServerPlayerMoved(0, MOVEMENT.LEFT, tmp);
        tmp = key_pressed(KEY.PL1_RIGHT);
        if (tmp != player[0].action_right) tellServerPlayerMoved(0, MOVEMENT.RIGHT, tmp);
        tmp = key_pressed(KEY.PL1_JUMP);
        if (tmp != player[0].action_up) tellServerPlayerMoved(0, MOVEMENT.UP, tmp);

        tmp = key_pressed(KEY.PL2_LEFT);
        if (tmp != player[1].action_left) tellServerPlayerMoved(1, MOVEMENT.LEFT, tmp);
        tmp = key_pressed(KEY.PL2_RIGHT);
        if (tmp != player[1].action_right) tellServerPlayerMoved(1, MOVEMENT.RIGHT, tmp);
        tmp = key_pressed(KEY.PL2_JUMP);
        if (tmp != player[1].action_up) tellServerPlayerMoved(1, MOVEMENT.UP, tmp);

        tmp = key_pressed(KEY.PL3_LEFT);
        if (tmp != player[2].action_left) tellServerPlayerMoved(2, MOVEMENT.LEFT, tmp);
        tmp = key_pressed(KEY.PL3_RIGHT);
        if (tmp != player[2].action_right) tellServerPlayerMoved(2, MOVEMENT.RIGHT, tmp);
        tmp = key_pressed(KEY.PL3_JUMP);
        if (tmp != player[2].action_up) tellServerPlayerMoved(2, MOVEMENT.UP, tmp);

        tmp = key_pressed(KEY.PL4_LEFT);
        if (tmp != player[3].action_left) tellServerPlayerMoved(3, MOVEMENT.LEFT, tmp);
        tmp = key_pressed(KEY.PL4_RIGHT);
        if (tmp != player[3].action_right) tellServerPlayerMoved(3, MOVEMENT.RIGHT, tmp);
        tmp = key_pressed(KEY.PL4_JUMP);
        if (tmp != player[3].action_up) tellServerPlayerMoved(3, MOVEMENT.UP, tmp);
    } else {
        tmp = key_pressed(KEY.PL1_LEFT);
        if (tmp != player[client_player_num].action_left) tellServerPlayerMoved(client_player_num, MOVEMENT.LEFT, tmp);
        tmp = key_pressed(KEY.PL1_RIGHT);
        if (tmp != player[client_player_num].action_right)
            tellServerPlayerMoved(client_player_num, MOVEMENT.RIGHT, tmp);
        tmp = key_pressed(KEY.PL1_JUMP);
        if (tmp != player[client_player_num].action_up) tellServerPlayerMoved(client_player_num, MOVEMENT.UP, tmp);
    }
}
