import { KEY } from "../constants";
import { SDL_Delay, SDL_GetTicks, SDL_PollEvent } from "./sdl";

const keyb: Record<string, boolean> = {};
let last_time = 0;

export function key_pressed(key: string) {
	return keyb[key];
}

export function addkey (key: string, pressed: boolean = false) {
    return keyb[key] = pressed;
}

export async function intr_sysupdate(): Promise<number> {
    let i = 0;
    let now, time_diff;

    for (const event of SDL_PollEvent()) {
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
                        addkey(event.scancode, event.type === 'keydown');
                        break;
                }
                break;
            default:
                break;
        }        
        i++;
    }

    await SDL_Delay(16);
	now = SDL_GetTicks();
	time_diff = now - last_time;
	if (time_diff > 0) {
		i = Math.floor(time_diff / (1000 / 60));
		if (i) {
			last_time = now;
		} else {
			let tmp = (1000 / 60) - i - 10;
			if (tmp > 0)
				await SDL_Delay(tmp);
		}
	}

	return i;
}
