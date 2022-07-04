import { BAN } from "./constants";
import { Gob } from "./core";

let datafile_buffer;
let datafile_index;

const PIXEL_WIDTH = 400;
const PIXEL_HEIGHT = 256;
const PALETTE_256_SIZE = 768;

type FileRef = {
    offset: number;
    len: number;
}

const flip = false;
 
function read_dat_index(): Record<string, FileRef> {
    const dat_index = {};

    let ptr = 0;
    const num_files_contained = read_four_byte_int(ptr);
    ptr += 4;

    for (var file_number = 0; file_number < num_files_contained; file_number++) {
        const file_name = String.fromCharCode.apply(null, datafile_buffer.subarray(ptr, ptr + 12)).replace(/[^\x20-\xFF]/g, '');
        ptr += 12;
        const file_offset = read_four_byte_int(ptr);
        ptr += 4;
        const file_len = read_four_byte_int(ptr);
        ptr += 4;
        dat_index[file_name.toUpperCase()] = {
            offset: file_offset,
            len: file_len,
        };
    }

    return dat_index;
}

function read_four_byte_int(ptr: number): number {
    return ((datafile_buffer[ptr + 0] << 0) +
                (datafile_buffer[ptr + 1] << 8) +
                (datafile_buffer[ptr + 2] << 16) +
                (datafile_buffer[ptr + 3] << 24));
}

export function preread_datafile (file: ArrayBuffer) {
    datafile_buffer = new Uint8Array(file);
    datafile_index = read_dat_index();
    return;
}

export function dat_open(requested_file_name: string): number {
    const offset = datafile_index[requested_file_name.toUpperCase()].offset;
    if (offset == null) {
        throw "Could not find index for " + requested_file_name;
    }
    return offset;
}

export function dat_filelen(requested_file_name: string): number {
    const file_len = datafile_index[requested_file_name.toUpperCase()].len;
    if (file_len == null) {
        throw "Could not find file length for " + requested_file_name;
    }
    return file_len;
}

export function read_pcx(filename) {
    let handle = dat_open(filename);
    handle += 128; //Assume header says PCX_256_COLORS (8 bits per pixel, 1 plane)
    const buf_len = PIXEL_WIDTH * PIXEL_HEIGHT;
    const colormap = new Uint8Array(PIXEL_WIDTH * PIXEL_HEIGHT);
    const palette = new Uint8Array(PALETTE_256_SIZE);
    let ofs = 0;
    while (ofs < buf_len) {
        let a = datafile_buffer[handle++];
        if ((a & 0xc0) == 0xc0) {
            var b = datafile_buffer[handle++];
            a &= 0x3f;
            for (var c1 = 0; c1 < a && ofs < buf_len; c1++)
                colormap[ofs++] = b;
        } else {
            colormap[ofs++] = a;
        }
    }
    handle++;
    for (let c1 = 0; c1 < PALETTE_256_SIZE; c1++) {
        palette[c1] = datafile_buffer[handle++];
    }

    return { palette: palette, colormap: colormap };
}

export function read_gob(filename) {
    const handle = dat_open(filename);
    const len = dat_filelen(filename);
    const gob_data = datafile_buffer.subarray(handle, handle + len);

    const gob = new Gob();
    gob.num_images = (gob_data[0]) + (gob_data[1] << 8);

    for (let i = 0; i < gob.num_images; i++) {
        let offset = (gob_data[i * 4 + 2]) + (gob_data[i * 4 + 3] << 8) + (gob_data[i * 4 + 4] << 16) + (gob_data[i * 4 + 5] << 24);

        gob.width[i] = ((gob_data[offset]) + (gob_data[offset + 1] << 8));
        offset += 2;
        gob.height[i] = ((gob_data[offset]) + (gob_data[offset + 1] << 8));
        offset += 2;
        gob.hs_x[i] = ((gob_data[offset]) + (gob_data[offset + 1] << 8));
        offset += 2;
        gob.hs_y[i] = ((gob_data[offset]) + (gob_data[offset + 1] << 8));
        offset += 2;

        let image_size = gob.width[i] * gob.height[i];
        gob.orig_data[i] = gob_data.subarray(offset, offset + image_size);
        gob.data[i] = gob.orig_data[i];
    }

    return gob;
}

export function read_level() {
	let handle = dat_open("levelmap.txt");
    let chr: number;
    const ban_map: number[][] = new Array(17).fill([]);

	for (let c1 = 0; c1 < 16; c1++) {
		for (let c2 = 0; c2 < 22; c2++) {
			while (1) {
				const chr = datafile_buffer[handle++] - ("0".charCodeAt(0));
				if (chr >= 0 && chr <= 4)
					break;
			}
			if (flip)
				ban_map[c1][21 - c2] = chr;
			else
				ban_map[c1][c2] = chr;
		}
	}

	for (let c2 = 0; c2 < 22; c2++)
		ban_map[16][c2] = BAN.SOLID;

	return ban_map;
}
