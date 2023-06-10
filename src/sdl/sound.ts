import { read_data } from '../data';
import { MAX_VOLUME, MOD, SFX } from '../constants';
import { Smp } from '@webtrack/smp';
import { Mod } from '@webtrack/mod';
/* @ts-ignore - Special static import with Vite */
import audioWorkletUrl from '@webtrack/mod/dist/mod-processor.js?url';
/* @ts-ignore - Special static import with Vite */
import wasmUrl from '@webtrack/mod/dist/hxcmod_player.wasm?url';
import context from '../context';

type SoundConfig = { loop: boolean; default_freq: number };
const soundSettings: SoundConfig[] = [];
const sounds: ArrayBuffer[] = [];
const channels: Smp[][] = [];
const tracks: Mod[] = [];
let currentTrack: MOD | null = null;
const getCurrentTrack = () => tracks[currentTrack] ?? null;

const SAFE_MIN_SAMPLE_RATE = 8000;
const SAFE_MAX_SAMPLE_RATE = 96000;
// MDN says that the AudioContext implementation should at least support PCM sample rates from 8000-96000Hz
// FireFox throws an error for sample rates below 8000Hz
// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext
const limitToWebSafeSampleRate = (sampleRate: number) =>
    Math.min(Math.max(sampleRate, SAFE_MIN_SAMPLE_RATE), SAFE_MAX_SAMPLE_RATE);

export function dj_set_sfx_channel_volume(channel_num: number, volume: number) {
    if (!channels[channel_num]) {
        return;
    }

    for (const sfx of channels[channel_num]) {
        sfx.setVolume(volume / MAX_VOLUME);
    }
}

export function dj_play_sfx(
    sfx_num: number,
    freq: number,
    volume: number,
    panning: number,
    delay: number,
    channel: number
) {
    if (context.info.music_no_sound || context.info.no_sound) {
        return;
    }

    if (!sounds[sfx_num]) {
        console.warn(`Sound ${sfx_num} not loaded`);
        return;
    }

    const sfx = new Smp({ src: sounds[sfx_num], bitDepth: '8', sampleRate: limitToWebSafeSampleRate(freq) });
    const settings = dj_get_sfx_settings(sfx_num);
    sfx.setLoop(settings.loop);
    sfx.setVolume(volume / MAX_VOLUME);
    sfx.play();

    if (channel !== -1) {
        channels[channel] = channels[channel] || [];
        channels[channel].push(sfx);
    }

    return;
}

export function dj_get_sfx_settings(sfx_num: number) {
    return (
        soundSettings[sfx_num] || {
            loop: false,
            default_freq: 11025,
        }
    );
}

export function dj_set_sfx_settings(sfx_num: number, settings: SoundConfig) {
    soundSettings[sfx_num] = settings;
}

export function dj_set_nosound(enable: number) {
    return;
}

export function dj_start_mod() {
    if (context.info.no_sound) {
        return;
    }

    const track = getCurrentTrack();
    if (track === null) {
        return;
    }
    track.play();
}

export function dj_stop_mod() {
    return;
}

export function dj_init() {}

export function dj_deinit() {}

export function dj_stop() {
    const track = getCurrentTrack();
    if (track === null) {
        return;
    }
    track.stop().catch((e: unknown) => {
        if (e instanceof Error && e.message.includes('AudioNode.disconnect')) {
            // Ignore this error, the node is already disconnected, nothing to do
        }
    });
}

export function dj_ready_mod(mod_type: MOD) {
    currentTrack = mod_type;
}

export function dj_set_mod_volume(volume: number) {
    if (context.info.no_sound) {
        return;
    }

    const track = getCurrentTrack();
    if (track === null) {
        return;
    }
    track.setVolume(volume / MAX_VOLUME);
}

export function dj_set_sfx_volume(volume: number) {}

export function dj_mix() {}

export function dj_stop_sfx_channel(channel_num: number) {
    if (!channels[channel_num]) {
        return;
    }

    for (const sfx of channels[channel_num]) {
        sfx.stop();
    }
}

export function dj_load_sfx(filename: string, sfx_num: SFX) {
    const src = read_data(filename);
    const dest = new Uint8Array(src.byteLength / 2);
    for (let i = 0; i < dest.byteLength; i++) {
        const temp = src[i * 2] + (src[i * 2 + 1] << 8);
        dest[i] = temp;
    }
    sounds[sfx_num] = dest.buffer;
}

export function dj_load_mod(filename: string, mod_num: MOD) {
    const src = read_data(filename);
    const mod = new Mod({ src, audioWorkletUrl, wasmUrl });
    tracks[mod_num] = mod;
}

function handleUserGesture(event: Event) {
    if (event.isTrusted) {
        dj_start_mod();
        window.removeEventListener(event.type, handleUserGesture);
    }
}

function handleKeyboardUserGesture(event: KeyboardEvent) {
    dj_start_mod();
    const isArrowKeys =
        event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight';

    // Ignore arrow keys, as they are not considered user gestures in Firefox
    if (!isArrowKeys && event.isTrusted) {
        window.removeEventListener(event.type, handleKeyboardUserGesture);
    }
}

window.addEventListener('touchstart', handleUserGesture);
window.addEventListener('mousedown', handleUserGesture);
window.addEventListener('keydown', handleKeyboardUserGesture);
