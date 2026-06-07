# OneNation

A geography guessing game of categorical elimination. You receive clues that describe a secret country — each time you guess a country that fits all clues so far, you get another clue. Only one nation will ultimately match every clue. Find it to win!

Inspired by [these quizzes](https://www.jetpunk.com/user-quizzes/176412/category-elimination-countries).

## How It Works

Clues narrow down the set of possible countries across nine dimensions: name, capital, population, land area, bordering countries, landlocked status, driving side, region, and subregion. The game's clue engine selects each new clue to cut the remaining candidates roughly in half.

**Hard mode** shows all 243 countries in the autocomplete rather than only countries still matching the current clues.

## Development

```sh
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build (set BASE_PATH=/OneNation for GitHub Pages)
npm run preview    # serve the production build locally
npm run check      # svelte-check + tsc
npm run test       # Vitest unit tests
npm run build-data # re-fetch country data from RestCountries API
```

## Tech Stack

- **SvelteKit** (Svelte 5 runes, adapter-static, SSR disabled) — fully static, no server
- **TypeScript** throughout
- **Vitest** for unit tests (`src/**/*.test.ts`)
- Deployed to **GitHub Pages**

Country data comes from the [RestCountries v3.1 API](https://restcountries.com/) and is bundled at build time (`data/countries.json`). Run `npm run build-data` to refresh it.
