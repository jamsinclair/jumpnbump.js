import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    build: {
        target: 'es2018',
    },
    plugins: [
        preact({
            prerender: {
                enabled: true,
                renderTarget: '#app',
            },
        }),
        tailwindcss(),
    ],
});
