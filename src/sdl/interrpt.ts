import { KEY } from "../constants";
import { poll_events } from "./events";

let lastTick = 0;
const TICK_LENGTH = 1000 / 60;

const keyb: Record<string, boolean> = {};

export const last_keys: string[] = new Array(50);

function add_last_key (key: string) {
    for (let i = 49; i > 0; i--) {
        last_keys[i] = last_keys[i - 1];
    }
    last_keys[0] = key;
}

function getTicks () {
    return performance.now();
};

export function key_pressed(key: string) {
	return keyb[key];
}

export function addkey (key: string, pressed: boolean = false) {
    return keyb[key] = pressed;
}

export function intr_sysupdate(): number {
    if (lastTick === 0) {
        lastTick = getTicks();
    }

    for (const event of poll_events()) {
        switch (event.type) {
            case "keydown":
            case "keyup":
                if (event.repeat) {
                    continue;
                }
                switch (event.scancode) {
                    case KEY.F10:
                        // todo toggle fullscreen
                        break;
                    case KEY.ONE:
                        // todo toggle ai
                        // release any pressed keys
                        addkey(KEY.PL1_LEFT, false);
                        addkey(KEY.PL1_RIGHT, false);
                        addkey(KEY.PL1_JUMP, false);
                    case KEY.TWO:
                        // todo toggle ai
                        // release any pressed keys
                        addkey(KEY.PL2_LEFT, false);
                        addkey(KEY.PL2_RIGHT, false);
                        addkey(KEY.PL2_JUMP, false);
                    case KEY.THREE:
                        // todo toggle ai
                        // release any pressed keys
                        addkey(KEY.PL3_LEFT, false);
                        addkey(KEY.PL3_RIGHT, false);
                        addkey(KEY.PL3_JUMP, false);
                    case KEY.FOUR:
                        // todo toggle ai
                        // release any pressed keys
                        addkey(KEY.PL4_LEFT, false);
                        addkey(KEY.PL4_RIGHT, false);
                        addkey(KEY.PL4_JUMP, false);
                    default:
                        if (event.type === 'keyup') {
                            add_last_key(event.key);
                        }
                        addkey(event.scancode, event.type === 'keydown');
                        break;
                }
                break;
            default:
                break;
        }
    }

    const nextTick = lastTick + TICK_LENGTH;
    const now = getTicks();
    let numOfTicks = 0;

    if (now > nextTick) {
        const timeSinceTick = now - lastTick;
        numOfTicks = Math.floor(timeSinceTick / TICK_LENGTH);

        lastTick = lastTick + (numOfTicks * TICK_LENGTH);
    }

	return numOfTicks;
}
