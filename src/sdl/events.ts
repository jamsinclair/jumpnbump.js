type Event_Type = 'keydown' | 'keyup';

type Event = {
    type: Event_Type;
    repeat: boolean;
    scancode: string;
    key: string;
};
let captured_events: Event[] = [];

const mouseButtons: Record<number, boolean> = {};

function capture_mouse_event(type: 'mousedown' | 'mouseup', event: MouseEvent) {
    event.preventDefault();
    mouseButtons[event.button] = type === 'mousedown';
}

function prevent_default_mouse_action(event: MouseEvent) {
    event.preventDefault();
}

const capture_mousedown = (e: MouseEvent) => capture_mouse_event('mousedown', e);
const capture_mouseup = (e: MouseEvent) => capture_mouse_event('mouseup', e);

export function get_mouse_buttons() {
    return mouseButtons;
}

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
    window.addEventListener('mousedown', capture_mousedown);
    window.addEventListener('mouseup', capture_mouseup);
    window.addEventListener('contextmenu', prevent_default_mouse_action);
    window.addEventListener('auxclick', prevent_default_mouse_action);
}

export function deinit_controls_listener() {
    window.removeEventListener('keydown', capture_sdl_event_keydown);
    window.removeEventListener('keyup', capture_sdl_event_keyup);
    window.removeEventListener('mousedown', capture_mousedown);
    window.removeEventListener('mouseup', capture_mouseup);
    window.removeEventListener('contextmenu', prevent_default_mouse_action);
    window.removeEventListener('auxclick', prevent_default_mouse_action);
}

export function poll_events() {
    const events = captured_events.splice(0, captured_events.length);
    return events;
}
