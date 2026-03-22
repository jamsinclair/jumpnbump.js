import { MOVEMENT } from '../constants';
import { key_pressed, mouse_button_pressed } from './interrpt';
import { tellServerPlayerMoved } from '../network';
import ctx from '../context';

const client_player_num = -1;

function read_device_input(playerIndex: number, mappingIndex: number, gamepads: readonly (Gamepad | null)[]): boolean {
    const control = ctx.controls[playerIndex];
    if (!control) return false;

    const mapping = control.mappings[mappingIndex];
    if (mapping === undefined || mapping === '') return false;

    if (control.type === 'keyboard') {
        return key_pressed(mapping);
    }

    if (control.type === 'mouse') {
        return mouse_button_pressed(Number(mapping));
    }

    if (control.type === 'gamepad') {
        // Find the gamepad matching this device ID (format: "gamepad.id_gamepad.index")
        const gamepad = Array.from(gamepads).find((gp) => gp && `${gp.id}_${gp.index}` === control.id);
        if (!gamepad) return false;

        if (mapping.startsWith('button_')) {
            const buttonIndex = parseInt(mapping.replace('button_', ''), 10);
            return gamepad.buttons[buttonIndex]?.pressed ?? false;
        }

        if (mapping.startsWith('axis_')) {
            const parts = mapping.split('_'); // ['axis', index, 'pos'|'neg', baseline?]
            const axisIndex = parseInt(parts[1], 10);
            const direction = parts[2];
            const baseline = parts[3] !== undefined ? parseFloat(parts[3]) : 0;
            const value = gamepad.axes[axisIndex] ?? 0;
            return direction === 'pos' ? value - baseline > 0.5 : value - baseline < -0.5;
        }
    }

    return false;
}

export function update_player_actions() {
    const player = ctx.player;
    const gamepads = navigator.getGamepads();

    if (client_player_num < 0) {
        for (let i = 0; i < 4; i++) {
            let tmp = read_device_input(i, 0, gamepads); // left
            if (tmp !== player[i].action_left) tellServerPlayerMoved(i, MOVEMENT.LEFT, tmp);

            tmp = read_device_input(i, 1, gamepads); // right
            if (tmp !== player[i].action_right) tellServerPlayerMoved(i, MOVEMENT.RIGHT, tmp);

            tmp = read_device_input(i, 2, gamepads); // jump
            if (tmp !== player[i].action_up) tellServerPlayerMoved(i, MOVEMENT.UP, tmp);
        }
    } else {
        let tmp = read_device_input(client_player_num, 0, gamepads);
        if (tmp !== player[client_player_num].action_left) tellServerPlayerMoved(client_player_num, MOVEMENT.LEFT, tmp);

        tmp = read_device_input(client_player_num, 1, gamepads);
        if (tmp !== player[client_player_num].action_right)
            tellServerPlayerMoved(client_player_num, MOVEMENT.RIGHT, tmp);

        tmp = read_device_input(client_player_num, 2, gamepads);
        if (tmp !== player[client_player_num].action_up) tellServerPlayerMoved(client_player_num, MOVEMENT.UP, tmp);
    }
}
