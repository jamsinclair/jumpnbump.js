import { last_keys } from './sdl/interrpt';
import { setpalette } from './sdl/gfx';

export const cheats = {
    pogostick: false,
    bunnies_in_space: false,
    jetpack: false,
    lord_of_the_flies: false,
    blood_is_thicker_than_water: false,
};

const clear = () => {
    last_keys.fill(undefined);
};

export function reset_cheats() {
    cheats.pogostick = false;
    cheats.bunnies_in_space = false;
    cheats.jetpack = false;
    cheats.lord_of_the_flies = false;
    cheats.blood_is_thicker_than_water = false;
}

export function check_cheats() {
    const last_keys_str = last_keys.join('');
    if (last_keys_str.includes('kcitsogop')) {
        cheats.pogostick = !cheats.pogostick;
        clear();
    }
    if (last_keys_str.includes('ecapsniseinnub')) {
        cheats.bunnies_in_space = !cheats.bunnies_in_space;
        clear();
    }
    if (last_keys_str.includes('kcaptej')) {
        cheats.jetpack = !cheats.jetpack;
        clear();
    }
    if (last_keys_str.includes('seilfehtfodrol')) {
        cheats.lord_of_the_flies = !cheats.lord_of_the_flies;
        clear();
    }
    if (last_keys_str.includes('retawnahtrekcihtsidoolb')) {
        const blood = [63, 32, 32, 53, 17, 17, 42, 7, 7, 28, 0, 0, 24, 0, 0, 19, 0, 0, 12, 0, 0, 7, 0, 0];
        const water = [63, 63, 63, 40, 53, 62, 19, 42, 60, 0, 33, 60, 3, 32, 46, 3, 26, 33, 3, 19, 21, 1, 8, 8];

        const pal = new Uint8ClampedArray(32);

        cheats.blood_is_thicker_than_water = !cheats.blood_is_thicker_than_water;
        if (cheats.blood_is_thicker_than_water) {
            for (let i = 0; i < 24; i++) pal[i] = blood[i];
        } else {
            for (let i = 0; i < 24; i++) pal[i] = water[i];
        }
        setpalette(144, 32, pal);

        clear();
    }
}
