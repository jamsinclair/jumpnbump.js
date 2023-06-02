import { KEY } from '../constants';
import { poll_events } from './events';
import { toggle_fullscreen } from './gfx';
import ctx from '../context';

let lastTick = 0;
const TICK_LENGTH = 1000 / 60;

const keyb: Record<string, boolean> = {};

export const last_keys: string[] = new Array(50);

function add_last_key(key: string) {
    for (let i = 49; i > 0; i--) {
        last_keys[i] = last_keys[i - 1];
    }
    last_keys[0] = key;
}

function getTicks() {
    return performance.now();
}

export function key_pressed(key: string) {
    return keyb[key];
}

export function addkey(key: string, pressed: boolean = false) {
    return (keyb[key] = pressed);
}

export function intr_sysupdate(): number {
    if (lastTick === 0) {
        lastTick = getTicks();
    }

    for (const event of poll_events()) {
        switch (event.type) {
            case 'keydown':
            case 'keyup':
                if (event.repeat) {
                    continue;
                }
                switch (event.scancode) {
                    case KEY.ONE:
                        if (event.type === 'keydown') {
                            // console.log('toggle ai 1')
                            ctx.ai[0] = !ctx.ai[0] ? 1 : 0;
                        }
                        // release any pressed keys
                        addkey(KEY.PL1_LEFT, false);
                        addkey(KEY.PL1_RIGHT, false);
                        addkey(KEY.PL1_JUMP, false);
                        break;
                    case KEY.TWO:
                        if (event.type === 'keydown') {
                            ctx.ai[1] = !ctx.ai[1] ? 1 : 0;
                        }
                        // release any pressed keys
                        addkey(KEY.PL2_LEFT, false);
                        addkey(KEY.PL2_RIGHT, false);
                        addkey(KEY.PL2_JUMP, false);
                        break;
                    case KEY.THREE:
                        if (event.type === 'keydown') {
                            ctx.ai[2] = !ctx.ai[2] ? 1 : 0;
                        }
                        // release any pressed keys
                        addkey(KEY.PL3_LEFT, false);
                        addkey(KEY.PL3_RIGHT, false);
                        addkey(KEY.PL3_JUMP, false);
                        break;
                    case KEY.FOUR:
                        if (event.type === 'keydown') {
                            ctx.ai[3] = !ctx.ai[3] ? 1 : 0;
                        }
                        // release any pressed keys
                        addkey(KEY.PL4_LEFT, false);
                        addkey(KEY.PL4_RIGHT, false);
                        addkey(KEY.PL4_JUMP, false);
                        break;
                    case KEY.F:
                        if (event.key === 'F' && event.type === 'keydown') {
                            toggle_fullscreen();
                            break;
                        }
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

        lastTick = lastTick + numOfTicks * TICK_LENGTH;
    }

    return numOfTicks;
}
