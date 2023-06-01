export enum OBJ {
    SPRING = 0,
    SPLASH = 1,
    SMOKE = 2,
    YEL_BUTFLY = 3,
    PINK_BUTFLY = 4,
    FUR = 5,
    FLESH = 6,
    FLESH_TRACE = 7,
}

export enum OBJ_ANIM {
    SPRING = 0,
    SPLASH = 1,
    SMOKE = 2,
    YEL_BUTFLY_RIGHT = 3,
    YEL_BUTFLY_LEFT = 4,
    PINK_BUTFLY_RIGHT = 5,
    PINK_BUTFLY_LEFT = 6,
    FLESH_TRACE = 7,
}

export enum KEY {
    PL1_LEFT = 'ArrowLeft',
    PL1_RIGHT = 'ArrowRight',
    PL1_JUMP = 'ArrowUp',
    PL2_LEFT = 'KeyA',
    PL2_RIGHT = 'KeyD',
    PL2_JUMP = 'KeyW',
    PL3_LEFT = 'KeyJ',
    PL3_RIGHT = 'KeyL',
    PL3_JUMP = 'KeyI',
    PL4_LEFT = 'Numpad4',
    PL4_RIGHT = 'Numpad6',
    PL4_JUMP = 'Numpad8',
    ESCAPE = 'Escape',
    ONE = 'Digit1',
    TWO = 'Digit2',
    THREE = 'Digit3',
    FOUR = 'Digit4',
    F10 = 'F10',
}

export enum MOVEMENT {
    LEFT = 1,
    RIGHT = 2,
    UP = 3,
}

export enum SFX {
    JUMP = 0,
    LAND = 1,
    DEATH = 2,
    SPRING = 3,
    SPLASH = 4,
    FLY = 5,
}

export enum SFX_FREQ {
    JUMP = 15000,
    LAND = 15000,
    DEATH = 20000,
    SPRING = 15000,
    SPLASH = 12000,
    FLY = 12000,
}

export enum BAN {
    VOID = 0,
    SOLID = 1,
    WATER = 2,
    ICE = 3,
    SPRING = 4,
}

export enum MOD {
    MENU = 0,
    GAME = 1,
    SCORES = 2,
}

export const SCREEN_WIDTH = 400;
export const SCREEN_HEIGHT = 256;
export const PALETTE_256_SIZE = 768;

export const JNB_MAX_PLAYERS = 4;
export const JNB_END_SCORE = 100;
export const JNB_VERSION = '2.0-dev';

export const NUM_POBS = 200;
export const NUM_OBJECTS = 200;
export const NUM_FLIES = 20;
export const NUM_LEFTOVERS = 50;

export const MAX_VOLUME = 64;

export enum NUM {
    POBS = 200,
    OBJECTS = 200,
    FLIES = 20,
    LEFTOVERS = 50,
}
