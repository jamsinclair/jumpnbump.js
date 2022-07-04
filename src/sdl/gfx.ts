import { Gob } from "../core";

const PIXEL_WIDTH = 400;
const PIXEL_HEIGHT = 256;
const PALETTE_256_SIZE = 768;

let background = null;
let background_drawn = 0;
let mask = null;

let sdl_palette_colors = [];

let drawing_enable = 0;

export class Offscreen_Canvas {
    width: number;
    height: number;
    offscreenCanvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor (width, height) {
        this.offscreenCanvas = document.createElement("canvas");
        this.width = width;
        this.height = height;
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        this.context = this.offscreenCanvas.getContext("2d");
    }

    draw_image_data_array(image_data_array) {
        const img_data = this.context.createImageData(this.width, this.height);
        img_data.data.set(image_data_array);
        this.context.putImageData(img_data, 0, 0);
    }

    draw_masked(image, mask) {
        this.context.drawImage(image, 0, 0);
        this.context.globalCompositeOperation = "destination-out";
        this.context.drawImage(mask, 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    to_image(): Promise<HTMLImageElement> {
        var img = new Image(this.width, this.height);
        img.src = this.offscreenCanvas.toDataURL();
        return new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }
}

export function pob_width(image: number, gob: Gob)
{
	return gob.width[image];
}

export function pob_height(image: number, gob: Gob)
{
	return gob.height[image];
}

export function pob_hs_x(image: number, gob: Gob)
{
	return gob.hs_x[image];
}

export function pob_hs_y(image: number, gob: Gob)
{
	return gob.hs_y[image];
}

export function get_pixel (page: number, x: number, y: number): number {
    return 0;
}

export function set_pixel(page: number, x: number, y: number, color: number) {
    return;
}

export function put_pob(page: number, x: number, y: number, image: number, gob: Gob, use_mask: number, mask_pic: any) {
    return;
}


export async function register_background(pixels: number[], pal: number[]) {
    background_drawn = 0;
    background = await bitmap_from_pcx_file(pixels, pal, 0);
}

export function register_mask(pixels: number[]) {
    
}

export function register_gob(handle: number, gob: Gob, len: number) {
        
}    

function image_data_array_to_image(image_data_array, width, height): Promise<HTMLImageElement> {
    const offscreen = new Offscreen_Canvas(width, height);
    offscreen.draw_image_data_array(image_data_array);
    return offscreen.to_image();
}

async function bitmap_from_pcx_file(colormap: number[], palette: number[], transparency_sum: number): Promise<HTMLImageElement> {
    var image_data = new Uint8ClampedArray(colormap.length * 4);
    //Took some hints from the public domain https://github.com/arcollector/PCX-JS/blob/master/pcx.js#L447
    for (var i = 0; i < colormap.length; i++) {
        var colorIndex = colormap[i] * 3;
        var r = palette[colorIndex];
        var g = palette[colorIndex + 1];
        var b = palette[colorIndex + 2];
        var a = r + g + b === transparency_sum ? 0 : 255;
        image_data[i * 4 + 0] = r;
        image_data[i * 4 + 1] = g
        image_data[i * 4 + 2] = b;
        image_data[i * 4 + 3] = a;
    }

    return image_data_array_to_image(image_data, PIXEL_WIDTH, PIXEL_HEIGHT);
}

export function setpalette(index: number, count: number, palette: number[])
{
    const colors = [];
	for (let i = 0; i < count; i++) {
        colors[i] = {};
		colors[i].r = palette[i * 3 + 0] << 2;
		colors[i].g = palette[i * 3 + 1] << 2;
		colors[i].b = palette[i * 3 + 2] << 2;
		colors[i].a = 255;
	}
	SDL_SetPaletteColors(colors, index, count);
}

export function fillpalette(red: number, green: number, blue: number) {
	const colors = [];

	for (let i = 0; i < 256; i++) {
        colors[i] = {};
		colors[i].r = red << 2;
		colors[i].g = green << 2;
		colors[i].b = blue << 2;
		colors[i].a = 255;
	}
	SDL_SetPaletteColors(colors, 0, 256);
}

function SDL_SetPaletteColors(colors: number[], start: number, count: number) {
    sdl_palette_colors.splice(start, count, ...colors);
}

export function draw_begin () {
    drawing_enable = 1;
}

export function draw_end () {
    drawing_enable = 0;
}

export function put_text(page: number, x: number, y: number, text: string, align: number) {

}

export function clear_lines(page: number, y: number, count: number, color: number) {
    
}

export function recalculate_gob(gob: Gob, palette: number[]) {

}

export function redraw_pob_backgrounds(page: number) {

}
