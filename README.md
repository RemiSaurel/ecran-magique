# Écran Magique 🔴

A digital Etch A Sketch you can play with right in the browser: turn the knobs to draw, shake your device to erase, and publish your best sketches to a public gallery.

## Features

- Draw with two knobs, keyboard arrows, or a stylus/touch
- Shake to erase (device motion)
- Toy sounds and haptic feedback
- Publish sketches to a gallery, browse and like others

## Stack

- [Nuxt 4](https://nuxt.com/) (client-only SPA)
- [NuxtHub](https://hub.nuxt.com/) — SQLite/D1 database + Blob/R2 storage
- [Tailwind CSS 4](https://tailwindcss.com/) and [motion-v](https://motion.dev/)
- Deployed to Cloudflare Workers

## Getting started

```bash
git clone https://github.com/RemiSaurel/ecran-magique.git
cd ecran-magique
pnpm install
pnpm dev
```

Dev mode uses zero-config local storage (SQLite file + local blob in `.data/`). No environment variables are required to run locally.

## Deployment

Deploys to Cloudflare (Workers + D1 + R2) via the `cloudflare-module` Nitro preset. See `.env.example` for the Cloudflare account/token setup needed to deploy.

```bash
pnpm build
```

## Credits

Project idea based on [this tweet](https://x.com/adrianabelarde_/status/2076290018193424792).
