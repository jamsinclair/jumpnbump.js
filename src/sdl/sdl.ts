type SDL_Event_Type = "keydown" | "keyup";

type SDL_Event = {
    type: SDL_Event_Type,
    repeat: boolean,
    scancode: string,
}

type Rgba = {
    r: number,
    g: number,
    b: number,
    a: number,
};

let captured_events: SDL_Event[] = [];


globalThis.ce = captured_events;

function capture_sdl_event (type: SDL_Event_Type, event: KeyboardEvent) {
    event.preventDefault();
    captured_events.push({
        type,
        repeat: event.repeat,
        scancode: event.code,
    });
}

export function SDL_Init () {
    window.addEventListener("keydown", (e) => capture_sdl_event("keydown", e));
    window.addEventListener("keyup", (e) => capture_sdl_event("keyup", e));
}

export function SDL_SetPaletteColors(surface: SDL_Surface, colors: Rgba[], start: number, count: number) {
    surface.format.palette.splice(start, count, ...colors);
}

export function SDL_PollEvent() {
    const events = captured_events.splice(0, captured_events.length);
    return events;
}

export function SDL_GetTicks () {
    return performance.now();
};

export function SDL_Delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class SDL_Surface {
    format: {
        palette: Rgba[],
        palette_version: number,
    } = { palette: [], palette_version: 0 };
    pixels: Uint8ClampedArray;
}

export function SDL_CreateRGBSurface(flags: number, width: number, height: number, depth: number, Rmask: number, Gmask: number, Bmask: number, Amask: number) {
    const surface = new SDL_Surface();
    surface.pixels = new Uint8ClampedArray(width * height * 4);
    return surface;
}