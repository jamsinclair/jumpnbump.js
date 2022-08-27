import { assert } from "../c";
import { get_gob, Gob } from "../assets";
import { PalettedRenderer } from "./paletted-renderer";
import { PALETTE_256_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";

let drawing_enable = 0;

const font_text_chars = "!\"'(),-./0123456789:;@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~äâÄÂöÖ";

let ctx: CanvasRenderingContext2D;
let renderer: PalettedRenderer;

export function gfx_init(canvas: HTMLCanvasElement) {
    ctx = canvas.getContext("2d");
    renderer = new PalettedRenderer(SCREEN_WIDTH, SCREEN_HEIGHT);
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
	// assert(drawing_enable == 1);
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
    renderer.registerBackground(pixels);
}

export function register_mask(pixels: Uint8ClampedArray, pal: Uint8ClampedArray) {
    renderer.registerMask(pixels);
}

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
	renderer.setPalette(newPal);
}

export function draw_begin () {
    drawing_enable = 1;
}

export function draw_end () {
    ctx.putImageData(renderer.render(), 0, 0);
    drawing_enable = 0;
}

export function put_text(page: number, x: number, y: number, text: string, align: number) {
    assert(drawing_enable == 1);
    const font_gobs = get_gob('font');

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

        width += pob_width(image, font_gobs) + 1;
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

        put_pob(page, cur_x, y, image, font_gobs, 2, null);
		cur_x += pob_width(image, font_gobs) + 1;
    }
}
