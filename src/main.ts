import { object_anims, player_anims } from './animation';
import { cheats, check_cheats } from './cheats';
import { BAN, KEY, MOD, OBJ, OBJ_ANIM, SFX, SFX_FREQ } from './constants';
import * as core from './core';
import { dj_deinit, dj_init, dj_mix, dj_play_sfx, dj_ready_mod, dj_set_mod_volume, dj_set_nosound, dj_set_sfx_volume, dj_start_mod, dj_stop, dj_stop_mod, dj_stop_sfx_channel } from './sdl/sound';
import { update_player_actions } from './sdl/input';
import { addkey, intr_sysupdate, key_pressed } from './sdl/interrpt';
import { GET_BAN_MAP_IN_WATER, GET_BAN_MAP_TILE, GET_BAN_MAP_XY, SET_BAN_MAP } from './level';
import { serverSendAlive, serverSendKillPacket, serverTellEveryoneGoodbye, tellServerGoodbye, tellServerNewPosition, update_players_from_clients, update_players_from_server } from './network';
import { add_leftovers, add_object, add_pob, draw_flies, draw_leftovers, draw_pobs, position_flies, redraw_flies_background, update_flies } from './renderer';
import { memset, rnd } from './c';
import { draw_begin, draw_end, fillpalette, put_text, register_mask, setpalette } from './sdl/gfx';
import { preread_datafile, read_gob, read_level, read_pcx } from './data';
import { menu } from './menu';
import ctx from './context';

let rabbit_gobs;
let font_gobs;
let object_gobs;
let number_gobs;

const main_info = ctx.info;
const player = ctx.player;
const ai = ctx.ai;
const objects = ctx.objects;
const joy = {};
const mouse = {};

let endscore_reached = 0;

const pal = new Array(256);
const cur_pal = new Array(256);

const is_server = false;
const is_net = false;

const flip = false;

let client_player_num = -1;
let server_said_bye = 0;

const flies_enabled = true;

function flip_pixels(pixels)
{
	let temp: number = 0;

	for (let y = 0; y < core.JNB_HEIGHT; y++) {
		for (let x = 0; x < (352 / 2); x++) {
			temp = pixels[y * core.JNB_WIDTH + x];
			pixels[y * core.JNB_WIDTH + x] = pixels[y * core.JNB_WIDTH + (352 - x) - 1];
			pixels[y * core.JNB_WIDTH + (352 - x) - 1] = temp;
		}
	}
}

function player_kill (c1: number, c2: number) {
    if (player[c1].y_add >= 0) {
		if (/* is_server */ false)
			serverSendKillPacket(c1, c2);
	} else {
		if (player[c2].y_add < 0)
			player[c2].y_add = 0;
	}
}

function collision_check () {
    let c1 = 0, c2 = 0, c3 = 0;
    let l1;

	/* collision check */
	for (c3 = 0; c3 < 6; c3++) {
		if (c3 == 0) {
			c1 = 0;
			c2 = 1;
		} else if (c3 == 1) {
			c1 = 0;
			c2 = 2;
		} else if (c3 == 2) {
			c1 = 0;
			c2 = 3;
		} else if (c3 == 3) {
			c1 = 1;
			c2 = 2;
		} else if (c3 == 4) {
			c1 = 1;
			c2 = 3;
		} else if (c3 == 5) {
			c1 = 2;
			c2 = 3;
		}
		if (player[c1].enabled && player[c2].enabled) {
			if (Math.abs(player[c1].x - player[c2].x) < (12 << 16) && Math.abs(player[c1].y - player[c2].y) < (12 << 16)) {
				if ((Math.abs(player[c1].y - player[c2].y) >> 16) > 5) {
					if (player[c1].y < player[c2].y) {
						player_kill(c1, c2);
					} else {
						player_kill(c2, c1);
					}
				} else {
					if (player[c1].x < player[c2].x) {
						if (player[c1].x_add > 0) {
							player[c1].x = player[c2].x - (12 << 16);
                        }
						else if (player[c2].x_add < 0) {
							player[c2].x = player[c1].x + (12 << 16);
                        } else {
							player[c1].x -= player[c1].x_add;
							player[c2].x -= player[c2].x_add;
						}
						l1 = player[c2].x_add;
						player[c2].x_add = player[c1].x_add;
						player[c1].x_add = l1;
						if (player[c1].x_add > 0)
							player[c1].x_add = -player[c1].x_add;
						if (player[c2].x_add < 0)
							player[c2].x_add = -player[c2].x_add;
					} else {
						if (player[c1].x_add > 0) {
							player[c2].x = player[c1].x - (12 << 16);
                        } else if (player[c2].x_add < 0) {
							player[c1].x = player[c2].x + (12 << 16);
                        } else {
							player[c1].x -= player[c1].x_add;
							player[c2].x -= player[c2].x_add;
						}
						l1 = player[c2].x_add;
						player[c2].x_add = player[c1].x_add;
						player[c1].x_add = l1;
						if (player[c1].x_add < 0)
							player[c1].x_add = -player[c1].x_add;
						if (player[c2].x_add > 0)
							player[c2].x_add = -player[c2].x_add;
					}
				}
			}
		}
	}
}

