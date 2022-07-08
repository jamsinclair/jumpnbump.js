import { GameObject, Gob, JNB_MAX_PLAYERS, NUM_OBJECTS, Player, Pob } from "./core";

type GameContext = {
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
        }[];
        pob_backbuf: number[];
    },
    player: Player[];
    ai: (0 | 1)[];
    objects: GameObject[];
    rabbit_gobs?: Gob;
    font_gobs?: Gob;
    object_gobs?: Gob;
    number_gobs?: Gob;
}

const fillArray = <Value>(array: Value[], getValue: () => Value ) => {
    for (let i = 0; i < array.length; i++) {
        array[i] = getValue();
    }
    return array;
};

const getDefaultContext: () => GameContext = () => ({
    info: {
        joy_enabled: false,
        mouse_enabled: false,
        no_sound: false,
        music_no_sound: false,
        no_gore: false,
        error_str: "",
        draw_page: 0,
        view_page: 0,
        page_info: [{num_pobs: 0, pobs: []}, {num_pobs: 0, pobs: []}],
        pob_backbuf: [],
    },
    player: fillArray(new Array(JNB_MAX_PLAYERS), () => new Player()),
    ai: new Array(JNB_MAX_PLAYERS),
    objects: fillArray(new Array(NUM_OBJECTS), () => new GameObject()),
    rabbit_gobs: new Gob(),
    font_gobs: new Gob(),
    object_gobs: new Gob(),
    number_gobs: new Gob(),
});

const defaultContext = getDefaultContext();
globalThis.ctx = defaultContext;

export default defaultContext;
