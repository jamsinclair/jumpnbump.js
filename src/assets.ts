export type GobName = 'rabbit' | 'font' | 'objects' | 'numbers';

export class Gob {
    name: GobName;
    num_images: number;
    width: number[] = [];
    height: number[] = [];
    hs_x: number[] = [];
    hs_y: number[] = [];
    data: Uint8ClampedArray[] = [];
    orig_data: Uint8ClampedArray[] = [];
}

export class Pob {
    x: number;
    y: number;
    image: number;
    pob_data: Gob;
}

const gobs = new Map<GobName, Gob>();

export const register_gob = (gob: Gob) => {
    gobs.set(gob.name, gob);
}

export const get_gob = (name: GobName) => {
    return gobs.get(name);
}