function game_loop () {
	let mod_vol, sfx_vol;
	let update_count = 1;
	let end_loop_flag = 0;
	let fade_flag = 0;
	let update_palette = 0;
	let mod_fade_direction;

	mod_vol = sfx_vol = 0;
	mod_fade_direction = 1;
	dj_ready_mod(MOD.GAME);
	dj_set_mod_volume(mod_vol);
	dj_set_sfx_volume(mod_vol);
	dj_start_mod();

	intr_sysupdate();

	endscore_reached = 0;
	while (1) {
		while (update_count) {

			if (endscore_reached || (key_pressed(KEY.ESCAPE) == 1)) {
				if (is_net) {
					if (is_server) {
						serverTellEveryoneGoodbye();
					} else {
						tellServerGoodbye();
					}
				}
				end_loop_flag = 1;
                memset(pal, 0, 768);
				mod_fade_direction = 0;
			}

			check_cheats('', () => {});

			if (is_net) {
				if (is_server) {
					update_players_from_clients();
				} else {
					if (!update_players_from_server()) {
						break; /* got a BYE packet */
					}
				}
			}

			steer_players();

			dj_mix();

			collision_check();

			dj_mix();

			main_info.page_info[main_info.draw_page].num_pobs = 0;
			for (let i = 0; i < core.JNB_MAX_PLAYERS; i++) {
				if (player[i].enabled)
					main_info.page_info[main_info.draw_page].num_pobs++;
			}

			update_objects();

			dj_mix();

			if (flies_enabled) {
				update_flies(update_count);
			}

			dj_mix();

			if (update_count == 1) {
				let c2;

				for (let i = 0, c2 = 0; i < core.JNB_MAX_PLAYERS; i++) {
					if (player[i].enabled) {
						main_info.page_info[main_info.draw_page].pobs[c2].x = player[i].x >> 16;
						main_info.page_info[main_info.draw_page].pobs[c2].y = player[i].y >> 16;
						main_info.page_info[main_info.draw_page].pobs[c2].image = player[i].image + i * 18;
						main_info.page_info[main_info.draw_page].pobs[c2].pob_data = rabbit_gobs;
						c2++;
					}
				}

				draw_begin();

				draw_pobs(main_info.draw_page);

				dj_mix();

				if (flies_enabled)
					draw_flies(main_info.draw_page);

				draw_end();
			}

			if (mod_fade_direction == 1) {
				if (mod_vol < 30) {
					mod_vol++;
					dj_set_mod_volume(mod_vol);
				}
				if (sfx_vol < 64) {
					sfx_vol++;
					dj_set_sfx_volume(sfx_vol);
				}
			} else {
				if (mod_vol > 0) {
					mod_vol--;
					dj_set_mod_volume(mod_vol);
				}
				if (sfx_vol > 0) {
					sfx_vol--;
					dj_set_sfx_volume(sfx_vol);
				}
			}

			fade_flag = 0;
			for (let i = 0; i < 768; i++) {
				if (cur_pal[i] < pal[i]) {
					cur_pal[i]++;
					fade_flag = 1;
				} else if (cur_pal[i] > pal[i]) {
					cur_pal[i]--;
					fade_flag = 1;
				}
			}
			if (fade_flag == 1)
				update_palette = 1;
			if (fade_flag == 0 && end_loop_flag == 1)
				break;

			if (update_count == 1) {
				if (update_palette == 1) {
					setpalette(0, 768, cur_pal);
					update_palette = 0;
				}

				main_info.draw_page ^= 1;
				main_info.view_page ^= 1;

				draw_begin();

				if (flies_enabled)
					redraw_flies_background(main_info.draw_page);

				draw_leftovers(main_info.draw_page);

				draw_end();
			}

			update_count--;
		}

		if (is_net) {
			if ((!player[client_player_num].dead_flag) &&
				((player[client_player_num].action_left) ||
				 (player[client_player_num].action_right) ||
				 (player[client_player_num].action_up) ||
				 (player[client_player_num].jump_ready == 0))) {
				tellServerNewPosition();
			}
		}

		update_count = intr_sysupdate();

		if (is_net) {
			if ((server_said_bye) || ((fade_flag == 0) && (end_loop_flag == 1)))
				break;
		} else {
			if ((fade_flag == 0) && (end_loop_flag == 1))
			break;
        }
	}
}

async function menu_loop ()
{
	let mod_vol;
	let c1, c2;
    console.log('start of menu_loop');

	for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) // reset player values
	{
		ai[c1] = 0;
	}

    let break_me = 1;
	while (break_me) {
        console.log('in first loop');
		if (!is_net) {
			if (menu() != 0) {
				deinit_program();
                break;
                return;
            }
        }
        console.log('after menu');
        return;
		if (key_pressed(KEY.ESCAPE) == 1) {
			return 0;
		}
		if (await init_level(0, pal) != 0) {
			deinit_level();
			deinit_program();
		}

        memset(cur_pal, 0, 768);
		setpalette(0, 768, cur_pal);

		if (flies_enabled) {
            position_flies();
		}

		if (flies_enabled) {
			dj_play_sfx(SFX.FLY, SFX_FREQ.FLY, 0, 0, 0, 4);
        }

		dj_set_nosound(0);

		main_info.page_info[0].num_pobs = 0;
		main_info.page_info[1].num_pobs = 0;
		main_info.view_page = 0;
		main_info.draw_page = 1;

		game_loop();

		if (is_net) {
			if (is_server) {
				serverTellEveryoneGoodbye();
			} else {
				if (!server_said_bye) {
					tellServerGoodbye();
				}
			}
		}

		main_info.view_page = 0;
		main_info.draw_page = 1;

		dj_stop_sfx_channel(4);

		deinit_level();

		main_info.page_info[main_info.view_page].num_pobs = 0;

		for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
			const x = [100, 160, 220, 280]
            const y = [80, 110, 140, 170];

			add_pob(main_info.view_page, 60, y[c1] - 2, c1 * 18, rabbit_gobs);
			// crushed sprites for the columns
			add_pob(main_info.view_page, x[c1] - 5, 30, 17 + c1 * 18, rabbit_gobs);
		}

		draw_begin();

		draw_pobs(main_info.view_page);

		put_text(main_info.view_page, 100, 50, "DOTT", 2);
		put_text(main_info.view_page, 160, 50, "JIFFY", 2);
		put_text(main_info.view_page, 220, 50, "FIZZ", 2);
		put_text(main_info.view_page, 280, 50, "MIJJI", 2);
		put_text(main_info.view_page, 40, 80, "DOTT", 2);
		put_text(main_info.view_page, 40, 110, "JIFFY", 2);
		put_text(main_info.view_page, 40, 140, "FIZZ", 2);
		put_text(main_info.view_page, 40, 170, "MIJJI", 2);

		for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
			if (!player[c1].enabled) {
				continue;
			}

			for (c2 = 0; c2 < core.JNB_MAX_PLAYERS; c2++) {
				if (!player[c2].enabled) {
					continue;
				}
				if (c2 != c1) {
					const bumped = player[c1].bumped[c2];
					put_text(main_info.view_page, 100 + c2 * 60, 80 + c1 * 30, bumped.toString(), 2);
				} else {
					put_text(main_info.view_page, 100 + c2 * 60, 80 + c1 * 30, "-", 2);
                }
			}
			const bumps = player[c1].bumps
			put_text(main_info.view_page, 350, 80 + c1 * 30, bumps.toString(), 2);
		}

		put_text(main_info.view_page, 200, 230, "Press ESC to continue", 2);

		draw_end();

		// loads menu into memory again

		/* fix dark font */
		for (c1 = 0; c1 < 16; c1++) {
			pal[(240 + c1) * 3 + 0] = c1 << 2;
			pal[(240 + c1) * 3 + 1] = c1 << 2;
			pal[(240 + c1) * 3 + 2] = c1 << 2;
		}

        memset(cur_pal, 0, 768);
		setpalette(0, 768, cur_pal);

		mod_vol = 0;
		dj_ready_mod(MOD.SCORES);
		dj_set_mod_volume(mod_vol);
		dj_start_mod();
		dj_set_nosound(0);

		while (key_pressed(KEY.ESCAPE) == 0) {
			if (mod_vol < 35)
				mod_vol++;
			dj_set_mod_volume(mod_vol);
			for (c1 = 0; c1 < 768; c1++) {
				if (cur_pal[c1] < pal[c1])
					cur_pal[c1]++;
			}
			dj_mix();
			intr_sysupdate();
			setpalette(0, 768, cur_pal);
		}
		while (key_pressed(KEY.ESCAPE) == 1) {
			dj_mix();
			intr_sysupdate();
		}

        memset(pal, 0, 768);

		while (mod_vol > 0) {
			mod_vol--;
			dj_set_mod_volume(mod_vol);
			for (c1 = 0; c1 < 768; c1++) {
				if (cur_pal[c1] > pal[c1])
					cur_pal[c1]--;
			}
			dj_mix();
			setpalette(0, 768, cur_pal);
		}

		fillpalette(0, 0, 0);

		dj_set_nosound(1);
		dj_stop_mod();

		if (is_net)
			return 0; /* don't go back to menu if in net game. */
	}
}


