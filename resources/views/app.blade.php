<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#faf9f6">
        <script>
            (function () {
                try {
                    var k = 'armillary-theme';
                    var s = localStorage.getItem(k);
                    var dark =
                        s === 'dark' ||
                        (s !== 'light' &&
                            window.matchMedia('(prefers-color-scheme: dark)')
                                .matches);
                    document.documentElement.classList.toggle('dark', dark);
                    var m = document.querySelector('meta[name="theme-color"]');
                    if (m) {
                        m.setAttribute(
                            'content',
                            dark ? '#1e2524' : '#faf9f6',
                        );
                    }
                } catch (e) {}
            })();
        </script>

        <link rel="icon" type="image/png" href="/brand/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/brand/favicon.svg" />
        <link rel="shortcut icon" href="/brand/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/brand/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Armillary" />
        <link rel="manifest" href="/brand/site.webmanifest" />

        @php($pageUrl = url()->current())
        @php($ogImage = url('/images/armillary-opengraph.png'))
        <link rel="canonical" href="{{ $pageUrl }}" />
        <meta property="og:site_name" content="{{ config('app.name', 'Armillary Software') }}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="{{ $pageUrl }}" />
        <meta property="og:title" content="{{ config('app.name', 'Armillary Software') }}" />
        <meta
            property="og:description"
            content="Armillary Software — contracting, assets, and deployed software."
        />
        <meta property="og:image" content="{{ $ogImage }}" />
        <meta property="og:image:alt" content="Armillary Software logo and name on a dark teal gradient background." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{ config('app.name', 'Armillary Software') }}" />
        <meta
            name="twitter:description"
            content="Armillary Software — contracting, assets, and deployed software."
        />
        <meta name="twitter:image" content="{{ $ogImage }}" />
        <meta name="twitter:image:alt" content="Armillary Software logo and name on a dark teal gradient background." />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
