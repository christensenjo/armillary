import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            /** True when `APP_ENV=local` — used for local-only tooling on the client. */
            appLocal: boolean;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
