<script>
	import favicon from '#lib/assets/naked_worm.gif';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
