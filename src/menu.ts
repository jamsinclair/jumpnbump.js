import { KEY, MOD, OBJ, OBJ_ANIM, SFX, SFX_FREQ } from './constants';
import * as core from './core';
import { read_pcx } from './data';
import { add_object, add_pob, draw_pobs } from './renderer';
import { memset, rnd } from './c';
import { clear_lines, draw_begin, draw_end, fillpalette, put_text, recalculate_gob, redraw_pob_backgrounds, register_background, register_mask, setpalette } from './sdl/gfx';
import { update_player_actions } from './sdl/input';
import { addkey, intr_sysupdate, key_pressed } from './sdl/interrpt';
import { dj_mix, dj_play_sfx, dj_ready_mod, dj_set_mod_volume, dj_set_nosound, dj_set_sfx_volume, dj_start_mod } from './sdl/sound';
import ctx from './context';
import { player_anims } from './animation';

let menu_background;
let menu_mask;

const menu_pal = new Array(256);
const menu_cur_pal = new Array(256);

const player = ctx.player;
const main_info = ctx.info;
const ai = ctx.ai;
const rabbit_gobs: any = [];
const font_gobs: any = [];
const object_gobs: any = [];

const objects = ctx.objects;

function update_objects () {

}

const message = [
	`Jump 'n Bump ${core.JNB_VERSION}`,
	"by Brainchild Design in 1998.",
	"Code by Mattias Brynervall.",
	"Graphics by Martin Magnusson",
	"and Andreas Brynervall.",
	"Music by Anders Nilsson.",
	"Linux port by Chuck Mason.",
	"SDL port by Florian Schulze.",
	"SDL2 port by Come Chilliet.",
	"Maintained by the Libre Games community.",
	"Visit our homepage at:",
	"libregames.gitlab.io/jumpnbump",
	"Jump 'n Bump is free software",
	"licensed under GPL 2.0 or later.",
	""];

const NUM_MESSAGES = message.length;