export async function main(argc: number, argv: string[]): Promise<number> {
	if (await init_program(argc, argv, pal) != 0)
		deinit_program();

	let result = await menu_loop();

	deinit_program();

	return result;
}

function player_action_left (c1: number) {
    let s1 = 0, s2 = 0;
	let below_left, below, below_right;

	s1 = (player[c1].x >> 16);
	s2 = (player[c1].y >> 16);
	below_left = GET_BAN_MAP_XY(s1, s2 + 16);
	below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
	below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);

	if (below == BAN.ICE) {
		if (player[c1].x_add > 0)
			player[c1].x_add -= 1024;
		else
			player[c1].x_add -= 768;
	} else if ((below_left != BAN.SOLID && below_right == BAN.ICE) || (below_left == BAN.ICE && below_right != BAN.SOLID)) {
		if (player[c1].x_add > 0)
			player[c1].x_add -= 1024;
		else
			player[c1].x_add -= 768;
	} else {
		if (player[c1].x_add > 0) {
			player[c1].x_add -= 16384;
			if (player[c1].x_add > -98304 && player[c1].in_water == 0 && below == BAN.SOLID)
				add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
		} else
			player[c1].x_add -= 12288;
	}
	if (player[c1].x_add < -98304)
		player[c1].x_add = -98304;
	player[c1].direction = 1;
	if (player[c1].anim == 0) {
		player[c1].anim = 1;
		player[c1].frame = 0;
		player[c1].frame_tick = 0;
		player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
	}
}

function player_action_right (c1: number) {
    let s1 = 0, s2 = 0;
	let below_left, below, below_right;

	s1 = (player[c1].x >> 16);
	s2 = (player[c1].y >> 16);
	below_left = GET_BAN_MAP_XY(s1, s2 + 16);
	below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
	below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);

	if (below == BAN.ICE) {
		if (player[c1].x_add < 0)
			player[c1].x_add += 1024;
		else
			player[c1].x_add += 768;
	} else if ((below_left != BAN.SOLID && below_right == BAN.ICE) || (below_left == BAN.ICE && below_right != BAN.SOLID)) {
		if (player[c1].x_add > 0)
			player[c1].x_add += 1024;
		else
			player[c1].x_add += 768;
	} else {
		if (player[c1].x_add < 0) {
			player[c1].x_add += 16384;
			if (player[c1].x_add < 98304 && player[c1].in_water == 0 && below == BAN.SOLID)
				add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
		} else
			player[c1].x_add += 12288;
	}
	if (player[c1].x_add > 98304)
		player[c1].x_add = 98304;
	player[c1].direction = 0;
	if (player[c1].anim == 0) {
		player[c1].anim = 1;
		player[c1].frame = 0;
		player[c1].frame_tick = 0;
		player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
	}
}

function map_tile (pos_x: number, pos_y: number) {
    let tile;

	pos_x = pos_x >> 4;
	pos_y = pos_y >> 4;

	if (pos_x < 0 || pos_x >= 17 || pos_y < 0 || pos_y >= 22)
		return BAN.VOID;

	tile = GET_BAN_MAP_TILE(pos_x, pos_y);
	return tile;
}

function cpu_move() {
	let lm, rm, jm;
	let i, j;
	let cur_posx, cur_posy, tar_posx, tar_posy;
	let players_distance;
    let target = null;
	let nearest_distance = -1;

	for (i = 0; i < core.JNB_MAX_PLAYERS; i++) {
		nearest_distance = -1;
		if (ai[i] && player[i].enabled) // this player is a computer
		{                               // get nearest target
			for (j = 0; j < core.JNB_MAX_PLAYERS; j++) {
				let deltax, deltay;

				if (i == j || !player[j].enabled)
					continue;

				deltax = player[j].x - player[i].x;
				deltay = player[j].y - player[i].y;
				players_distance = deltax * deltax + deltay * deltay;

				if (players_distance < nearest_distance || nearest_distance == -1) {
					target = player[j];
					nearest_distance = players_distance;
				}
			}

			if (target === null) {
                continue;
            }

			cur_posx = player[i].x >> 16;
			cur_posy = player[i].y >> 16;
			tar_posx = target.x >> 16;
			tar_posy = target.y >> 16;

			/** nearest player found, get him */
			/* here goes the artificial intelligence code */

			/* X-axis movement */
			if (tar_posx > cur_posx) // if true target is on the right side
			{                        // go after him
				lm = 0;
				rm = 1;
			} else // target on the left side
			{
				lm = 1;
				rm = 0;
			}

			if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0 &&
				tar_posx - cur_posx < 32 + 8 && tar_posx - cur_posx > -32) {
				lm = !lm;
				rm = !rm;
			} else if (tar_posx - cur_posx < 4 + 8 && tar_posx - cur_posx > -4) { // makes the bunnies less "nervous"
				lm = 0;
				lm = 0;
			}

			/* Y-axis movement */
			if (map_tile(cur_posx, cur_posy + 16) != BAN.VOID &&
				((i == 0 && key_pressed(KEY.PL1_JUMP)) ||
				 (i == 1 && key_pressed(KEY.PL2_JUMP)) ||
				 (i == 2 && key_pressed(KEY.PL3_JUMP)) ||
				 (i == 3 && key_pressed(KEY.PL4_JUMP))))
				jm = 0; // if we are on ground and jump key is being pressed,
						//first we have to release it or else we won't be able to jump more than once

			else if (map_tile(cur_posx, cur_posy - 8) != BAN.VOID &&
					 map_tile(cur_posx, cur_posy - 8) != BAN.WATER)
				jm = 0; // don't jump if there is something over it

			else if (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN.VOID &&
					 map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN.WATER &&
					 cur_posx > 16 && cur_posx < 352 - 16 - 8) // obstacle, jump
				jm = 1;                                        // if there is something on the way, jump over it

			else if (((i == 0 && key_pressed(KEY.PL1_JUMP)) ||
					  (i == 1 && key_pressed(KEY.PL2_JUMP)) ||
					  (i == 2 && key_pressed(KEY.PL3_JUMP)) ||
					  (i == 3 && key_pressed(KEY.PL4_JUMP))) &&
					 (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN.VOID &&
					  map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN.WATER))
				jm = 1; // this makes it possible to jump over 2 tiles

			else if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0 &&
					 tar_posx - cur_posx < 32 + 8 && tar_posx - cur_posx > -32) // don't jump - running away
				jm = 0;

			else if (tar_posy <= cur_posy) // target on the upper side
				jm = 1;
			else // target below
				jm = 0;

			/** Artificial intelligence done, now apply movements */
			if (lm) {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_LEFT;
				else if (i == 1)
					key = KEY.PL2_LEFT;
				else if (i == 2)
					key = KEY.PL3_LEFT;
				else
					key = KEY.PL4_LEFT;

				addkey(key);
			} else {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_LEFT;
				else if (i == 1)
					key = KEY.PL2_LEFT;
				else if (i == 2)
					key = KEY.PL3_LEFT;
				else
					key = KEY.PL4_LEFT;

				addkey(key);
			}

			if (rm) {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_RIGHT;
				else if (i == 1)
					key = KEY.PL2_RIGHT;
				else if (i == 2)
					key = KEY.PL3_RIGHT;
				else
					key = KEY.PL4_RIGHT;

				addkey(key);
			} else {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_RIGHT;
				else if (i == 1)
					key = KEY.PL2_RIGHT;
				else if (i == 2)
					key = KEY.PL3_RIGHT;
				else
					key = KEY.PL4_RIGHT;

				addkey(key);
			}

			if (jm) {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_JUMP;
				else if (i == 1)
					key = KEY.PL2_JUMP;
				else if (i == 2)
					key = KEY.PL3_JUMP;
				else
					key = KEY.PL4_JUMP;

				addkey(key);
			} else {
				let key: KEY;
				if (i == 0)
					key = KEY.PL1_JUMP;
				else if (i == 1)
					key = KEY.PL2_JUMP;
				else if (i == 2)
					key = KEY.PL3_JUMP;
				else
					key = KEY.PL4_JUMP;

				addkey(key);
			}
		}
	}
}

