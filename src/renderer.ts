import { object_anims } from './animation';
import { cheats } from './cheats';
import { BAN } from './constants';
import * as core from './core';
import { dj_set_sfx_channel_volume } from './sdl/sound';
import { GET_BAN_MAP_XY } from './level';
import { rnd } from './c';
import { get_pixel, put_pob, set_pixel } from './sdl/gfx';
import ctx from './context';

// Probably move elsewhere
const main_info =  ctx.info;
const objects = ctx.objects;
const mask_pic = [];
const player = ctx.player;

type Leftovers = {
    page: {
        num_pobs: number,
        pobs: {
            x: number,
            y: number,
            image: number,
            pob_data: core.Gob,
        }[],
    }[]
};
const leftovers: Leftovers = { page: [] };

type Fly = {
    x: number,
    y: number,
    old_x: number,
    old_y: number,
    old_draw_x: number,
    old_draw_y: number,
    back: number[],
    back_defined: number[],
}
const flies: Fly[] = [];

export function add_object (type: number, x: number, y: number, x_add: number, y_add: number, anim: number, frame: number) {
	for (let c1 = 0; c1 < core.NUM_OBJECTS; c1++) {
		if (!objects[c1] || objects[c1].used === 0) {
            const newObject = {
                used: 1,
                type: type,
                x: x << 16,
                y: y << 16,
                x_add: x_add,
                y_add: y_add,
                x_acc: 0,
                y_acc: 0,
                anim: anim,
                frame: frame,
                ticks: object_anims[anim].frame[frame].ticks,
                image: object_anims[anim].frame[frame].image,
            };
            objects[c1] = newObject;
            break;
		}
	}
}

export function add_pob (page: number, x: number, y: number, image: number, pob_data: core.Gob): number {
	if (main_info.page_info[page].num_pobs >= core.NUM_POBS)
        return 1;

    const pob = {
        x: x,
        y: y,
        image: image,
        pob_data: pob_data,
    };
    main_info.page_info[page].pobs[main_info.page_info[page].num_pobs] = pob;
    main_info.page_info[page].num_pobs++;

    return 0;
}

export function add_leftovers (page: number, x: number, y: number, image: number, pob_data: core.Gob) {
    if (leftovers.page[page].num_pobs >= core.NUM_LEFTOVERS)
		return 1;

    const leftover = {
        x: x,
        y: y,
        image: image,
        pob_data: pob_data,
    };
    leftovers.page[page].pobs[leftovers.page[page].num_pobs] = leftover;
	leftovers.page[page].num_pobs++;

	return 0;
}

export function draw_flies (page: number) {
	for (let c2 = 0; c2 < core.NUM_FLIES; c2++) {
		flies[c2].back[main_info.draw_page] = get_pixel(main_info.draw_page, flies[c2].x, flies[c2].y);
		flies[c2].back_defined[main_info.draw_page] = 1;
		if (mask_pic[(flies[c2].y * core.JNB_WIDTH) + flies[c2].x] == 0)
			set_pixel(main_info.draw_page, flies[c2].x, flies[c2].y, 0);
	}
}

export function draw_pobs (page: number) {
	for (let c1 = main_info.page_info[page].num_pobs - 1; c1 >= 0; c1--) {
		put_pob(page, main_info.page_info[page].pobs[c1].x, main_info.page_info[page].pobs[c1].y, main_info.page_info[page].pobs[c1].image, main_info.page_info[page].pobs[c1].pob_data, 1, mask_pic);
	}
}

export function redraw_flies_background (page: number) {
	for (let c2 = core.NUM_FLIES - 1; c2 >= 0; c2--) {
		if (flies[c2].back_defined[page] == 1)
			set_pixel(page, flies[c2].old_draw_x, flies[c2].old_draw_y, flies[c2].back[page]);
		flies[c2].old_draw_x = flies[c2].x;
		flies[c2].old_draw_y = flies[c2].y;
	}
}

export function draw_leftovers (page: number) {
	for (let c1 = leftovers.page[page].num_pobs - 1; c1 >= 0; c1--)
		put_pob(page, leftovers.page[page].pobs[c1].x, leftovers.page[page].pobs[c1].y, leftovers.page[page].pobs[c1].image, leftovers.page[page].pobs[c1].pob_data, 1, mask_pic);

	leftovers.page[page].num_pobs = 0;
}

