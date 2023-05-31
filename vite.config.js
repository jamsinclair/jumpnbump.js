import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    build: {
        target: 'es2020',
    },
    plugins: [preact()],
});
