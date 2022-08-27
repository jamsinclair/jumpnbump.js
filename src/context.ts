import { Pob } from "./assets";
import { JNB_MAX_PLAYERS, NUM } from "./constants";

class PageInfo {
    num_pobs: number;
    pobs: Pob[];
}

class MainInfo {
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

class Player {
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

class GameObject {
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


type GameContext = {
    state: 'initial' | 'running' | 'paused' | 'stopped';
    info: {
        joy_enabled: boolean;
        mouse_enabled: boolean;
        no_sound: boolean;
        music_no_sound: boolean;
        no_gore: boolean;
        error_str: string;
        draw_page: number;
        view_page: number;
        page_info: {
            num_pobs: number;
            pobs: Pob[];
        };
        pob_backbuf: number[];
    },
    player: Player[];
    ai: (0 | 1)[];
    objects: GameObject[];
}

const fillArray = <Value>(array: Value[], getValue: () => Value ) => {
    for (let i = 0; i < array.length; i++) {
        array[i] = getValue();
    }
    return array;
};

const getDefaultContext: () => GameContext = () => ({
    state: 'initial',
    info: {
        joy_enabled: false,
        mouse_enabled: false,
        no_sound: false,
        music_no_sound: false,
        no_gore: false,
        error_str: "",
        draw_page: 0,
        view_page: 0,
        page_info: {num_pobs: 0, pobs: []},
        pob_backbuf: [],
    },
    player: fillArray(new Array(JNB_MAX_PLAYERS), () => new Player()),
    ai: new Array(JNB_MAX_PLAYERS),
    objects: fillArray(new Array(NUM.OBJECTS), () => new GameObject())
});

const context = getDefaultContext();

export const resetContext = () => {
    const newContext = getDefaultContext();
    context.state = newContext.state;
    context.info = newContext.info;
    context.player = newContext.player;
    context.ai = newContext.ai;
    context.objects = newContext.objects;
}

export default context;
