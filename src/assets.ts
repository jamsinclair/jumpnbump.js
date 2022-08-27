type GobNames = 'rabbit' | 'font' | 'objects' | 'numbers';

export class Gob {
    name: GobNames;
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

const gobs = new Map<GobNames, Gob>();

export const register_gob = (gob: Gob) => {
    gobs.set(gob.name, gob);
}

export const get_gob = (name: GobNames) => {
    return gobs.get(name);
}
