import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
        include: ['@inertiajs/react', 'react', 'react-dom'],
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],

    fmt: {
        semi: true,
        singleQuote: true,
        printWidth: 80,
        tabWidth: 4,
        htmlWhitespaceSensitivity: 'css',
        sortPackageJson: true,
        sortImports: {
            internalPattern: ['@/', '~/'],
        },
        sortTailwindcss: {
            stylesheet: 'resources/css/app.css',
            functions: ['clsx', 'cn', 'cva'],
        },
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
            'resources/js/actions/**',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        overrides: [
            {
                files: ['**/*.yml'],
                options: { tabWidth: 2 },
            },
        ],
    },
});
