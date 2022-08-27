import ctx from './context';

const PAUSED_POLL_MS = 500;

export function run_in_frame_loop (updateFn: () => Promise<number>) {
    return new Promise((resolve) => {
        let loop = async () => {
            if (ctx.state === 'paused') {
                setTimeout(loop, PAUSED_POLL_MS);
                return;
            }

            if (ctx.state === 'stopped') {
                resolve(0);
                return;
            }

            let result = await updateFn();
            if (result !== -1) {
                resolve(result);
            } else {
                requestAnimationFrame(loop);
            }
        }

        loop();
    });
}
