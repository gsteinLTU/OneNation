# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (http://localhost:5173)
npm run build        # production build to build/ (set BASE_PATH=/OneNation for GitHub Pages)
npm run preview      # serve the production build locally
npm run check        # svelte-check + tsc — run before committing
npm run test         # Vitest (src/**/*.test.ts)
npm run build-data   # fetch from RestCountries API and write data/countries.json + src/lib/data/countries.json
```

Run a single Vitest test file: `npx vitest run src/lib/game/clues.test.ts`

## Architecture

This is a **fully static SvelteKit app** (adapter-static, SSR disabled, prerendered) deployed to GitHub Pages. There is no server. It's a geography guessing game where players narrow down a secret country using clues.

**Svelte 5 runes mode is forced project-wide** (`compilerOptions.runes: true` in svelte.config.js). Use `$state`, `$derived`, `$effect` — not stores.

### Data pipeline

`data/countries.json` is committed and bundled at build time. It comes from `scripts/build-data.ts`, which fetches the RestCountries v3.1 API (`?fields=...` — 10-field max). Run `npm run build-data` when country data needs updating. The same JSON is copied to both `data/` and `src/lib/data/` (the latter is what Vite actually bundles).

### Game logic (`src/lib/game/`)

- **`types.ts`** — domain types: `CountryData`, `CountryId`, and the `Clue` discriminated union (9 variants: `name`, `capitalname`, `population`, `land_area`, `borders`, `landlocked`, `car_side`, `region`, `subregion`)
- **`countries.ts`** — loads the JSON, exposes `countries` record and `countriesList`, `pickCountry()` (filters to population > 100k), `findId()`, `nameFromId()`
- **`clues.ts`** — clue matching (`matchClue`, `matchesClues`, `getRemainingCountries`) and generation (`generateClue`, `selectBestClue`). `generateClue` picks a random unused clue type then finds the best candidate within that type (minimises `|remaining/2 - pool_after_clue|`)
- **`gameState.svelte.ts`** — `GameState` class using Svelte 5 `$state`/`$derived`. Exported as singleton `game`. Handles guessing logic, win/loss, and `newGame()`. `game.startTime` is set but the page owns the displayed timer (see below)
- **`clueText.ts`** — formats a `Clue` to a human-readable string

### UI (`src/routes/+page.svelte`)

Single-page app. Key state:
- `game` singleton from `gameState.svelte.ts` — owns clues, target, win/loss
- `timerStart: $state<number | null>` — local to the page, **not** `game.startTime`, to prevent the timer running behind the help modal
- `filteredNames: $derived` — the datalist autocomplete source; shows only countries matching current clues in normal mode, all 243 in hard mode
- `showHelp: $state(true)` — help modal shown on first load; timer only starts when `startPlaying()` is called

**`$effect` dependency tracking**: read all reactive values before any early `return` so Svelte 5 registers them as dependencies (see the timer effect).

### Tests

Vitest (`src/**/*.test.ts`) — tests clue matching, clue generation, and country data helpers.
