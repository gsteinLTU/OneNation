// Game is fully client-side — no SSR to avoid hydration mismatches from
// Math.random() being called at build time vs. runtime.
export const ssr = false;
export const prerender = true;
