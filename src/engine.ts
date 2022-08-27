import { PalettedRenderer } from "sdl/paletted-renderer";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants";
import { main } from "./main";
import ctx, { resetContext } from './context'

export class Engine {
    canvas: HTMLCanvasElement;
    datafile: ArrayBuffer;
    renderer: PalettedRenderer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
    }

    init (options: { datafile: ArrayBuffer }) {
        this.datafile = options.datafile;
        resetContext();
    }

    async run () {
        ctx.state = 'running';
        return main(this.canvas, this.datafile);
    }

    togglePause () {
        const isPaused = ctx.state === 'paused';
        ctx.state = isPaused ? 'running' : 'paused';
    }

    resume () {
        ctx.state = 'running';
    }

    pause () {
        ctx.state = 'paused';
    }

    stop () {
        ctx.state = 'stopped';
    }

    getState () {
        return ctx.state;
    }
}