export function menu() {
	let c1;
	let esc_pressed;
	let end_loop_flag, new_game_flag, fade_flag;
	let mod_vol = 0, mod_fade_direction = 0;
	let cur_message;
	let fade_dir, fade_count;
	let fade_pal = [];
	let update_count;

	if (menu_init() != 0)
		return 1;

	/* After a game, we have to release the keys, cause AI player
	 * can still be using them */
	addkey(KEY.PL1_LEFT);
	addkey(KEY.PL2_LEFT);
	addkey(KEY.PL3_LEFT);
	addkey(KEY.PL4_LEFT);

	addkey(KEY.PL1_RIGHT);
	addkey(KEY.PL2_RIGHT);
	addkey(KEY.PL3_RIGHT);
	addkey(KEY.PL4_RIGHT);

	addkey(KEY.PL1_JUMP);
	addkey(KEY.PL2_JUMP);
	addkey(KEY.PL3_JUMP);
	addkey(KEY.PL4_JUMP);

	mod_vol = 0;
	mod_fade_direction = 1;
	dj_ready_mod(MOD.MENU);
	dj_set_mod_volume(mod_vol);
	dj_set_sfx_volume(64);
	dj_start_mod();
	dj_set_nosound(0);

	memset(fade_pal, 0, 48);
	setpalette(240, 16, fade_pal);

	fade_dir = 0;
	fade_count = 0;
	cur_message = NUM_MESSAGES - 1;

	main_info.page_info[0].num_pobs = 0;
	main_info.page_info[1].num_pobs = 0;
	main_info.view_page = 0;
	main_info.draw_page = 1;

	esc_pressed = key_pressed(KEY.ESCAPE);
	end_loop_flag = new_game_flag = 0;

	update_count = 1;
	while (1) {

		dj_mix();

		for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) // set AI to false
			ai[c1] = 0;

		while (update_count) {

			if (key_pressed(KEY.ESCAPE) == 1 && esc_pressed == 0) {
				end_loop_flag = 1;
				new_game_flag = 0;
				memset(menu_pal, 0, 768);
				mod_fade_direction = 0;
			} else if (key_pressed(KEY.ESCAPE) == 0)
				esc_pressed = 0;

			update_player_actions();
			for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
				if (end_loop_flag == 1 && new_game_flag == 1) {
					if ((player[c1].x >> 16) > (165 + c1 * 2)) {
						if (player[c1].x_add < 0)
							player[c1].x_add += 16384;
						else
							player[c1].x_add += 12288;
						if (player[c1].x_add > 98304)
							player[c1].x_add = 98304;
						player[c1].direction = 0;
						if (player[c1].anim == 0) {
							player[c1].anim = 1;
							player[c1].frame = 0;
							player[c1].frame_tick = 0;
							player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
						}
						player[c1].enabled = true;
					}
					if (!player[c1].action_up) {
						if (player[c1].y_add < 0) {
							player[c1].y_add += 32768;
							if (player[c1].y_add > 0)
								player[c1].y_add = 0;
						}
					}
					player[c1].y_add += 12288;
					if (player[c1].y_add > 36864 && player[c1].anim != 3) {
						player[c1].anim = 3;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					}
					player[c1].y += player[c1].y_add;
					if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
						if ((player[c1].y >> 16) > (160 + c1 * 2)) {
							player[c1].y = (160 + c1 * 2) << 16;
							player[c1].y_add = 0;
							if (player[c1].anim != 0 && player[c1].anim != 1) {
								player[c1].anim = 0;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							}
						}
					} else {
						if ((player[c1].y >> 16) > (138 + c1 * 2)) {
							player[c1].y = (138 + c1 * 2) << 16;
							player[c1].y_add = 0;
							if (player[c1].anim != 0 && player[c1].anim != 1) {
								player[c1].anim = 0;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							}
							if (!player[c1].action_up)
								player[c1].jump_ready = 1;
						}
					}
					player[c1].x += player[c1].x_add;
					if ((player[c1].y >> 16) > (138 + c1 * 2)) {
						if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (190 + c1 * 2)) {
							player[c1].x = (165 + c1 * 2) << 16;
							player[c1].x_add = 0;
						}
						if ((player[c1].x >> 16) > (190 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
							player[c1].x = (208 + c1 * 2) << 16;
							player[c1].x_add = 0;
						}
					}
				} else {
					if (player[c1].action_left && player[c1].action_right) {
						if (player[c1].direction == 1) {
							if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
								if (player[c1].x_add > 0) {
									player[c1].x_add -= 16384;
									if ((player[c1].y >> 16) >= (160 + c1 * 2))
										add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
								} else
									player[c1].x_add -= 12288;
							}
							if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
								if (player[c1].x_add > 0) {
									player[c1].x_add -= 16384;
									if ((player[c1].y >> 16) >= (138 + c1 * 2))
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
						} else {
							if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
								if (player[c1].x_add < 0) {
									player[c1].x_add += 16384;
									if ((player[c1].y >> 16) >= (160 + c1 * 2))
										add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
								} else
									player[c1].x_add += 12288;
							}
							if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
								if (player[c1].x_add < 0) {
									player[c1].x_add += 16384;
									if ((player[c1].y >> 16) >= (138 + c1 * 2))
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
					} else if (player[c1].action_left) {
						if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
							if (player[c1].x_add > 0) {
								player[c1].x_add -= 16384;
								if ((player[c1].y >> 16) >= (160 + c1 * 2))
									add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							} else
								player[c1].x_add -= 12288;
						}
						if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
							if (player[c1].x_add > 0) {
								player[c1].x_add -= 16384;
								if ((player[c1].y >> 16) >= (138 + c1 * 2))
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
					} else if (player[c1].action_right) {
						if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
							if (player[c1].x_add < 0) {
								player[c1].x_add += 16384;
								if ((player[c1].y >> 16) >= (160 + c1 * 2))
									add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							} else
								player[c1].x_add += 12288;
						}
						if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
							if (player[c1].x_add < 0) {
								player[c1].x_add += 16384;
								if ((player[c1].y >> 16) >= (138 + c1 * 2))
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
					} else {
						if (((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) && (player[c1].y >> 16) >= (160 + c1 * 2)) {
							if (player[c1].x_add < 0) {
								player[c1].x_add += 16384;
								if (player[c1].x_add > 0)
									player[c1].x_add = 0;
								add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							} else if (player[c1].x_add > 0) {
								player[c1].x_add -= 16384;
								if (player[c1].x_add < 0)
									player[c1].x_add = 0;
								add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							}
						}
						if ((((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) && (player[c1].y >> 16) >= (138 + c1 * 2))) {
							if (player[c1].x_add < 0) {
								player[c1].x_add += 16384;
								if (player[c1].x_add > 0)
									player[c1].x_add = 0;
								add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							} else if (player[c1].x_add > 0) {
								player[c1].x_add -= 16384;
								if (player[c1].x_add < 0)
									player[c1].x_add = 0;
								add_object(OBJ.SMOKE, (player[c1].x >> 16) + 2 + rnd(9), (player[c1].y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM.SMOKE, 0);
							}
						}
						if (player[c1].anim == 1) {
							player[c1].anim = 0;
							player[c1].frame = 0;
							player[c1].frame_tick = 0;
							player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
						}
					}
					if ((player[c1].jump_ready == 1) && player[c1].action_up) {
						if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
							if ((player[c1].y >> 16) >= (160 + c1 * 2)) {
								player[c1].y_add = -280000;
								player[c1].anim = 2;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
								player[c1].jump_ready = 0;
								dj_play_sfx(SFX.JUMP, (SFX_FREQ.JUMP + rnd(2000) - 1000), 64, 0, 0, -1);
							}
						} else {
							if ((player[c1].y >> 16) >= (138 + c1 * 2)) {
								player[c1].y_add = -280000;
								player[c1].anim = 2;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
								player[c1].jump_ready = 0;
								dj_play_sfx(SFX.JUMP, (SFX_FREQ.JUMP + rnd(2000) - 1000), 64, 0, 0, -1);
							}
						}
					}
					if (!player[c1].action_up) {
						if (player[c1].y_add < 0) {
							player[c1].y_add += 32768;
							if (player[c1].y_add > 0)
								player[c1].y_add = 0;
						}
					}
					if (!player[c1].action_up)
						player[c1].jump_ready = 1;
					player[c1].y_add += 12288;
					if (player[c1].y_add > 36864 && player[c1].anim != 3) {
						player[c1].anim = 3;
						player[c1].frame = 0;
						player[c1].frame_tick = 0;
						player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
					}
					player[c1].y += player[c1].y_add;
					if ((player[c1].x >> 16) <= (165 + c1 * 2) || (player[c1].x >> 16) >= (208 + c1 * 2)) {
						if ((player[c1].y >> 16) > (160 + c1 * 2)) {
							player[c1].y = (160 + c1 * 2) << 16;
							player[c1].y_add = 0;
							if (player[c1].anim != 0 && player[c1].anim != 1) {
								player[c1].anim = 0;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							}
						}
					} else {
						if ((player[c1].y >> 16) > (138 + c1 * 2)) {
							player[c1].y = (138 + c1 * 2) << 16;
							player[c1].y_add = 0;
							if (player[c1].anim != 0 && player[c1].anim != 1) {
								player[c1].anim = 0;
								player[c1].frame = 0;
								player[c1].frame_tick = 0;
								player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
							}
						}
					}
					player[c1].x += player[c1].x_add;
					if ((player[c1].x >> 16) < 0) {
						player[c1].x = 0;
						player[c1].x_add = 0;
					}
					if ((player[c1].x >> 16) > core.JNB_WIDTH) {
						end_loop_flag = 1;
						new_game_flag = 1;
						memset(menu_pal, 0, 768);
						mod_fade_direction = 0;
					}
					if ((player[c1].y >> 16) > (138 + c1 * 2)) {
						if ((player[c1].x >> 16) > (165 + c1 * 2) && (player[c1].x >> 16) < (190 + c1 * 2)) {
							player[c1].x = (165 + c1 * 2) << 16;
							player[c1].x_add = 0;
						}
						if ((player[c1].x >> 16) > (190 + c1 * 2) && (player[c1].x >> 16) < (208 + c1 * 2)) {
							player[c1].x = (208 + c1 * 2) << 16;
							player[c1].x_add = 0;
						}
					}
				}
				player[c1].frame_tick++;
				if (player[c1].frame_tick >= player_anims[player[c1].anim].frame[player[c1].frame].ticks) {
					player[c1].frame++;
					if (player[c1].frame >= player_anims[player[c1].anim].num_frames)
						player[c1].frame = player_anims[player[c1].anim].restart_frame;
					player[c1].frame_tick = 0;
				}
				player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image + player[c1].direction * 9;
			}

			dj_mix();

			main_info.page_info[main_info.draw_page].num_pobs = 0;

			for (c1 = 3; c1 >= 0; c1--)
				add_pob(main_info.draw_page, player[c1].x >> 16, player[c1].y >> 16, player[c1].image + c1 * 18, rabbit_gobs);

			update_objects();

			if (update_count == 1) {
				draw_begin();
				draw_pobs(main_info.draw_page);
				draw_end();

				dj_mix();

				if (mod_fade_direction == 1) {
					if (mod_vol < 35) {
						mod_vol++;
						dj_set_mod_volume(mod_vol);
					}
				} else {
					if (mod_vol > 0) {
						mod_vol--;
						dj_set_mod_volume(mod_vol);
					}
				}
			}

			fade_flag = 0;
			for (c1 = 0; c1 < 720; c1++) {
				if (menu_cur_pal[c1] < menu_pal[c1]) {
					menu_cur_pal[c1]++;
					fade_flag = 1;
				} else if (menu_cur_pal[c1] > menu_pal[c1]) {
					menu_cur_pal[c1]--;
					fade_flag = 2;
				}
			}
			if (fade_flag == 0 && end_loop_flag == 1) {
				menu_deinit();
				if (new_game_flag == 1)
					return 0;
				else
					return 1;
			}
			switch (fade_dir) {
				case 0:
					if (fade_count < 30) {
						for (c1 = 0; c1 < 48; c1++) {
							if (fade_pal[c1] > 0)
								fade_pal[c1]--;
						}
						fade_count++;
					} else {
						draw_begin();
						clear_lines(0, 220, 20, 0);
						clear_lines(1, 220, 20, 0);

						cur_message++;
						if (cur_message >= NUM_MESSAGES)
							cur_message -= NUM_MESSAGES;
						put_text(0, 200, 220, message[cur_message], 2);
						put_text(1, 200, 220, message[cur_message], 2);
						fade_dir = 1;
						fade_count = 0;
						draw_end();
					}
					break;
				case 1:
					if (fade_count < 100) {
						for (c1 = 0; c1 < 48; c1++) {
							if (fade_pal[c1] < menu_pal[c1 + 720])
								fade_pal[c1]++;
						}
						fade_count++;
					} else {
						fade_dir = 0;
						fade_count = 0;
					}
					break;
			}

			for (c1 = 0; c1 < 48; c1++) {
				if (fade_pal[c1] > menu_pal[c1 + 720])
					fade_pal[c1]--;
			}

			if (update_count == 1) {
				main_info.draw_page ^= 1;
				main_info.view_page ^= 1;
			}

			if (fade_flag != 0) {
				setpalette(0, 240, menu_cur_pal);
			}

			if (update_count == 1) {
				setpalette(240, 16, fade_pal);

				dj_mix();

				draw_begin();
				redraw_pob_backgrounds(main_info.draw_page);
				draw_end();
			}

			update_count--;
		}

		// update_count = intr_sysupdate();
		update_count = 0;
        return 0;
	}

	menu_deinit();
	return 1;
}

