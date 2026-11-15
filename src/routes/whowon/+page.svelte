<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import background from '#lib/assets/Verdict.mp3';
	import { courtRoles } from '#lib/court-roles.js';
	import { Sound } from 'svelte-sound';

	const verdict = page.url.searchParams.get('verdict');
	const winnerRole = page.url.searchParams.get('winnerRole');
	const winner = page.url.searchParams.get('winner');
	const judge = page.url.searchParams.get('judge');
	const explanation = page.url.searchParams.get('explanation');
	let courtTranscript = $state([]);
	let transcriptError = $state(page.url.searchParams.get('transcriptError'));
	const validResult =
		(verdict === 'guilty' && winnerRole === 'prosecution') ||
		(verdict === 'not guilty' && winnerRole === 'defense');
	const winnerCharacter = validResult ? courtRoles[winnerRole] : null;

	const click_sound = new Sound(background);

	onMount(() => {
		const stop_btn = document.getElementById('stop');
		const play_btn = document.getElementById('play');
		stop_btn.addEventListener('click', () => {
			stop_btn.style.color = '#5b7cdd';
			play_btn.style.color = '';
			click_sound.stop();
		});
		play_btn.addEventListener('click', () => {
			play_btn.style.color = '#5b7cdd';
			stop_btn.style.color = '';
			click_sound.play();
		});

		const serializedTranscript = sessionStorage.getItem('courtTranscript');
		if (serializedTranscript && !transcriptError) {
			try {
				const parsedTranscript = JSON.parse(serializedTranscript);
				if (
					!Array.isArray(parsedTranscript) ||
					!parsedTranscript.every(
						(entry) =>
							entry &&
							['dialogue', 'argument'].includes(entry.type) &&
							typeof entry.speaker === 'string' &&
							typeof entry.text === 'string' &&
							(entry.segments === undefined ||
								(Array.isArray(entry.segments) &&
									entry.segments.every(
										(segment) =>
											segment &&
											typeof segment.text === 'string' &&
											typeof segment.userCreated === 'boolean'
									)))
					)
				) {
					throw new Error('Invalid court transcript data.');
				}
				courtTranscript = parsedTranscript;
			} catch (error) {
				console.error('Failed to load the court transcript.', error);
				transcriptError = 'The court transcript could not be loaded.';
			}
		}
	});
</script>

<section class="section">
	<div class="container result-container">
		{#if validResult}
			<h1 class="title">The court has reached a verdict</h1>
			<p class="subtitle">Judge {judge} finds the defendant {verdict}.</p>

			<div class="winner-card">
				<div class="winner-character">
					<img src={winnerCharacter.worm} alt="" aria-hidden="true" />
					<img src={courtRoles.judge.worm} alt="" aria-hidden="true" />
				</div>
				<h2 class="title is-3">{winner} wins!</h2>
				<p>The {winnerCharacter.name} wins the case.</p>
				{#if explanation}
					<p class="judge-explanation"><strong>Judge's explanation:</strong> {explanation}</p>
				{/if}
			</div>

			<button id="play"> Party yeah! (Music) ▶</button>
			<button id="stop">Stop ■</button>

			<section class="transcript-card" aria-labelledby="transcript-title">
				<h2 id="transcript-title" class="title is-4">Court transcript</h2>
				{#if transcriptError}
					<p role="alert">{transcriptError}</p>
				{:else if courtTranscript.length}
					<div class="transcript-scroll">
						{#each courtTranscript as entry, index (`${entry.type}-${index}`)}
							<article class="transcript-entry" class:argument-entry={entry.type === 'argument'}>
								<strong>
									{#if entry.type === 'argument'}
										{courtRoles[entry.role]?.name ?? entry.role}: {entry.speaker}
									{:else}
										{entry.speaker}
									{/if}
								</strong>
								<p>
									{#if entry.segments}
										{#each entry.segments as segment, segmentIndex (`${segmentIndex}-${segment.text}`)}
											<span class:user-created-word={segment.userCreated}>{segment.text}</span>
										{/each}
									{:else}
										{entry.text}
									{/if}
								</p>
							</article>
						{/each}
					</div>
				{:else}
					<p>No court transcript is available in this browser session.</p>
				{/if}
			</section>
		{:else}
			<h1 class="title">No verdict is available</h1>
			<p>Finish a trial before visiting the results page.</p>
		{/if}

		<div class="columns is-centered">
			<a class="button is-primary home-button" href="/">Return home</a>
		</div>
	</div>
</section>

<style>
	.result-container {
		max-width: 42rem;
		text-align: center;
	}

	.winner-card {
		margin: 2rem 0;
		padding: 2rem;
		border: 3px solid #000000;
		border-radius: 8px;
		background: #ffffff;
	}

	.winner-card .title {
		margin-bottom: 0.75rem;
	}

	.judge-explanation {
		margin-top: 1rem;
	}

	.winner-character {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.winner-character img {
		width: 3rem;
		height: 4rem;
		object-fit: contain;
	}

	.verdict-audio {
		display: block;
		max-width: 100%;
		margin: 0 auto 1rem;
	}

	.transcript-card {
		margin: 2rem 0;
		padding: 1.5rem;
		border: 3px solid #000000;
		border-radius: 8px;
		background: #ffffff;
		text-align: left;
	}

	.transcript-card > .title {
		text-align: center;
	}

	.transcript-scroll {
		max-height: 32rem;
		overflow-y: auto;
		padding: 0.25rem 0.75rem;
	}

	.transcript-entry {
		padding: 0.75rem 0;
	}

	.transcript-entry + .transcript-entry {
		border-top: 1px solid #dbdbdb;
	}

	.transcript-entry p {
		margin-top: 0.25rem;
	}

	.argument-entry {
		padding-left: 0.75rem;
		border-left: 3px solid #f76c91;
		color: #f76c91;
	}

	.user-created-word {
		color: #f76c91;
		font-weight: 600;
	}

	.home-button {
		margin-top: 1rem;
	}
</style>
