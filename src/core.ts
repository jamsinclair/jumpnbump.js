export const JNB_MAX_PLAYERS = 4;
export const JNB_END_SCORE = 100;
export const JNB_VERSION = "2.0-dev";
export const JNB_WIDTH = 400;
export const JNB_HEIGHT = 256;

export const MOVEMENT_LEFT = 1;
export const MOVEMENT_RIGHT = 2;
export const MOVEMENT_UP = 3;

export const NUM_POBS = 200;
export const NUM_OBJECTS = 200;
export const NUM_FLIES = 20;   
export const NUM_LEFTOVERS = 50;

export const NUM_SFX = 6;

export class Gob {
    name: string;
    num_images: number;
    width: number[] = [];
    height: number[] = [];
    hs_x: number[] = [];
    hs_y: number[] = [];
    data: Uint8ClampedArray[] = [];
    orig_data: Uint8ClampedArray[] = [];

    refresh (newGob: Gob) {
        this.name = newGob.name;
        this.num_images = newGob.num_images;
        this.width = newGob.width;
        this.height = newGob.height;
        this.hs_x = newGob.hs_x;
        this.hs_y = newGob.hs_y;
        this.data = newGob.data;
        this.orig_data = newGob.orig_data;
    }
}

export class Pob {
    x: number;
    y: number;
    image: number;
    pob_data: Gob;
}

export class PageInfo {
    num_pobs: number;
    pobs: Pob[];
}

export class MainInfo {
    joy_enabled: boolean;
    mouse_enabled: boolean;
    no_sound: boolean;
    music_no_sound: boolean;
    no_gore: boolean;
    error_str: string;
    draw_page: number;
    view_page: number;
    page_info: PageInfo;
    pob_backbuf: number[];
}

export class Player {
    action_left: boolean;
    action_up: boolean;
    action_right: boolean;
    enabled: boolean;
    dead_flag: boolean;
    bumps: number;
    bumped: number[] = [];
    // Movement State,
    x: number;
    y: number;
    x_add: number;
    y_add: number;
    direction: number;
    jump_ready: number;
    jump_abort: number;
    in_water: number;
    // Animation State,
    anim: number;
    frame: number;
    frame_tick: number;
    image: number;
}

export class GameObject {
    used: number;
    type: number;
    x: number;
    y: number;
    x_add: number;
    y_add: number;
    x_acc: number;
    y_acc: number;
    anim: number;
    frame: number;
    ticks: number;
    image: number;
};
