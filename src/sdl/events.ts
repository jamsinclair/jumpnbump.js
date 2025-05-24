type Event_Type = 'keydown' | 'keyup';

type Event = {
    type: Event_Type;
    repeat: boolean;
    scancode: string;
    key: string;
};
let captured_events: Event[] = [];

function capture_sdl_event(type: Event_Type, event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
        // Ignore key events with modifiers
        return;
    }

    event.preventDefault();
    captured_events.push({
        type,
        repeat: event.repeat,
        scancode: event.code,
        key: event.key,
    });
}

const capture_sdl_event_keydown = (e: KeyboardEvent) => capture_sdl_event('keydown', e);
const capture_sdl_event_keyup = (e: KeyboardEvent) => capture_sdl_event('keyup', e);

export function init_controls_listener() {
    window.addEventListener('keydown', capture_sdl_event_keydown);
    window.addEventListener('keyup', capture_sdl_event_keyup);
}

export function deinit_controls_listener() {
    window.removeEventListener('keydown', capture_sdl_event_keydown);
    window.removeEventListener('keyup', capture_sdl_event_keyup);
}

export function poll_events() {
    const events = captured_events.splice(0, captured_events.length);
    return events;
}
