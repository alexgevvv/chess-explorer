# Chess Explorer

A minimal local chess board. Move pieces by clicking or dragging, choose a promotion piece, and reset to the starting position. Legal destinations are not highlighted.

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

```sh
npm test
npm run lint
npm run build
```

On Windows PowerShell, use `npm.cmd` if the shell blocks `npm`.

`src/board.ts` contains chess operations using chess.js. `src/App.tsx` contains the React interface. A Chess object retains the position and move history; React receives an updated FEN after each move.

This version has no network requests for games, database, engine, analysis branches or Telegram integration. Reloading starts a new game.
