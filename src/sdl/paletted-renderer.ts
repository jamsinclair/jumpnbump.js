import crc32 from 'crc/calculators/crc32';

type Sprite = {
    key: string;
    width: number;
    height: number;
    data: Uint8ClampedArray;
    alphaColor?: number;
}

type PositionedSprite = Sprite & {
    x: number,
    y: number,
}

class PalettedCache {
    cache: Record<string, Record<string, ImageData>> = {}; 
    paletteKey: string = '';

    updatePaletteKey(key: string) {
        this.paletteKey = key;
    }

    purgeForKey(key: string) {
        delete this.cache[key];
    }

    get(key: string): ImageData | undefined {
        return this.cache[key]?.[this.paletteKey];
    }

    set(key: string, data: ImageData) {
        if (!this.cache[key]) {
            this.cache[key] = {};
        }

        this.cache[key][this.paletteKey] = data;
    }
}

function extractMaskFromBackground(background: Uint8ClampedArray, mask: Uint8ClampedArray): Uint8ClampedArray {
    const maskData = Uint8ClampedArray.from(mask);
    for (let i = 0; i < mask.length; i++) {
        if (maskData[i] === 1) {
            maskData[i] = background[i];
        }
    }

    return maskData;
}

export class PalettedRenderer {
    imageCache: PalettedCache = new PalettedCache(); 
    width: number;
    height: number;
    background: Sprite;
    mask: Sprite;
    currentObjects: PositionedSprite[];
    palette: Uint8ClampedArray;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.palette = new Uint8ClampedArray(256 * 3);
        this.currentObjects = [];
        this.background = {
            key: 'background',
            data: new Uint8ClampedArray(width * height * 3),
            width: this.width,
            height: this.height
        };
        this.mask = {
            key: 'mask',
            data: new Uint8ClampedArray(width * height * 3),
            width: this.width,
            height: this.height,
            alphaColor: 0
        };
        globalThis.renderer = this;
    }

    setPalette (palette: Uint8ClampedArray): void {
        this.palette = palette;
        this.imageCache.updatePaletteKey(crc32(palette as any).toString(16));
        // console.log('new cache key', this.imageCache.paletteKey);
    }

    registerBackground (background: Uint8ClampedArray): void {
        this.imageCache.purgeForKey( this.background.key);
        this.background.data = background
        const image = this.#renderPixels(background, this.width, this.height);
        this.imageCache.set(this.background.key, image);
    }

    registerMask (mask: Uint8ClampedArray): void {
        this.imageCache.purgeForKey(this.mask.key);
        this.mask.data = extractMaskFromBackground(this.background.data, mask);
        console.log(this.mask.data.filter(i => i !== 0));
        const image = this.#renderPixels(this.mask.data, this.width, this.height, this.mask.alphaColor);
        this.imageCache.set(this.mask.key, image);
    }

    getImage ({key, data, width, height, alphaColor }: Sprite): ImageData {
        const cached = this.imageCache.get(key);
        if (cached) {
            return cached;
        }
        const rendered = this.#renderPixels(data, width, height, alphaColor);
        this.imageCache.set(key, rendered);
        return rendered;
    }

    putObject (x: number, y: number, sprite: Sprite): void {
        this.currentObjects.push({ x, y, ...sprite });
        const rendered = this.getImage(sprite);
        this.imageCache.set(sprite.key, rendered);
    }

    #renderPixels (pixels: Uint8ClampedArray, width: number, height: number, alphaColor?: number): ImageData {
        const data = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < pixels.length; i++) {
            const colorIndex = pixels[i] * 3;
            data[i * 4] = this.palette[colorIndex];
            data[i * 4 + 1] = this.palette[colorIndex + 1];
            data[i * 4 + 2] = this.palette[colorIndex + 2];
            data[i * 4 + 3] = alphaColor === colorIndex ? 0 : 255;
        }
        return new ImageData(data, width, height);
    }

    render (): ImageData {
        const background = this.getImage(this.background);
        const currentFrame = Uint8ClampedArray.from(background.data);
        const spritesToRender = [
            ...this.currentObjects,
            { x: 0, y: 0, ...this.mask }
        ];
        for (let object of spritesToRender) {
            const image = this.getImage(object);
            const { x, y, width } = object;
            for (let i = 0; i < image.data.length; i += 4) {
                const xIndex = (i / 4) % width;
                const yIndex = Math.floor((i / 4) / width);
                const xPos = x + xIndex % width;
                const yPos = y + yIndex;
                if (xPos < 0 || xPos >= this.width || yPos < 0 || yPos >= this.height) {
                    continue;
                }
                const index = (yPos * this.width + xPos) * 4;
                if (image.data[i + 3] === 0) {
                    continue;
                }
                currentFrame[index] = image.data[i];
                currentFrame[index + 1] = image.data[i + 1];
                currentFrame[index + 2] = image.data[i + 2];
                currentFrame[index + 3] = image.data[i + 3];
            }
        }
        this.currentObjects = [];
        return new ImageData(currentFrame, this.width, this.height);
    }
}
