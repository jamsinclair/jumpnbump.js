type Event_Type = "keydown" | "keyup";

type Event = {
    type: Event_Type,
    repeat: boolean,
    scancode: string,
}
let captured_events: Event[] = [];

globalThis.ce = captured_events;

function capture_sdl_event (type: Event_Type, event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
        // Ignore key events with modifiers
        return;
    }

    event.preventDefault();
    captured_events.push({
        type,
        repeat: event.repeat,
        scancode: event.code,
    });
}

export function init_controls_listener () {
    window.addEventListener("keydown", (e) => capture_sdl_event("keydown", e));
    window.addEventListener("keyup", (e) => capture_sdl_event("keyup", e));
}

export function poll_events() {
    const events = captured_events.splice(0, captured_events.length);
    return events;
}
