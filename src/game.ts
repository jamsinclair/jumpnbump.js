import { Engine } from './engine';

const engine = new Engine(document.getElementById('canvas') as HTMLCanvasElement);

globalThis.togglePause = () => {
    engine.togglePause();
};

fetch('./jumpbump.dat')
    .then((res) => res.arrayBuffer())
    .then((data) => {
        engine.init({ dat: data });
        engine.run();
    });