function steer_players() {
	let c1, c2;
	let s1 = 0, s2 = 0;

	cpu_move();
	update_player_actions();

	for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {

		if (player[c1].enabled) {

			if (!player[c1].dead_flag) {

				if (player[c1].action_left && player[c1].action_right) {
					if (player[c1].direction == 0) {
						if (player[c1].action_right) {
							player_action_right(c1);
						}
					} else {
						if (player[c1].action_left) {
							player_action_left(c1);
						}
					}
				} else if (player[c1].action_left) {
					player_action_left(c1);
				} else if (player[c1].action_right) {
					player_action_right(c1);
				} else if ((!player[c1].action_left) && (!player[c1].action_right)) {
					let below_left, below, below_right;

					s1 = (player[c1].x >> 16);
					s2 = (player[c1].y >> 16);
					below_left = GET_BAN_MAP_XY(s1, s2 + 16);
					below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
					below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);
					if (below == BAN.SOLID || below == BAN.SPRING || (((below_left == BAN.SOLID || below_left == BAN.SPRING) && below_right != BAN.ICE) || (below_left != BAN.ICE && (below_right == BAN.SOLID || below_right == BAN.SPRING)))) {
						if (player[c1].x_add < 0) {
							player[c1].x_add += 16384;
							if (player[c1].x_add > 0)
								player[c1].x_add = 0;
						} else {
							player[c1].x_add -= 16384;
							if (player[c1].x_add < 0)
								player[c1].x_add = 0;
						}
						if (player[c1].x_add != 0 && GET_BAN_MAP_XY((s1 + 8), (s2 + 16)) == BAN.SOLID)
							add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
					}
					if (player[c1].anim == 1) {
						player[c1].anim = 0;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					}
				}
				if (!cheats.jetpack) {
					/* no jetpack */
					if (cheats.pogostick || (player[c1].jump_ready == 1 && player[c1].action_up)) {
						s1 = (player[c1].x >> 16);
						s2 = (player[c1].y >> 16);
						if (s2 < -16)
							s2 = -16;
						/* jump */
						if (GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN.SOLID || GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN.ICE) {
							player[c1].y_add = -280000;
							player[c1].anim = 2;
							player[c1].frame = 0;
							player[c1].frame_tick = 0;
							player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							player[c1].jump_ready = 0;
							player[c1].jump_abort = 1;
							if (!cheats.pogostick) {
								dj_play_sfx(SFX.JUMP, (SFX_FREQ.JUMP + rnd(2000) - 1000), 64, 0, 0, -1);
                            } else {
								dj_play_sfx(SFX.SPRING, (SFX_FREQ.SPRING + rnd(2000) - 1000), 64, 0, 0, -1);
                            }
						}
						/* jump out of water */
						if (GET_BAN_MAP_IN_WATER(s1, s2)) {
							player[c1].y_add = -196608;
							player[c1].in_water = 0;
							player[c1].anim = 2;
							player[c1].frame = 0;
							player[c1].frame_tick = 0;
							player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							player[c1].jump_ready = 0;
							player[c1].jump_abort = 1;
							if (!cheats.pogostick) {
								dj_play_sfx(SFX.JUMP, (SFX_FREQ.JUMP + rnd(2000) - 1000), 64, 0, 0, -1);
                            } else {
								dj_play_sfx(SFX.SPRING, (SFX_FREQ.SPRING + rnd(2000) - 1000), 64, 0, 0, -1);
                            }
						}
					}
					/* fall down by gravity */
					if (!cheats.pogostick && (!player[c1].action_up)) {
						player[c1].jump_ready = 1;
						if (player[c1].in_water == 0 && player[c1].y_add < 0 && player[c1].jump_abort == 1) {
							if (!cheats.bunnies_in_space) {
								/* normal gravity */
								player[c1].y_add += 32768;
                            } else {
								/* light gravity */
								player[c1].y_add += 16384;
                            }
							if (player[c1].y_add > 0) {
								player[c1].y_add = 0;
                            }
						}
					}
				} else {
					/* with jetpack */
					if (player[c1].action_up) {
						player[c1].y_add -= 16384;
						if (player[c1].y_add < -400000)
							player[c1].y_add = -400000;
						if (GET_BAN_MAP_IN_WATER(s1, s2))
							player[c1].in_water = 0;
						if (rnd(100) < 50)
							add_object(OBJ.SMOKE, (player[c1].x >> 16) + 6 + rnd(5), (player[c1].y >> 16) + 10 + rnd(5), 0, 16384 + rnd(8192), OBJ_ANIM.SMOKE, 0);
					}
				}

				player[c1].x += player[c1].x_add;
				if ((player[c1].x >> 16) < 0) {
					player[c1].x = 0;
					player[c1].x_add = 0;
				}
				if ((player[c1].x >> 16) + 15 > 351) {
					player[c1].x = 336 << 16;
					player[c1].x_add = 0;
				}
				{
					if (player[c1].y > 0) {
						s2 = (player[c1].y >> 16);
					} else {
						/* check top line only */
						s2 = 0;
					}

					s1 = (player[c1].x >> 16);
					if (GET_BAN_MAP_XY(s1, s2) == BAN.SOLID || GET_BAN_MAP_XY(s1, s2) == BAN.ICE || GET_BAN_MAP_XY(s1, s2) == BAN.SPRING || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SPRING) {
						player[c1].x = (((s1 + 16) & 0xfff0)) << 16;
						player[c1].x_add = 0;
					}

					s1 = (player[c1].x >> 16);
					if (GET_BAN_MAP_XY((s1 + 15), s2) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN.SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SPRING) {
						player[c1].x = (((s1 + 16) & 0xfff0) - 16) << 16;
						player[c1].x_add = 0;
					}
				}

				player[c1].y += player[c1].y_add;

				s1 = (player[c1].x >> 16);
				s2 = (player[c1].y >> 16);
				if (s2 < 0)
					s2 = 0;
				if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN.SPRING || ((GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SPRING && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) != BAN.SOLID) || (GET_BAN_MAP_XY(s1, (s2 + 15)) != BAN.SOLID && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SPRING))) {
					player[c1].y = ((player[c1].y >> 16) & 0xfff0) << 16;
					player[c1].y_add = -400000;
					player[c1].anim = 2;
					player[c1].frame = 0;
					player[c1].frame_tick = 0;
					player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					player[c1].jump_ready = 0;
					player[c1].jump_abort = 0;
					for (c2 = 0; c2 < core.NUM_OBJECTS; c2++) {
						if (objects[c2].used == 1 && objects[c2].type == OBJ.SPRING) {
							if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN.SPRING) {
								if ((objects[c2].x >> 20) == ((s1 + 8) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
									objects[c2].frame = 0;
									objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
									objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
									break;
								}
							} else {
								if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SPRING) {
									if ((objects[c2].x >> 20) == (s1 >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
										objects[c2].frame = 0;
										objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
										objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
										break;
									}
								} else if (GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SPRING) {
									if ((objects[c2].x >> 20) == ((s1 + 15) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
										objects[c2].frame = 0;
										objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
										objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
										break;
									}
								}
							}
						}
					}
					dj_play_sfx(SFX.SPRING, (SFX_FREQ.SPRING + rnd(2000) - 1000), 64, 0, 0, -1);
				}
				s1 = (player[c1].x >> 16);
				s2 = (player[c1].y >> 16);
				if (s2 < 0)
					s2 = 0;
				if (GET_BAN_MAP_XY(s1, s2) == BAN.SOLID || GET_BAN_MAP_XY(s1, s2) == BAN.ICE || GET_BAN_MAP_XY(s1, s2) == BAN.SPRING || GET_BAN_MAP_XY((s1 + 15), s2) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN.SPRING) {
					player[c1].y = (((s2 + 16) & 0xfff0)) << 16;
					player[c1].y_add = 0;
					player[c1].anim = 0;
					player[c1].frame = 0;
					player[c1].frame_tick = 0;
					player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
				}
				s1 = (player[c1].x >> 16);
				s2 = (player[c1].y >> 16);
				if (s2 < 0)
					s2 = 0;
				if (GET_BAN_MAP_XY((s1 + 8), (s2 + 8)) == BAN.WATER) {
					if (player[c1].in_water == 0) {
						/* falling into water */
						player[c1].in_water = 1;
						player[c1].anim = 4;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
						if (player[c1].y_add >= 32768) {
							add_object(OBJ.SPLASH, (player[c1].x >> 16) + 8, ((player[c1].y >> 16) & 0xfff0) + 15, 0, 0, OBJ_ANIM.SPLASH, 0);
							if (!cheats.blood_is_thicker_than_water)
								dj_play_sfx(SFX.SPLASH, (SFX_FREQ.SPLASH + rnd(2000) - 1000), 64, 0, 0, -1);
							else
								dj_play_sfx(SFX.SPLASH, (SFX_FREQ.SPLASH + rnd(2000) - 5000), 64, 0, 0, -1);
						}
					}
					/* slowly move up to water surface */
					player[c1].y_add -= 1536;
					if (player[c1].y_add < 0 && player[c1].anim != 5) {
						player[c1].anim = 5;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					}
					if (player[c1].y_add < -65536)
						player[c1].y_add = -65536;
					if (player[c1].y_add > 65535)
						player[c1].y_add = 65535;
					if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.ICE) {
						player[c1].y = (((s2 + 16) & 0xfff0) - 16) << 16;
						player[c1].y_add = 0;
					}
				} else if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN.SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN.SPRING) {
					player[c1].in_water = 0;
					player[c1].y = (((s2 + 16) & 0xfff0) - 16) << 16;
					player[c1].y_add = 0;
					if (player[c1].anim != 0 && player[c1].anim != 1) {
						player[c1].anim = 0;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					}
				} else {
					if (player[c1].in_water == 0) {
						if (!cheats.bunnies_in_space)
							player[c1].y_add += 12288;
						else
							player[c1].y_add += 6144;
						if (player[c1].y_add > 327680)
							player[c1].y_add = 327680;
					} else {
						player[c1].y = (player[c1].y & 0xffff0000) + 0x10000;
						player[c1].y_add = 0;
					}
					player[c1].in_water = 0;
				}
				if (player[c1].y_add > 36864 && player[c1].anim != 3 && !player[c1].in_water) {
					player[c1].anim = 3;
					player[c1].frame = 0;
					player[c1].frame_tick = 0;
					player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
				}
			}

			player[c1].frame_tick++;
			if (player[c1].frame_tick >= player_anims[player[c1].anim].frame[player[c1].frame].ticks) {
				player[c1].frame++;
				if (player[c1].frame >= player_anims[player[c1].anim].num_frames) {
					if (player[c1].anim != 6)
						player[c1].frame = player_anims[player[c1].anim].restart_frame;
					else
						position_player(c1);
				}
				player[c1].frame_tick = 0;
			}
			player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
		}
	}
}

