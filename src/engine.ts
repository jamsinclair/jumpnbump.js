import { PalettedRenderer } from 'sdl/paletted-renderer';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import { main } from './main';
import type { MainOptions } from './main';
import ctx, { resetContext } from './context';

export type OptionalGameOptions = Partial<MainOptions>;

export type GameState = 'initial' | 'running' | 'paused' | 'stopped';

export class Engine {
    canvas: HTMLCanvasElement;
    options: MainOptions;
    renderer: PalettedRenderer;
    _onExit: (exitCode: number) => void = () => {};
    _onStateChange: (state: GameState) => void = () => {};
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
        this.changeState('running');
        return main(this.canvas, this.options).then((num) => this._onExit(num));
    }

    togglePause() {
        const isPaused = ctx.state === 'paused';
        this.changeState(isPaused ? 'running' : 'paused');
    }

    resume() {
        this.changeState('running');
    }

    pause() {
        this.changeState('paused');
    }

    stop() {
        this.changeState('stopped');
    }

    getState(): GameState {
        return ctx.state;
    }

    changeState(state: GameState) {
        ctx.state = state;
        this._onStateChange(state);
    }

    onStateChange(callback: (state: GameState) => void) {
        this._onStateChange = callback;
    }

    onExit(callback: (exitCode: number) => void) {
        this._onExit = callback;
    }
}