function menu_init() {
    let c1;

	fillpalette(0, 0, 0);

    menu_background = read_pcx("menu.pcx");
    menu_mask = read_pcx("menumask.pcx");
	memset(menu_cur_pal, 0, 768);

	/* fix dark font */
	for (c1 = 0; c1 < 16; c1++) {
		menu_pal[(240 + c1) * 3 + 0] = c1 << 2;
		menu_pal[(240 + c1) * 3 + 1] = c1 << 2;
		menu_pal[(240 + c1) * 3 + 2] = c1 << 2;
	}

	recalculate_gob(rabbit_gobs, menu_pal);
	recalculate_gob(font_gobs, menu_pal);
	recalculate_gob(object_gobs, menu_pal);
	register_background(menu_background, menu_pal);
	register_mask(menu_mask);

	for (c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
		player[c1].enabled = false;
		player[c1].x = rnd(150) << 16;
		player[c1].y = (160 + c1 * 2) << 16;
		player[c1].x_add = 0;
		player[c1].y_add = 0;
		player[c1].direction = rnd(2);
		player[c1].jump_ready = 1;
		player[c1].anim = 0;
		player[c1].frame = 0;
		player[c1].frame_tick = 0;
		player[c1].image = player_anims[player[c1].anim].frame[player[c1].frame].image;
	}

	for (c1 = 0; c1 < core.NUM_OBJECTS; c1++) {
		objects[c1].used = 0;
    }

	main_info.page_info[0].num_pobs = 0;
	main_info.page_info[1].num_pobs = 0;

	return 0;
}

function menu_deinit() {
	dj_set_nosound(1);
}
