<script>
	let { data } = $props();
</script>

<section class="section">
	<div class="container">
		<h1 class="title">The Superior Court of Worm</h1>
		<h2 class="subtitle">Worm V. Worm</h2>

		{#each data.script.sections as section, i}
			<div class="mb-5">
				<h3 class="title is-4">{section.speaker}</h3>

				{#if section.type === 'turn'}
					<p class="mb-3">{section.prompt}</p>
				{:else if section.type === 'verdict'}
					<p class="mb-3">{section.prompt}</p>
				{:else}
					{#each section.paragraphs as paragraph}
						<p class="mb-3">{paragraph}</p>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</section>