function position_player (player_num: number) {
	let c1;
	let s1, s2;

	while (1) {
		while (1) {
			s1 = rnd(22);
			s2 = rnd(16);
			if (GET_BAN_MAP_TILE(s2, s1) == BAN.VOID && (GET_BAN_MAP_TILE(s2 + 1, s1) == BAN.SOLID || GET_BAN_MAP_TILE(s2 + 1, s1) == BAN.ICE))
				break;
		}
		for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
			if (c1 != player_num && player[c1].enabled) {
				if (Math.abs((s1 << 4) - (player[c1].x >> 16)) < 32 && Math.abs((s2 << 4) - (player[c1].y >> 16)) < 32)
					break;
			}
		}
		if (c1 == core.JNB_MAX_PLAYERS) {
			player[player_num].x = s1 << 20;
			player[player_num].y = s2 << 20;
			player[player_num].x_add = player[player_num].y_add = 0;
			player[player_num].direction = 0;
			player[player_num].jump_ready = 1;
			player[player_num].in_water = 0;
			player[player_num].anim = 0;
			player[player_num].frame = 0;
			player[player_num].frame_tick = 0;
			player[player_num].image = player_anims[player[player_num].anim].frame[player[player_num].frame].image;

			if (is_server) {
				if (is_net)
					serverSendAlive(player_num);
				player[player_num].dead_flag = false;
			}

			break;
		}
	}
}

