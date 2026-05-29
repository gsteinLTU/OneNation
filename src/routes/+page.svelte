<script lang="ts">
	import { game } from '$lib/game/gameState.svelte.js';
	import { clueToString } from '$lib/game/clueText.js';
	import { countries, countriesList } from '$lib/game/countries.js';
	import { getRemainingCountries } from '$lib/game/clues.js';

	const allCountryNames = countriesList.map((id) => countries[id].names[0]).sort();

	let guessValue = $state('');
	let elapsed = $state(0);
	let flashResult = $state<boolean[] | null>(null);
	let inputEl: HTMLInputElement | undefined;
	let showHelp = $state(true);
	let hardMode = $state(false);
	let isFirstLoad = true;

	const filteredNames = $derived(
		hardMode
			? allCountryNames
			: getRemainingCountries(game.clues).map((id) => countries[id].names[0]).sort()
	);

	$effect(() => {
		const start = game.startTime;
		elapsed = Math.floor((Date.now() - start) / 1000);
		if (game.gameOver) return;

		const id = setInterval(() => {
			elapsed = Math.floor((Date.now() - start) / 1000);
		}, 1000);

		return () => clearInterval(id);
	});

	function formatTime(s: number): string {
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	}

	function submitGuess() {
		const name = guessValue.trim();
		if (!name || game.gameOver) return;
		guessValue = '';

		const result = game.guess(name);
		if (!result.correct && result.matching) {
			flashResult = result.matching;
			setTimeout(() => (flashResult = null), 1000);
		}
	}

	function startPlaying() {
		showHelp = false;
		if (isFirstLoad) {
			isFirstLoad = false;
			game.startTime = Date.now();
			setTimeout(() => inputEl?.focus(), 50);
		}
	}

	function startNewGame() {
		game.newGame();
		guessValue = '';
		flashResult = null;
		inputEl?.focus();
	}
</script>

