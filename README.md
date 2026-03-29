# [Armillary Software](https://armillary.dev)

Brand site for Armillary, software works created by Joel Christensen.

## Develop

This site is a **Laravel** app. The backend serves HTTP, runs routes, and renders the root **Inertia** document so pages can be **server-rendered** (SSR): the initial HTML comes from Laravel + Inertia’s SSR pipeline, then **React** hydrates in the browser.

Front-end dependencies and scripts use **pnpm** (see `packageManager` in `package.json`). **Vite Plus** (`vite-plus`) wraps **Vite** and is wired in `vite.config.ts`—it runs the dev/build tooling and also supplies formatting, linting, and `vp check` via the `vp` CLI.

### First-time setup

Prerequisites: [PHP](https://www.php.net/) **8.3+**, [Composer](https://getcomposer.org/), and [Node.js](https://nodejs.org/) **20+** (includes [Corepack](https://nodejs.org/api/corepack.html), which installs the **pnpm** version pinned in `package.json`’s `packageManager` field—you do not need a separate pnpm install).

From the project root:

```sh
composer run setup
```

That installs PHP dependencies, prepares `.env`, migrates the database, runs **`corepack enable`**, then **`pnpm install`** and **`pnpm run build`**.

To do the same steps by hand: `composer install`, copy `.env` from `.env.example`, `php artisan key:generate`, migrate as needed, then **`corepack enable`**, then **`pnpm install`** and **`pnpm run build`**.

### Run locally

Complete **First-time setup** first so Corepack and `node_modules` are in place.

**Option A — [Laravel Herd](https://herd.laravel.com/) (recommended)**

Herd serves PHP for you. After the site is available in Herd, start the JS toolchain so Vite Plus can serve assets and Inertia’s dev SSR.

```sh
vp dev
```

**Option B — all-in-one (no Herd or you want Artisan + queue + Vite)**

```sh
composer run dev
```

This uses `concurrently` to run `php artisan serve`, `php artisan queue:listen`, and `pnpm run dev` together.