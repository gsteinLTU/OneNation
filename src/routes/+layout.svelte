<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>OneNation</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
