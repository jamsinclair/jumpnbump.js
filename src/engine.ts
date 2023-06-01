import { PalettedRenderer } from 'sdl/paletted-renderer';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import { main } from './main';
import type { MainOptions } from './main';
import ctx, { resetContext } from './context';

export type OptionalGameOptions = Partial<MainOptions>;

export class Engine {
    canvas: HTMLCanvasElement;
    options: MainOptions;
    renderer: PalettedRenderer;
    _onExit: (exitCode: number) => void = () => {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
    }

    init(options: MainOptions) {
        this.options = options;
        resetContext();
    }

    async run() {
        ctx.state = 'running';
        return main(this.canvas, this.options).then((num) => this._onExit(num));
    }

    togglePause() {
        const isPaused = ctx.state === 'paused';
        ctx.state = isPaused ? 'running' : 'paused';
    }

    resume() {
        ctx.state = 'running';
    }

    pause() {
        ctx.state = 'paused';
    }

    stop() {
        ctx.state = 'stopped';
    }

    getState() {
        return ctx.state;
    }

    onExit(callback: (exitCode: number) => void) {
        this._onExit = callback;
    }
}
