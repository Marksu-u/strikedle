# Strikedle

Three daily mini-games about the Counter-Strike 2 scene: Wordle, Guessr and
More or Lessr. [strikedle.com](https://strikedle.com)

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Copy [`.env.example`](.env.example) to `.env.local` and set
`NEXT_PUBLIC_SITE_URL`.

## Scripts

| Command             | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Development server         |
| `npm run build`     | Production build           |
| `npm start`         | Serve the production build |
| `npm test`          | Tests (Vitest)             |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript check           |
| `npm run format`    | Format the code (Prettier) |
| `npm run generate`  | Regenerate the game data   |

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-intl, Vitest.

## Licence

MIT — see [`LICENSE`](LICENSE). The licence covers the code, not the player data
(`app/data/cs2/`).

Counter-Strike and Counter-Strike 2 are trademarks of Valve Corporation. This is
an independent fan project, not affiliated with Valve.