function get_closest_player_to_point(x: number, y: number) {
	let cur_dist = 0;
	let dist = 0x7fff;
    let closest_player = 0;

	for (let c1 = 0; c1 < core.JNB_MAX_PLAYERS; c1++) {
		if (player[c1].enabled) {
			cur_dist = Math.sqrt((x - ((player[c1].x >> 16) + 8)) * (x - ((player[c1].x >> 16) + 8)) + (y - ((player[c1].y >> 16) + 8)) * (y - ((player[c1].y >> 16) + 8)));
			if (cur_dist < dist) {
				closest_player = c1;
				dist = cur_dist;
			}
		}
	}

    return {
        dist,
        closest_player
    };
}

export function update_flies(update_count: number) {
	let s1, s2, s3, s4;

	/* get center of fly swarm */
	s1 = s2 = 0;
	for (let c1 = 0; c1 < core.NUM_FLIES; c1++) {
		s1 += flies[c1].x;
		s2 += flies[c1].y;
	}
	s1 /= core.NUM_FLIES;
	s2 /= core.NUM_FLIES;

	if (update_count == 1) {
		/* get closest player to fly swarm */
		let {
            dist,
         } = get_closest_player_to_point(s1, s2);
		/* update fly swarm sound */
		s3 = 32 - dist / 3;
		if (s3 < 0)
			s3 = 0;
		dj_set_sfx_channel_volume(4, s3);
	}

	for (let c1 = 0; c1 < core.NUM_FLIES; c1++) {
		/* get closest player to fly */
		let { dist, closest_player } = get_closest_player_to_point(flies[c1].x, flies[c1].y);
		flies[c1].old_x = flies[c1].x;
		flies[c1].old_y = flies[c1].y;
		s3 = 0;
		if ((s1 - flies[c1].x) > 30)
			s3 += 1;
		else if ((s1 - flies[c1].x) < -30)
			s3 -= 1;
		if (dist < 30) {
			if (((player[closest_player].x >> 16) + 8) > flies[c1].x) {
				if (!cheats.lord_of_the_flies)
					s3 -= 1;
				else
					s3 += 1;
			} else {
				if (!cheats.lord_of_the_flies)
					s3 += 1;
				else
					s3 -= 1;
			}
		}
		s4 = rnd(3) - 1 + s3;
		if ((flies[c1].x + s4) < 16)
			s4 = 0;
		if ((flies[c1].x + s4) > 351)
			s4 = 0;
		if (GET_BAN_MAP_XY(flies[c1].x + s4, flies[c1].y) != BAN.VOID)
			s4 = 0;
		flies[c1].x += s4;
		s3 = 0;
		if ((s2 - flies[c1].y) > 30)
			s3 += 1;
		else if ((s2 - flies[c1].y) < -30)
			s3 -= 1;
		if (dist < 30) {
			if (((player[closest_player].y >> 16) + 8) > flies[c1].y) {
				if (!cheats.lord_of_the_flies)
					s3 -= 1;
				else
					s3 += 1;
			} else {
				if (!cheats.lord_of_the_flies)
					s3 += 1;
				else
					s3 -= 1;
			}
		}
		s4 = rnd(3) - 1 + s3;
		if ((flies[c1].y + s4) < 0)
			s4 = 0;
		if ((flies[c1].y + s4) > 239)
			s4 = 0;
		if (GET_BAN_MAP_XY(flies[c1].x, flies[c1].y + s4) != BAN.VOID)
			s4 = 0;
		flies[c1].y += s4;
	}
}

export function position_flies () {
    const s1 = rnd(250) + 50;
    const s2 = rnd(150) + 50;

    for (let c1 = 0; c1 < core.NUM_FLIES; c1++) {
        while (1) {
            flies[c1].x = s1 + rnd(101) - 50;
            flies[c1].y = s2 + rnd(101) - 50;
            if (GET_BAN_MAP_XY(flies[c1].x, flies[c1].y) == BAN.VOID)
                break;
        }
        flies[c1].back_defined[0] = 0;
        flies[c1].back_defined[1] = 0;
    }
}