function update_objects () {
	let s1 = 0;

	for (let c1 = 0; c1 < core.NUM_OBJECTS; c1++) {
		if (objects[c1].used == 1) {
			switch (objects[c1].type) {
				case OBJ.SPRING:
					objects[c1].ticks--;
					if (objects[c1].ticks <= 0) {
						objects[c1].frame++;
						if (objects[c1].frame >= object_anims[objects[c1].anim].num_frames) {
							objects[c1].frame--;
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
						} else {
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].image, object_gobs);
					break;
				case OBJ.SPLASH:
					objects[c1].ticks--;
					if (objects[c1].ticks <= 0) {
						objects[c1].frame++;
						if (objects[c1].frame >= object_anims[objects[c1].anim].num_frames)
							objects[c1].used = 0;
						else {
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].image, object_gobs);
					break;
				case OBJ.SMOKE:
					objects[c1].x += objects[c1].x_add;
					objects[c1].y += objects[c1].y_add;
					objects[c1].ticks--;
					if (objects[c1].ticks <= 0) {
						objects[c1].frame++;
						if (objects[c1].frame >= object_anims[objects[c1].anim].num_frames)
							objects[c1].used = 0;
						else {
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].image, object_gobs);
					break;
				case OBJ.YEL_BUTFLY:
				case OBJ.PINK_BUTFLY:
					objects[c1].x_acc += rnd(128) - 64;
					if (objects[c1].x_acc < -1024)
						objects[c1].x_acc = -1024;
					if (objects[c1].x_acc > 1024)
						objects[c1].x_acc = 1024;
					objects[c1].x_add += objects[c1].x_acc;
					if (objects[c1].x_add < -32768)
						objects[c1].x_add = -32768;
					if (objects[c1].x_add > 32768)
						objects[c1].x_add = 32768;
					objects[c1].x += objects[c1].x_add;
					if ((objects[c1].x >> 16) < 16) {
						objects[c1].x = 16 << 16;
						objects[c1].x_add = -objects[c1].x_add >> 2;
						objects[c1].x_acc = 0;
					} else if ((objects[c1].x >> 16) > 350) {
						objects[c1].x = 350 << 16;
						objects[c1].x_add = -objects[c1].x_add >> 2;
						objects[c1].x_acc = 0;
					}
					if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 0) {
						if (objects[c1].x_add < 0) {
							objects[c1].x = (((objects[c1].x >> 16) + 16) & 0xfff0) << 16;
						} else {
							objects[c1].x = ((((objects[c1].x >> 16) - 16) & 0xfff0) + 15) << 16;
						}
						objects[c1].x_add = -objects[c1].x_add >> 2;
						objects[c1].x_acc = 0;
					}
					objects[c1].y_acc += rnd(64) - 32;
					if (objects[c1].y_acc < -1024)
						objects[c1].y_acc = -1024;
					if (objects[c1].y_acc > 1024)
						objects[c1].y_acc = 1024;
					objects[c1].y_add += objects[c1].y_acc;
					if (objects[c1].y_add < -32768)
						objects[c1].y_add = -32768;
					if (objects[c1].y_add > 32768)
						objects[c1].y_add = 32768;
					objects[c1].y += objects[c1].y_add;
					if ((objects[c1].y >> 16) < 0) {
						objects[c1].y = 0;
						objects[c1].y_add = -objects[c1].y_add >> 2;
						objects[c1].y_acc = 0;
					} else if ((objects[c1].y >> 16) > 255) {
						objects[c1].y = 255 << 16;
						objects[c1].y_add = -objects[c1].y_add >> 2;
						objects[c1].y_acc = 0;
					}
					if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 0) {
						if (objects[c1].y_add < 0) {
							objects[c1].y = (((objects[c1].y >> 16) + 16) & 0xfff0) << 16;
						} else {
							objects[c1].y = ((((objects[c1].y >> 16) - 16) & 0xfff0) + 15) << 16;
						}
						objects[c1].y_add = -objects[c1].y_add >> 2;
						objects[c1].y_acc = 0;
					}
					if (objects[c1].type == OBJ.YEL_BUTFLY) {
						if (objects[c1].x_add < 0 && objects[c1].anim != OBJ_ANIM.YEL_BUTFLY_LEFT) {
							objects[c1].anim = OBJ_ANIM.YEL_BUTFLY_LEFT;
							objects[c1].frame = 0;
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						} else if (objects[c1].x_add > 0 && objects[c1].anim != OBJ_ANIM.YEL_BUTFLY_RIGHT) {
							objects[c1].anim = OBJ_ANIM.YEL_BUTFLY_RIGHT;
							objects[c1].frame = 0;
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					} else {
						if (objects[c1].x_add < 0 && objects[c1].anim != OBJ_ANIM.PINK_BUTFLY_LEFT) {
							objects[c1].anim = OBJ_ANIM.PINK_BUTFLY_LEFT;
							objects[c1].frame = 0;
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						} else if (objects[c1].x_add > 0 && objects[c1].anim != OBJ_ANIM.PINK_BUTFLY_RIGHT) {
							objects[c1].anim = OBJ_ANIM.PINK_BUTFLY_RIGHT;
							objects[c1].frame = 0;
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					objects[c1].ticks--;
					if (objects[c1].ticks <= 0) {
						objects[c1].frame++;
						if (objects[c1].frame >= object_anims[objects[c1].anim].num_frames)
							objects[c1].frame = object_anims[objects[c1].anim].restart_frame;
						else {
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].image, object_gobs);
					break;
				case OBJ.FUR:
					if (rnd(100) < 30)
						add_object(OBJ.FLESH_TRACE, objects[c1].x >> 16, objects[c1].y >> 16, 0, 0, OBJ_ANIM.FLESH_TRACE, 0);
					if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 0) {
						objects[c1].y_add += 3072;
						if (objects[c1].y_add > 196608)
							objects[c1].y_add = 196608;
					} else if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 2) {
						if (objects[c1].x_add < 0) {
							if (objects[c1].x_add < -65536)
								objects[c1].x_add = -65536;
							objects[c1].x_add += 1024;
							if (objects[c1].x_add > 0)
								objects[c1].x_add = 0;
						} else {
							if (objects[c1].x_add > 65536)
								objects[c1].x_add = 65536;
							objects[c1].x_add -= 1024;
							if (objects[c1].x_add < 0)
								objects[c1].x_add = 0;
						}
						objects[c1].y_add += 1024;
						if (objects[c1].y_add < -65536)
							objects[c1].y_add = -65536;
						if (objects[c1].y_add > 65536)
							objects[c1].y_add = 65536;
					}
					objects[c1].x += objects[c1].x_add;
					if ((objects[c1].y >> 16) > 0 && (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 1 || GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 3)) {
						if (objects[c1].x_add < 0) {
							objects[c1].x = (((objects[c1].x >> 16) + 16) & 0xfff0) << 16;
							objects[c1].x_add = -objects[c1].x_add >> 2;
						} else {
							objects[c1].x = ((((objects[c1].x >> 16) - 16) & 0xfff0) + 15) << 16;
							objects[c1].x_add = -objects[c1].x_add >> 2;
						}
					}
					objects[c1].y += objects[c1].y_add;
					if ((objects[c1].x >> 16) < -5 || (objects[c1].x >> 16) > 405 || (objects[c1].y >> 16) > 260)
						objects[c1].used = 0;
					if ((objects[c1].y >> 16) > 0 && (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 0)) {
						if (objects[c1].y_add < 0) {
							if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 2) {
								objects[c1].y = (((objects[c1].y >> 16) + 16) & 0xfff0) << 16;
								objects[c1].x_add >>= 2;
								objects[c1].y_add = -objects[c1].y_add >> 2;
							}
						} else {
							if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 1) {
								if (objects[c1].y_add > 131072) {
									objects[c1].y = ((((objects[c1].y >> 16) - 16) & 0xfff0) + 15) << 16;
									objects[c1].x_add >>= 2;
									objects[c1].y_add = -objects[c1].y_add >> 2;
								} else
									objects[c1].used = 0;
							} else if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 3) {
								objects[c1].y = ((((objects[c1].y >> 16) - 16) & 0xfff0) + 15) << 16;
								if (objects[c1].y_add > 131072)
									objects[c1].y_add = -objects[c1].y_add >> 2;
								else
									objects[c1].y_add = 0;
							}
						}
					}
					if (objects[c1].x_add < 0 && objects[c1].x_add > -16384)
						objects[c1].x_add = -16384;
					if (objects[c1].x_add > 0 && objects[c1].x_add < 16384)
						objects[c1].x_add = 16384;
					if (objects[c1].used == 1) {
						s1 = (Math.atan2(objects[c1].y_add, objects[c1].x_add) * 4 / Math.PI);
						if (s1 < 0)
							s1 += 8;
						if (s1 < 0)
							s1 = 0;
						if (s1 > 7)
							s1 = 7;
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].frame + s1, object_gobs);
					}
					break;
				case OBJ.FLESH:
					if (rnd(100) < 30) {
						if (objects[c1].frame == 76)
							add_object(OBJ.FLESH_TRACE, objects[c1].x >> 16, objects[c1].y >> 16, 0, 0, OBJ_ANIM.FLESH_TRACE, 1);
						else if (objects[c1].frame == 77)
							add_object(OBJ.FLESH_TRACE, objects[c1].x >> 16, objects[c1].y >> 16, 0, 0, OBJ_ANIM.FLESH_TRACE, 2);
						else if (objects[c1].frame == 78)
							add_object(OBJ.FLESH_TRACE, objects[c1].x >> 16, objects[c1].y >> 16, 0, 0, OBJ_ANIM.FLESH_TRACE, 3);
					}
					if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 0) {
						objects[c1].y_add += 3072;
						if (objects[c1].y_add > 196608)
							objects[c1].y_add = 196608;
					} else if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 2) {
						if (objects[c1].x_add < 0) {
							if (objects[c1].x_add < -65536)
								objects[c1].x_add = -65536;
							objects[c1].x_add += 1024;
							if (objects[c1].x_add > 0)
								objects[c1].x_add = 0;
						} else {
							if (objects[c1].x_add > 65536)
								objects[c1].x_add = 65536;
							objects[c1].x_add -= 1024;
							if (objects[c1].x_add < 0)
								objects[c1].x_add = 0;
						}
						objects[c1].y_add += 1024;
						if (objects[c1].y_add < -65536)
							objects[c1].y_add = -65536;
						if (objects[c1].y_add > 65536)
							objects[c1].y_add = 65536;
					}
					objects[c1].x += objects[c1].x_add;
					if ((objects[c1].y >> 16) > 0 && (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 1 || GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 3)) {
						if (objects[c1].x_add < 0) {
							objects[c1].x = (((objects[c1].x >> 16) + 16) & 0xfff0) << 16;
							objects[c1].x_add = -objects[c1].x_add >> 2;
						} else {
							objects[c1].x = ((((objects[c1].x >> 16) - 16) & 0xfff0) + 15) << 16;
							objects[c1].x_add = -objects[c1].x_add >> 2;
						}
					}
					objects[c1].y += objects[c1].y_add;
					if ((objects[c1].x >> 16) < -5 || (objects[c1].x >> 16) > 405 || (objects[c1].y >> 16) > 260)
						objects[c1].used = 0;
					if ((objects[c1].y >> 16) > 0 && (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 0)) {
						if (objects[c1].y_add < 0) {
							if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) != 2) {
								objects[c1].y = (((objects[c1].y >> 16) + 16) & 0xfff0) << 16;
								objects[c1].x_add >>= 2;
								objects[c1].y_add = -objects[c1].y_add >> 2;
							}
						} else {
							if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 1) {
								if (objects[c1].y_add > 131072) {
									objects[c1].y = ((((objects[c1].y >> 16) - 16) & 0xfff0) + 15) << 16;
									objects[c1].x_add >>= 2;
									objects[c1].y_add = -objects[c1].y_add >> 2;
								} else {
									if (rnd(100) < 10) {
										s1 = rnd(4) - 2;
										add_leftovers(0, objects[c1].x >> 16, (objects[c1].y >> 16) + s1, objects[c1].frame, object_gobs);
										add_leftovers(1, objects[c1].x >> 16, (objects[c1].y >> 16) + s1, objects[c1].frame, object_gobs);
									}
									objects[c1].used = 0;
								}
							} else if (GET_BAN_MAP_TILE(objects[c1].y >> 20, objects[c1].x >> 20) == 3) {
								objects[c1].y = ((((objects[c1].y >> 16) - 16) & 0xfff0) + 15) << 16;
								if (objects[c1].y_add > 131072)
									objects[c1].y_add = -objects[c1].y_add >> 2;
								else
									objects[c1].y_add = 0;
							}
						}
					}
					if (objects[c1].x_add < 0 && objects[c1].x_add > -16384)
						objects[c1].x_add = -16384;
					if (objects[c1].x_add > 0 && objects[c1].x_add < 16384)
						objects[c1].x_add = 16384;
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].frame, object_gobs);
					break;
				case OBJ.FLESH_TRACE:
					objects[c1].ticks--;
					if (objects[c1].ticks <= 0) {
						objects[c1].frame++;
						if (objects[c1].frame >= object_anims[objects[c1].anim].num_frames)
							objects[c1].used = 0;
						else {
							objects[c1].ticks = object_anims[objects[c1].anim].frame[objects[c1].frame].ticks;
							objects[c1].image = object_anims[objects[c1].anim].frame[objects[c1].frame].image;
						}
					}
					if (objects[c1].used == 1)
						add_pob(main_info.draw_page, objects[c1].x >> 16, objects[c1].y >> 16, objects[c1].image, object_gobs);
					break;
			}
		}
	}
}

