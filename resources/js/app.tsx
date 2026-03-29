import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `-${appName.toLowerCase()}-` : appName),
    progress: {
        color: '#A19ABD',
    },
});
