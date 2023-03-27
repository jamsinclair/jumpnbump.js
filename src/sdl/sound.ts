import { read_data } from "../data";
import { MAX_VOLUME, MOD, SFX } from "../constants";
import { Smp } from '@webtrack/smp';

type SoundConfig = { loop: boolean, default_freq: number };
const soundSettings: SoundConfig[] = [];
const sounds: ArrayBuffer[] = [];
const channels: Smp[][] = [];

export function dj_set_sfx_channel_volume (channel_num: number, volume: number) {
    if (!channels[channel_num]) {
        return;
    }

    for (const sfx of channels[channel_num]) {
        sfx.setVolume(volume / MAX_VOLUME);
    }
}

export function dj_play_sfx(sfx_num: number, freq: number, volume: number, panning: number, delay: number, channel: number) {
    if (!sounds[sfx_num]) {
        console.warn(`Sound ${sfx_num} not loaded`);
        return;
    }

    const sfx = new Smp({ src: sounds[sfx_num], bitDepth: '8', sampleRate: freq });
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

export function dj_get_sfx_settings (sfx_num: number) {
    return soundSettings[sfx_num] || {
        loop: false,
        default_freq: 11025
    };
}

export function dj_set_sfx_settings (sfx_num: number, settings: SoundConfig) {
    soundSettings[sfx_num] = settings;
}

export function dj_set_nosound (enable: number) {
    return;
}

export function dj_start_mod () {
    return;
}

export function dj_stop_mod () {
    return;
}

export function dj_init () {
    
}

export function dj_deinit () {
    
}

export function dj_stop () {
    
}

export function dj_ready_mod (mod_type: MOD) {

}

export function dj_set_mod_volume (volume: number) {

}

export function dj_set_sfx_volume (volume: number) {

}

export function dj_mix () {

}

export function dj_stop_sfx_channel (volume: number) {

}

export function dj_load_sfx (filename: string, sfx_num: SFX) {
    const src = read_data(filename);
    const dest = new Uint8Array(src.byteLength / 2);
    for (let i = 0; i < dest.byteLength; i++) {
        const temp = src[i * 2] + (src[(i * 2) + 1] << 8);
        dest[i] = temp;
    }
    sounds[sfx_num] = dest.buffer;
}