async function init_level (level: number, pal: number[]): Promise<number> {
	let c1, c2;
	let s1, s2;

	// Open the level file
	// if (read_pcx(handle, background_pic, JNB_WIDTH * JNB_HEIGHT, pal) != 0) {
	// 	strcpy(main_info.error_str, "Error loading 'level.pcx', aborting...\n");
	// 	return 1;
	// }
    let background_pic = [];

	if (flip)
		flip_pixels(background_pic);
	
    // Open Mask File
    let mask_pic = [];

	if (flip)
		flip_pixels(mask_pic);

	register_mask(mask_pic);

	for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
		if (player[c1].enabled) {
			player[c1].bumps = 0;
			for (c2 = 0; c2 < core.JNB_MAX_PLAYERS; c2++)
				player[c1].bumped[c2] = 0;
			position_player(c1);
			add_leftovers(0, 360, 34 + c1 * 64, 0, number_gobs);
			add_leftovers(1, 360, 34 + c1 * 64, 0, number_gobs);
			add_leftovers(0, 376, 34 + c1 * 64, 0, number_gobs);
			add_leftovers(1, 376, 34 + c1 * 64, 0, number_gobs);
		}
	}

	for (c1 = 0; c1 < core.NUM_OBJECTS; c1++)
		objects[c1].used = 0;

	for (c1 = 0; c1 < 16; c1++) {
		for (c2 = 0; c2 < 22; c2++) {
			if (GET_BAN_MAP_TILE(c1, c2) == BAN.SPRING)
				add_object(OBJ.SPRING, c2 << 4, c1 << 4, 0, 0, OBJ_ANIM.SPRING, 5);
		}
	}

	while (1) {
		s1 = rnd(22);
		s2 = rnd(16);
		if (GET_BAN_MAP_TILE(s2, s1) == BAN.VOID) {
			add_object(OBJ.YEL_BUTFLY, (s1 << 4) + 8, (s2 << 4) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
			break;
		}
	}
	while (1) {
		s1 = rnd(22);
		s2 = rnd(16);
		if (GET_BAN_MAP_TILE(s2, s1) == BAN.VOID) {
			add_object(OBJ.YEL_BUTFLY, (s1 << 4) + 8, (s2 << 4) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
			break;
		}
	}
	while (1) {
		s1 = rnd(22);
		s2 = rnd(16);
		if (GET_BAN_MAP_TILE(s2, s1) == BAN.VOID) {
			add_object(OBJ.PINK_BUTFLY, (s1 << 4) + 8, (s2 << 4) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
			break;
		}
	}
	while (1) {
		s1 = rnd(22);
		s2 = rnd(16);
		if (GET_BAN_MAP_TILE(s2, s1) == BAN.VOID) {
			add_object(OBJ.PINK_BUTFLY, (s1 << 4) + 8, (s2 << 4) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
			break;
		}
	}

	return 0;
}


function deinit_level () {
    dj_set_nosound(1);
	dj_stop_mod();
}

function getDefaultDatFile () {
    return fetch('jumpbump.dat').then(response => response.arrayBuffer());
}

async function init_program (argc: number, argv: string[], pal: number[]) {
	const netarg = null;
	let c1 = 0, c2 = 0;
	let load_flag = 0;
	let fly;

	// TODO set flags here?

/** It should not be necessary to assign a default player number here. The
server assigns one in init_server, the client gets one assigned by the server,
all provided the user didn't choose one on the commandline. */
	if (is_net) {
		if (client_player_num < 0)
		        client_player_num = 0;
		player[client_player_num].enabled = true;
	}

    preread_datafile(await getDefaultDatFile());
    const background_pic = read_pcx('menu.pcx');

    // Load Gobs
    ctx.rabbit_gobs = read_gob('rabbit.gob');
	ctx.object_gobs = read_gob('objects.gob');
    ctx.font_gobs = read_gob('font.gob');
    ctx.number_gobs = read_gob('numbers.gob');
    
    rabbit_gobs = read_gob('rabbit.gob');
    object_gobs = read_gob('objects.gob');
    font_gobs = read_gob('font.gob');
    number_gobs = read_gob('numbers.gob');

    SET_BAN_MAP(read_level());
	
	dj_init();

	if (!main_info.no_sound) {
		// load sfx and music
	}

	/* fix dark font */
	for (c1 = 0; c1 < 16; c1++) {
		pal[(240 + c1) * 3 + 0] = c1 << 2;
		pal[(240 + c1) * 3 + 1] = c1 << 2;
		pal[(240 + c1) * 3 + 2] = c1 << 2;
	}

	setpalette(0, 768, pal);

	// if (is_net) {
	// 	if (is_server) {
	// 		init_server(netarg);
	// 	} else {
	// 		connect_to_server(netarg);
	// 	}
	// }

	return 0;
}


function deinit_program () {
    dj_stop();
	dj_deinit();
}