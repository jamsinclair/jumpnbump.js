import { assert } from "../c";
import { Gob } from "../core";
import { SDL_Init } from "./sdl";
import g_ctx from '../context';
import { PalettedRenderer } from "./paletted-renderer";

const screen_width = 400;
const screen_height = 256;
const PALETTE_256_SIZE = 768;

let background;
let mask;
let background_drawn = 0;

let drawing_enable = 0;

const font_text_chars = "!\"'(),-./0123456789:;@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~äâÄÂöÖ";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let renderer: PalettedRenderer;

export function open_screen() {
    SDL_Init();
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");
    canvas.width = screen_width;
    canvas.height = screen_height;
    renderer = new PalettedRenderer(screen_width, screen_height);
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
    renderer.putObject(x, y, {
        key: 'fly',
        data: Uint8ClampedArray.from([color, color, color]),
        height: 1,
        width: 1,
    });
    return;
}

export function put_pob(page: number, x: number, y: number, image: number, gob: Gob, use_mask: number, mask_pic: any) {
	assert(drawing_enable == 1);
	assert(gob);
	assert(image >= 0);
	assert(image < gob.num_images);

    const sprite = {
        key: `${gob.name}_${image}`,
        data: gob.data[image],
        height: gob.height[image],
        width: gob.width[image],
        alphaColor: 0,
    };
    
    const hs_x = gob.hs_x[image];
    const hs_y = gob.hs_y[image];
    renderer.putObject(x - hs_x, y - hs_y, sprite);
    return;
}

export function register_background(pixels: Uint8ClampedArray, pal: Uint8ClampedArray) {
    renderer.setPalette(pal);
    background = renderer.registerBackground(pixels);
}

export function register_mask(pixels: Uint8ClampedArray, pal: Uint8ClampedArray) {
    renderer.setPalette(pal);
    background = renderer.registerMask(pixels);
}

export function register_gob(handle: number, gob: Gob, len: number) {
        
}    

// export async function to_bitmap_image_data(colormap: number[], palette: number[] | Rgba[], width: number, height: number, transparency_sum: number | null = null): Promise<HTMLImageElement> {
//     const image_data = new Uint8ClampedArray(colormap.length * 4);
//     //Took some hints from the public domain https://github.com/arcollector/PCX-JS/blob/master/pcx.js#L447
//     for (let i = 0; i < colormap.length; i++) {
//         const colorIndex = colormap[i];
//         let color;
//         if (typeof palette[colorIndex] === 'number') {
//             color = rgbFromArray(colorIndex * 3, palette as number[]);
//         } else {
//             color = palette[colorIndex];
//         }
//         const a = color.r + color.g + color.b === transparency_sum ? 0 : 255;
//         image_data[i * 4 + 0] = color.r;
//         image_data[i * 4 + 1] = color.g
//         image_data[i * 4 + 2] = color.b;
//         image_data[i * 4 + 3] = a;
//     }
//     return image_data_array_to_image(image_data, width, height);
// }

export function setpalette(index: number, count: number, palette: Uint8ClampedArray)
{
    const newPal = Uint8ClampedArray.from(renderer.palette);
	for (let i = 0; i < count; i++) {
        newPal[(i + index) * 3] = palette[(i) * 3] << 2;
        newPal[(i + index) * 3 + 1] = palette[(i) * 3 + 1] << 2;
        newPal[(i + index) * 3 + 2] = palette[(i) * 3 + 2] << 2;
	}
	renderer.setPalette(newPal);
}

export function fillpalette(red: number, green: number, blue: number) {
	const newPal = new Uint8ClampedArray(PALETTE_256_SIZE);
	for (let i = 0; i < newPal.length; i += 3) {
        newPal[(i * 3)] = red << 2;
        newPal[(i * 3) + 1] = green << 2;
        newPal[(i * 3) + 2] = blue << 2;
	}
	return newPal;
}

function get_color_from_palette(index: number) {
    return {
        r: renderer.palette[index * 3],
        g: renderer.palette[index * 3 + 1],
        b: renderer.palette[index * 3 + 2],
        a: 255,
    };
}

export function draw_begin () {
    assert(!drawing_enable);

    drawing_enable = 1;
    if (background) {
        ctx.drawImage(background, 0, 0);
    } else {
        const color = get_color_from_palette(0);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fillRect(0, 0, screen_width, screen_height);
    }
}

export function draw_end () {
    ctx.putImageData(renderer.render(), 0, 0);
    drawing_enable = 0;
}

export function put_text(page: number, x: number, y: number, text: string, align: number) {
    assert(drawing_enable == 1);

    let width = 0;
    let cur_x = 0;
    let letter_array = [...text];

    for (let letter of letter_array) {
        if (letter === ' ') {
            width += 5;
            continue;
        }

        const image = font_text_chars.indexOf(letter);
        if (image === - 1) {
            continue;
        }

        width += pob_width(image, g_ctx.font_gobs) + 1;
    }

    switch (align) {
		case 0:
			cur_x = x;
			break;
		case 1:
			cur_x = x - width;
			break;
		case 2:
			cur_x = Math.floor(x - width / 2);
			break;
		default:
			cur_x = 0; /* this should cause error? -Chuck */
			break;
	}

    for (let letter of letter_array) {
        if (letter === ' ') {
            cur_x += 5;
            continue;
        }

        const image = font_text_chars.indexOf(letter);
        if (image === - 1) {
            continue;
        }

        put_pob(page, cur_x, y, image, g_ctx.font_gobs, 2, null);
		cur_x += pob_width(image, g_ctx.font_gobs) + 1;
    }
}

export function clear_lines(page: number, y: number, count: number, color_num: number) {
    // const color = get_color_from_palette(color_num);
    // ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    // ctx.fillRect(0, y, screen_width, count * 8);
}

export function recalculate_gob(gob: Gob, palette: Uint8ClampedArray) {

}

export function redraw_pob_backgrounds(page: number) {

}