{#if showHelp}
	<div class="modal-backdrop" onclick={startPlaying}>
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<h2>How to Play</h2>
			<ul>
				<li>A secret country has been selected.</li>
				<li>Each clue describes a property of that country.</li>
				<li>
					Guess any country that matches <strong>all</strong> the clues shown. A correct guess
					that isn't the answer earns you a new clue.
				</li>
				<li>
					Watch the <strong>Countries remaining</strong> counter — it tells you how many countries
					still fit all the clues.
				</li>
				<li>Win by guessing the country when you're ready!</li>
			</ul>
			<div class="modal-mode">
				<label>
					<input type="checkbox" bind:checked={hardMode} />
					<span>
						<strong>Hard mode</strong> — show all country names in suggestions instead of
						filtering to matching countries
					</span>
				</label>
			</div>
			<button class="btn-start" onclick={startPlaying}>Start Playing</button>
		</div>
	</div>
{/if}

<header>
	<span class="logo">OneNation</span>
	<div class="header-actions">
		<button class="btn-ghost btn-help" onclick={() => (showHelp = true)} aria-label="How to play">
			?
		</button>
		<button class="btn-ghost" onclick={startNewGame}>New Game</button>
	</div>
</header>

<main>
	{#if game.gameOver}
		<div class="banner" class:won={game.won} class:lost={!game.won}>
			<p>{game.won ? 'Correct!' : 'The correct answer was:'}</p>
			<strong>{game.answer}</strong>
			<button onclick={startNewGame}>Play Again</button>
		</div>
	{/if}

	<div class="stats">
		<div class="stat">
			<span class="stat-label">Time</span>
			<span class="stat-value">{formatTime(elapsed)}</span>
		</div>
		<div class="stat">
			<span class="stat-label">Countries remaining</span>
			<span class="stat-value">{game.remaining}</span>
		</div>
	</div>

	<div class="guess-area">
		<div class="guess-header">
			<label for="guess">Your guess</label>
			<label class="mode-toggle">
				<input type="checkbox" bind:checked={hardMode} />
				Hard mode
			</label>
		</div>
		<input
			id="guess"
			type="text"
			list="country-list"
			placeholder="Type a country name…"
			autocomplete="off"
			spellcheck="false"
			disabled={game.gameOver}
			bind:value={guessValue}
			bind:this={inputEl}
			onkeydown={(e) => e.key === 'Enter' && submitGuess()}
			onchange={submitGuess}
		/>
		<datalist id="country-list">
			{#each filteredNames as name}
				<option value={name}></option>
			{/each}
		</datalist>
	</div>

	<section>
		<h2 class="section-label">Clues</h2>
		<ul class="clues">
			{#each game.clues as clue, i}
				{@const flash = flashResult?.[i]}
				<li class="clue" class:correct={flash === true} class:wrong={flash === false}>
					{clueToString(clue)}
				</li>
			{/each}
		</ul>
	</section>

	{#if !game.gameOver}
		<button class="btn-giveup" onclick={() => game.giveUp()}>Give Up</button>
	{/if}
</main>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	:global(body) {
		font-family: system-ui, -apple-system, sans-serif;
		background: #f1f5f9;
		color: #0f172a;
		min-height: 100dvh;
	}

	/* ── Help modal ──────────────────────────────────────────── */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}
	.modal {
		background: white;
		border-radius: 0.75rem;
		padding: 2rem;
		max-width: 480px;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.modal h2 {
		font-size: 1.375rem;
		font-weight: 700;
		color: #1e40af;
	}
	.modal ul {
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.95rem;
		line-height: 1.5;
		color: #374151;
	}
	.modal-mode {
		border-top: 1px solid #e2e8f0;
		padding-top: 0.875rem;
	}
	.modal-mode label {
		display: flex;
		gap: 0.625rem;
		align-items: flex-start;
		cursor: pointer;
		font-size: 0.875rem;
		color: #374151;
	}
	.modal-mode input[type='checkbox'] {
		margin-top: 0.15rem;
		flex-shrink: 0;
		accent-color: #1e40af;
	}
	.btn-start {
		align-self: flex-end;
		padding: 0.625rem 1.5rem;
		background: #1e40af;
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
	}
	.btn-start:hover {
		background: #1e3a8a;
	}

	/* ── Header ─────────────────────────────────────────────── */
	header {
		background: #1e40af;
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		gap: 1rem;
	}
	.logo {
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.header-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.btn-ghost {
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.35);
		padding: 0.375rem 0.875rem;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		white-space: nowrap;
	}
	.btn-ghost:hover {
		background: rgba(255, 255, 255, 0.25);
	}
	.btn-help {
		padding: 0.375rem 0.625rem;
		font-weight: 700;
		font-size: 1rem;
		line-height: 1;
	}

	/* ── Main layout ─────────────────────────────────────────── */
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* ── Win / lose banner ───────────────────────────────────── */
	.banner {
		border-radius: 0.625rem;
		padding: 1.25rem 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.banner.won {
		background: #dcfce7;
		border: 1px solid #86efac;
	}
	.banner.lost {
		background: #fee2e2;
		border: 1px solid #fca5a5;
	}
	.banner p {
		font-size: 0.9rem;
		color: #374151;
	}
	.banner strong {
		font-size: 1.6rem;
		font-weight: 700;
	}
	.banner button {
		margin-top: 0.375rem;
		padding: 0.5rem 1.25rem;
		background: #1e40af;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.banner button:hover {
		background: #1e3a8a;
	}

	/* ── Stats row ───────────────────────────────────────────── */
	.stats {
		display: flex;
		gap: 0.75rem;
	}
	.stat {
		flex: 1;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.625rem;
		padding: 0.875rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.stat-label {
		font-size: 0.7rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}
	.stat-value {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1;
	}

	/* ── Guess input ─────────────────────────────────────────── */
	.guess-area {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.guess-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.guess-header label[for='guess'] {
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
	}
	.mode-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8rem;
		color: #64748b;
		cursor: pointer;
		user-select: none;
	}
	.mode-toggle input[type='checkbox'] {
		accent-color: #1e40af;
	}
	.guess-area input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		outline: none;
		background: white;
		color: #0f172a;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.guess-area input:focus {
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
	}
	.guess-area input:disabled {
		background: #f8fafc;
		color: #94a3b8;
		cursor: not-allowed;
	}

	/* ── Clue list ───────────────────────────────────────────── */
	.section-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.625rem;
	}
	.clues {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.clue {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.975rem;
		transition:
			background 0.35s,
			border-color 0.35s,
			color 0.35s;
	}
	.clue.correct {
		background: #dcfce7;
		border-color: #86efac;
		color: #166534;
	}
	.clue.wrong {
		background: #fee2e2;
		border-color: #fca5a5;
		color: #991b1b;
	}

	/* ── Give up ─────────────────────────────────────────────── */
	.btn-giveup {
		align-self: flex-start;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		color: #64748b;
		font-size: 0.875rem;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
	}
	.btn-giveup:hover {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}
</style>
