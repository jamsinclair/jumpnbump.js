async function to_bitmap_image_data(colormap: number[], palette: number[] | Rgba[], width: number, height: number, transparency_sum: number | null = null): Promise<HTMLImageElement> {
    const image_data = new Uint8ClampedArray(colormap.length * 4);
    //Took some hints from the public domain https://github.com/arcollector/PCX-JS/blob/master/pcx.js#L447
    for (var i = 0; i < colormap.length; i++) {
        const colorIndex = colormap[i];
        let color;
        if (typeof palette[colorIndex] === 'number') {
            color = rgbFromArray(colormap[colorIndex] * 3, palette as number[]);
        } else {
            color = palette[colorIndex];
        }
        const a = color.r + color.g + color.b === transparency_sum ? 0 : 255;
        if (colorIndex > 50) {
            console.log('not black');
        }
        image_data[i * 4 + 0] = color.r;
        image_data[i * 4 + 1] = color.g
        image_data[i * 4 + 2] = color.b;
        image_data[i * 4 + 3] = a;
    }
    return image_data_array_to_image(image_data, width, height);
}
