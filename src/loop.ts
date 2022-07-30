export function run_in_frame_loop (updateFn: () => Promise<number>) {
    return new Promise((resolve) => {
        let loop = async () => {
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
