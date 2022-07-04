import { register_background } from "./sdl/gfx";

export const cheats = {
    pogostick: false,
    bunnies_in_space: false,
    jetpack: false,
    lord_of_the_flies: false,
    blood_is_thicker_than_water: false,
};

const pal = [];

export function check_cheats (last_keys: string, clear: () => void) {
    if (last_keys == "kcitsogop") {
		cheats.pogostick = !cheats.pogostick;
		clear();
	}
	if (last_keys === "ecapsniseinnub") {
		cheats.bunnies_in_space = !cheats.bunnies_in_space;
		clear();
	}
	if (last_keys === "kcaptej") {
		cheats.jetpack = !cheats.jetpack;
		clear();
	}
	if (last_keys === "seilfehtfodrol") {
		cheats.lord_of_the_flies = !cheats.lord_of_the_flies;
		clear();
	}
	if (last_keys === "retawnahtrekcihtsidoolb") {
		const blood = [
			63, 32, 32, 53, 17, 17, 42, 7,
			7, 28, 0, 0, 24, 0, 0, 19,
			0, 0, 12, 0, 0, 7, 0, 0
        ];
		const water = [
			63, 63, 63, 40, 53, 62, 19, 42,
			60, 0, 33, 60, 3, 32, 46, 3,
			26, 33, 3, 19, 21, 1, 8, 8
        ];

		cheats.blood_is_thicker_than_water = !cheats.blood_is_thicker_than_water;
		if (cheats.blood_is_thicker_than_water) {
			for (let i = 0; i < 32; i++)
				pal[432 + i] = blood[i];
		} else {
			for (let i = 0; i < 32; i++)
				pal[432 + i] = water[i];
		}
		register_background(/*background_pic*/ [], pal);
        clear();
	}
}