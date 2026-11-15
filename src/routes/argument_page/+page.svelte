<script>
	// Hard coded for now
	const judgeName = 'Judy';
	const name1 = 'James';
	const name2 = 'Ruth';

	const verbPast1 = 'grabbed';
	const verbPast2 = 'ran';
	const verbPast3 = 'reacted';

	const adverb1 = 'quickly';
	const adverb2 = 'dramatically';
	const adverb3 = 'recklessly';

	const adjective1 = 'enormous';
	const adjective2 = 'dangerous';
	const adjective3 = 'heated';

	const noun1 = 'crystal';
	const noun2 = 'crown';

	const number1 = '500 gold coins';

	const plnoun1 = 'spiders';

	const verbBase1 = 'hide';
	const verbBase2 = 'steal';

	const prosecName = 'the People';

	const lines = [
		`All rise, the Superior Court of Worm is now in session, the Honorable ${judgeName} presiding.`,
		`Please be seated. This is a criminal case brought by Worm ${name1}, charging the defendant, 
         Worm ${name2}, with theft in the first degree.`,
		`Worm ${name1} claims that Worm ${name2}, with an intent to deprive the owner of its property,
         ${verbPast1} the ${noun1} and ${verbPast2} away with it ${adverb1}. The stolen ${noun1} was 
         valued at ${number1} and was allegedly worth more to Worm ${name1} than a ${noun2}.`,
		`Worm ${name1} claims that upon discovering the theft, they ${verbPast3} ${adverb2}, 
        suffering emotional damage of ${adjective1} proportions.`,
		`Worm ${name2} admits to taking the ${noun1} but denies having the intent to commit theft. 
        The defendant claims that they believed they had permission to take the ${noun1} and were 
        merely attempting to protect it from ${adjective2} ${plnoun1}.`,
		`In fact, Worm ${name2} claims that they had to ${verbBase1} the ${noun1} while engaging in a 
        ${adjective3} altercation with Worm ${name1}, who allegedly attempted to ${verbBase2} it ${adverb3}.`,
		`Judge: We now will begin the case. The prosecuting attorney, ${prosecName}, on behalf of Worm ${name1}, will go first.`
	];

	let currIndex = $state(0);
	let isVisible = $state(true);

	function nextLine() {
		if (currIndex < lines.length - 1) {
			currIndex += 1;
		} else {
			isVisible = false;
		}
	}
</script>

<section class="section">
	<div class="container game-container">
		{#if isVisible}
			<div
				class="text-box"
				role="button"
				tabindex="0"
				onclick={nextLine}
				onkeydown={(e) => e.key === 'Enter' && nextLine()}
			>
				<p>{lines[currIndex]}</p>

				<span class="hint">
					{currIndex < lines.length - 1 ? 'Click to continue' : 'Click to close'}
				</span>
			</div>
		{/if}
	</div>
</section>

<style>
	.game-container {
		position: relative;
		min-width: 20rem;
		max-width: 30rem;
		min-height: 26.5rem;
	}

	.text-box {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		min-height: 5rem;
		padding: 20px;
		border: 2px solid #000000;
		border-radius: 8px;
		user-select: none;
		font-size: 1.25rem;
	}

	.hint {
		display: block;
		text-align: right;
		font-size: 0.8rem;
		opacity: 0.7;
		margin-top: 10px;
	}
</style>
