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

const defaultContext: GameContext = {
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
    player: new Array(JNB_MAX_PLAYERS).fill(new Player()),
    ai: new Array(JNB_MAX_PLAYERS),
    objects: new Array(NUM_OBJECTS).fill(new GameObject()),
};

globalThis.ctx = defaultContext;

export default defaultContext;
