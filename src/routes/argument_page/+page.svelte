<script>
<<<<<<< HEAD
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
=======
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import PartySocket from 'partysocket';
	import { courtRoles } from '#lib/court-roles.js';
	import { partyServerHost } from '#lib/party-server.js';

	let { data } = $props();
	const roomId = page.url.searchParams.get('room');
	const steps = $derived(
		data.script.sections.flatMap((section) => {
			if (section.type === 'turn' || section.type === 'verdict') {
				return [{ ...section, type: section.type }];
			}

			return section.paragraphs.map((paragraph) => ({
				type: 'dialogue',
				speaker: section.speaker,
				paragraph
			}));
		})
	);

	let socket;
	let players = $state([]);
	let hostId = $state(null);
	let gameState = $state(null);
	let playerId = $state('');
	let playerName = $state('');
	let errorMessage = $state('');
	let isConnected = $state(false);
	let argumentText = $state('');
	let charLength = $derived(argumentText.length);
	let judgeExplanation = $state('');
	let judgeExplanationLength = $derived(judgeExplanation.length);
	let promptValues = $state({});
	let localStepIndex = $state(0);
	let waitingToFinish = $state(false);
	let readyRequestedStepIndex = $state(null);
	let hasNavigatedToResults = false;

	const playerRole = $derived(players.find((player) => player.id === playerId)?.role ?? null);
	const roleAssignments = $derived(
		Object.entries(courtRoles).map(([role, character]) => ({
			role,
			character,
			player: players.find((player) => player.role === role)
		}))
	);
	const myPromptFields = $derived(
		gameState?.status === 'pretrial'
			? gameState.pretrial.fields.filter((field) => field.assignedPlayerId === playerId)
			: []
	);
	const hasSubmittedPrompts = $derived(
		gameState?.pretrial?.submittedPlayerIds.includes(playerId) ?? false
	);
	const currentStep = $derived(gameState ? steps[localStepIndex] : null);
	const waitingAtRealtimeStep = $derived(
		['turn', 'verdict'].includes(currentStep?.type) &&
			(!gameState?.activeStepReady || gameState.stepIndex !== localStepIndex)
	);
	const currentSpeakerRole = $derived(
		['Judge', 'Prosecution', 'Defense'].includes(currentStep?.speaker)
			? currentStep.speaker.toLowerCase()
			: null
	);
	const currentSpeakerCharacter = $derived(
		currentSpeakerRole ? courtRoles[currentSpeakerRole] : null
	);
	const displayParagraphParts = $derived(
		currentStep?.paragraph
			? interpolateParts(currentStep.paragraph).map((part) => ({
					...part,
					text: part.text.replace('[verdict]', gameState?.verdict ?? '[verdict]')
				}))
			: []
	);

	function interpolateParts(
		paragraph,
		values = gameState?.pretrial?.values ?? {},
		userPromptKeys = new Set(gameState?.pretrial?.fields.map((field) => field.key) ?? [])
	) {
		const parts = [];
		const placeholderPattern = /\{(\w+)\}/g;
		let lastIndex = 0;
		let match;

		while ((match = placeholderPattern.exec(paragraph))) {
			if (match.index > lastIndex) {
				parts.push({ text: paragraph.slice(lastIndex, match.index), userCreated: false });
			}

			const key = match[1];
			const value = values[key];
			parts.push({
				text: value == null || value === '' ? `[${key}]` : value,
				userCreated: userPromptKeys.has(key) && value != null && value !== ''
			});
			lastIndex = placeholderPattern.lastIndex;
		}

		if (lastIndex < paragraph.length) {
			parts.push({ text: paragraph.slice(lastIndex), userCreated: false });
		}

		return parts;
	}

	function addVerdict(parts, verdict) {
		return parts.map((part) => ({
			...part,
			text: part.text.replace('[verdict]', verdict ?? '[verdict]')
		}));
	}

	function isRealtimeStep(step) {
		return step && ['turn', 'verdict'].includes(step.type);
	}

	function buildCourtTranscript(completedGameState) {
		const argumentsByStep = new Map(
			completedGameState.transcript.map((entry) => [entry.stepIndex, entry])
		);
		const values = completedGameState.pretrial?.values ?? {};
		const userPromptKeys = new Set(
			completedGameState.pretrial?.fields.map((field) => field.key) ?? []
		);

		return steps.flatMap((step, index) => {
			if (step.type === 'dialogue') {
				const segments = addVerdict(
					interpolateParts(step.paragraph, values, userPromptKeys),
					completedGameState.verdict
				);
				return [
					{
						type: 'dialogue',
						speaker: step.speaker,
						text: segments.map((segment) => segment.text).join(''),
						segments
					}
				];
			}

			if (step.type === 'turn') {
				const entry = argumentsByStep.get(index);
				if (!entry) return [];

				return [
					{
						type: 'argument',
						role: entry.role,
						speaker: entry.player,
						text: entry.text
					}
				];
			}

			return [];
		});
	}

	onMount(() => {
		if (!roomId) return;

		playerName = page.url.searchParams.get('name') ?? sessionStorage.getItem('username') ?? '';
		playerId =
			page.url.searchParams.get('playerId') ??
			sessionStorage.getItem('playerId') ??
			crypto.randomUUID();
		if (playerName) sessionStorage.setItem('username', playerName);
		sessionStorage.setItem('playerId', playerId);

		if (!playerName) {
			errorMessage = 'Enter your name on the home page before joining a room.';
			return;
		}

		if (!partyServerHost) {
			errorMessage = 'The real-time game server is not configured.';
			return;
		}

		socket = new PartySocket({
			host: partyServerHost,
			party: 'lobby',
			room: roomId
		});

		socket.addEventListener('open', () => {
			isConnected = true;
			socket.send(JSON.stringify({ type: 'join', name: playerName, playerId }));
		});

		socket.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);
			if (message.type === 'sync') {
				const previousGameState = gameState;
				if (message.gameState?.status === 'pretrial' && gameState?.status !== 'pretrial') {
					promptValues = Object.fromEntries(
						message.gameState.pretrial.fields
							.filter((field) => field.assignedPlayerId === playerId)
							.map((field) => [field.key, ''])
					);
				}
				if (message.gameState?.status === 'completed' && !hasNavigatedToResults) {
					hasNavigatedToResults = true;
					let transcriptSaved = true;
					try {
						sessionStorage.setItem(
							'courtTranscript',
							JSON.stringify(buildCourtTranscript(message.gameState))
						);
					} catch (error) {
						console.error('Failed to save the court transcript.', error);
						transcriptSaved = false;
					}
					const winnerRole = message.gameState.verdict === 'guilty' ? 'prosecution' : 'defense';
					const winner = message.players.find((player) => player.role === winnerRole);
					const judge = message.players.find((player) => player.role === 'judge');
					const result = new URLSearchParams({
						verdict: message.gameState.verdict,
						winnerRole,
						winner: winner?.name ?? winnerRole,
						judge: judge?.name ?? 'Judge',
						explanation: message.gameState.explanation ?? ''
					});
					if (!transcriptSaved) {
						result.set('transcriptError', 'The court transcript could not be saved.');
					}
					void goto(`/whowon?${result}`);
				}
				if (
					message.gameState?.status === 'playing' &&
					(!previousGameState ||
						previousGameState.status !== 'playing' ||
						message.gameState.stepIndex > previousGameState.stepIndex)
				) {
					localStepIndex = message.gameState.stepIndex;
					waitingToFinish = false;
				}
				const serverStep = steps[message.gameState?.stepIndex];
				const currentPlayer = message.players.find((player) => player.id === playerId);
				if (
					message.gameState?.status === 'playing' &&
					!message.gameState.activeStepReady &&
					isRealtimeStep(serverStep) &&
					currentPlayer?.role
				) {
					sendReadyForStep(message.gameState.stepIndex);
				}
				players = message.players;
				hostId = message.hostId;
				gameState = message.gameState;
				errorMessage = '';
			} else if (message.type === 'error') {
				errorMessage = message.message;
			}
		});

		socket.addEventListener('close', () => {
			isConnected = false;
		});

		return () => socket.close();
	});

	function startPretrial() {
		const assignedPlayers = players.filter((player) => player.online).slice(0, 3);
		if (assignedPlayers.length !== 3) {
			errorMessage = 'Three players must be online to begin the pre-trial.';
			return;
		}

		const promptFields = data.pretrial.promptKeys.map((key) =>
			data.pretrial.fields.find((field) => field.key === key)
		);
		if (promptFields.some((field) => !field)) {
			errorMessage = 'Could not load the pre-trial prompts.';
			return;
		}

		socket?.send(
			JSON.stringify({
				type: 'start-pretrial',
				fields: promptFields.map((field, index) => ({
					...field,
					assignedPlayerId: assignedPlayers[Math.floor(index / 9)].id
				})),
				values: data.pretrial.values,
				sequence: steps.map(({ type, role }) => (role ? { type, role } : { type }))
			})
		);
	}

	function submitPretrial() {
		socket?.send(
			JSON.stringify({
				type: 'submit-pretrial',
				values: Object.fromEntries(
					myPromptFields.map((field) => [field.key, promptValues[field.key] ?? ''])
				)
			})
		);
	}

	function advance() {
		if (localStepIndex === steps.length - 1) {
			waitingToFinish = true;
			if (playerRole) {
				socket?.send(
					JSON.stringify({
						type: 'finish-script',
						stepIndex: localStepIndex
					})
				);
			}
			return;
		}

		localStepIndex++;
		if (playerRole && isRealtimeStep(steps[localStepIndex])) {
			sendReadyForStep(localStepIndex);
		}
	}

	function sendReadyForStep(stepIndex) {
		if (readyRequestedStepIndex === stepIndex) return;

		readyRequestedStepIndex = stepIndex;
		socket?.send(
			JSON.stringify({
				type: 'ready-for-step',
				stepIndex
			})
		);
	}

	function submitTurn() {
		const text = argumentText.trim();
		if (!text) return;

		socket?.send(
			JSON.stringify({
				type: 'submit-turn',
				stepIndex: gameState.stepIndex,
				text
			})
		);
		argumentText = '';
	}

	function chooseVerdict(verdict) {
		const explanation = judgeExplanation.trim();
		if (!explanation || judgeExplanation.length > 150) return;

		socket?.send(
			JSON.stringify({
				type: 'choose-verdict',
				stepIndex: gameState.stepIndex,
				verdict,
				explanation
			})
		);
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
	}
</script>

<section class="section">
	<div class="container game-container">
<<<<<<< HEAD
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
=======
		<h1 class="title">The Superior Court of Worm</h1>
		{#if !roomId}
			<p>Join a game room to take part in the trial.</p>
			<a href="/">Return to the home page</a>
		{:else if !playerName && !isConnected}
			<p>{errorMessage || 'Connecting to room ' + roomId + '...'}</p>
		{:else if !gameState}
			<h2 class="subtitle">Room {roomId}</h2>
			<p>
				{isConnected ? 'Waiting for the pre-trial to start.' : 'Connecting to the game room...'}
			</p>
			<p>Players: {players.length} / 3 minimum</p>
			<ul>
				{#each players as player (player.id)}
					<li>{player.name}{player.id === hostId ? ' (host)' : ''}</li>
				{/each}
			</ul>
			{#if playerId === hostId}
				<button
					class="button is-primary"
					onclick={startPretrial}
					disabled={!isConnected || players.filter((player) => player.online).length < 3}
				>
					Begin pre-trial
				</button>
			{/if}
		{:else if gameState.status === 'pretrial'}
			<h2 class="subtitle">Pre-trial: Fill in the words!</h2>
			<p>
				Each of the three players submits 9 words. The trial begins when all players have submitted.
			</p>
			<p>
				Submissions received: {gameState.pretrial.submittedPlayerIds.length} / 3
			</p>
			{#if myPromptFields.length === 0}
				<p>You are observing this room. Waiting for the three players to submit their words.</p>
			{:else if hasSubmittedPrompts}
				<p>Your words are submitted. Waiting for the other players...</p>
			{:else}
				<form
					onsubmit={(event) => {
						event.preventDefault();
						submitPretrial();
					}}
				>
					{#each myPromptFields as field (field.key)}
						<div class="field">
							<label class="label" for={field.key}>
								{field.type.replaceAll('_', ' ')}
							</label>
							<p class="help mb-2">{field.description}</p>
							<input
								class="input"
								id={field.key}
								autocomplete="off"
								bind:value={promptValues[field.key]}
								maxlength="20"
								pattern="^[A-Za-z0-9 ,.'-]+$"
								placeholder={field.examples.join(', ')}
								required
							/>
						</div>
					{/each}
					<button class="button is-primary" type="submit">Submit words</button>
				</form>
			{/if}
		{:else}
			<div class="game-status">
				<p>Room {roomId}</p>
				<div class="role-labels" aria-label="Court roles">
					{#each roleAssignments as assignment (assignment.role)}
						<div class="role-label">
							<img src={assignment.character.worm} alt="" aria-hidden="true" />
							<span>
								{assignment.character.name}:
								<strong>{assignment.player?.name ?? 'Unassigned'}</strong>
							</span>
						</div>
					{/each}
				</div>
			</div>

			{#if gameState.transcript.length}
				<div class="transcript" aria-live="polite">
					{#each gameState.transcript as entry (entry.stepIndex)}
						<div class="transcript-entry">
							{#if courtRoles[entry.role]}
								<img
									class="transcript-worm"
									src={courtRoles[entry.role].worm}
									alt=""
									aria-hidden="true"
								/>
							{/if}
							<strong>{entry.player} ({entry.role})</strong>
							<p>{entry.text}</p>
						</div>
					{/each}
				</div>
			{/if}

			{#if gameState.status === 'completed'}
				<p>The trial is over. Verdict: {gameState.verdict}.</p>
			{:else if waitingAtRealtimeStep}
				<div class="text-box">
					<strong>Waiting for the live court session</strong>
					<p>
						{playerRole
							? 'You are ready. Waiting for the other players to finish reading...'
							: 'The players are still reading the script...'}
					</p>
					<p>
						{gameState.readyPlayerIds?.length ?? 0} / {gameState.pretrial.playerIds.length}
						players ready
					</p>
				</div>
			{:else if waitingToFinish}
				<div class="text-box">
					<strong>Waiting for the others</strong>
					<p>You have finished reading. The results will appear when everyone is done.</p>
				</div>
			{:else if currentStep?.type === 'dialogue'}
				<button class="text-box" onclick={advance}>
					<span class="text-box-heading">
						{#if currentSpeakerCharacter}
							<img src={currentSpeakerCharacter.worm} alt="" aria-hidden="true" />
						{/if}
						<strong>{currentStep.speaker}</strong>
					</span>
					<span class="dialogue-copy">
						{#each displayParagraphParts as part, index (`${index}-${part.text}`)}
							<span class:user-created-word={part.userCreated}>{part.text}</span>
						{/each}
					</span>
					<span class="hint">Click to continue</span>
				</button>
			{:else if currentStep?.type === 'turn'}
				<div class="text-box">
					<span class="text-box-heading">
						{#if currentSpeakerCharacter}
							<img src={currentSpeakerCharacter.worm} alt="" aria-hidden="true" />
						{/if}
						<strong>{currentStep.speaker}</strong>
					</span>
					<p>{currentStep.prompt}</p>
					{#if playerRole === currentStep.role}
						<textarea
							class="textarea"
							bind:value={argumentText}
							maxlength="150"
							placeholder="Write your argument..."></textarea>
						<div>
							<span id="current">{charLength}</span>
							<span id="maximum">/ 150 char</span>
						</div>
						<button
							class="button is-primary submit-button"
							onclick={submitTurn}
							disabled={!argumentText.trim()}
						>
							Submit argument
						</button>
					{:else}
						<p class="hint">
							Waiting for {players.find((player) => player.role === currentStep.role)?.name ??
								currentStep.role}...
						</p>
					{/if}
				</div>
			{:else if currentStep?.type === 'verdict'}
				<div class="text-box">
					<span class="text-box-heading">
						{#if currentSpeakerCharacter}
							<img src={currentSpeakerCharacter.worm} alt="" aria-hidden="true" />
						{/if}
						<strong>{currentStep.speaker}</strong>
					</span>
					<p>{currentStep.prompt}</p>
					{#if playerRole === 'judge'}
						<label class="label" for="judge-explanation"
							>Explain your verdict (150 characters max)</label
						>
						<textarea
							class="textarea"
							id="judge-explanation"
							bind:value={judgeExplanation}
							maxlength="150"
							placeholder="Briefly explain why the defendant is guilty or not guilty..."
							required></textarea>
						<div class="judge-explanation-count">
							<span>{judgeExplanationLength}</span>
							<span> / 150 characters</span>
						</div>
						<div class="verdict-buttons">
							<button
								class="button is-primary"
								onclick={() => chooseVerdict('guilty')}
								disabled={!judgeExplanation.trim()}>Guilty</button
							>
							<button
								class="button"
								onclick={() => chooseVerdict('not guilty')}
								disabled={!judgeExplanation.trim()}>Not guilty</button
							>
						</div>
					{:else}
						<p class="hint">Waiting for the Judge to decide...</p>
					{/if}
				</div>
			{/if}
		{/if}

		{#if errorMessage}
			<p class="error-message" role="alert">{errorMessage}</p>
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
		{/if}
	</div>
</section>

<style>
	.game-container {
		position: relative;
		min-width: 20rem;
<<<<<<< HEAD
		max-width: 30rem;
=======
		max-width: 42rem;
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
		min-height: 26.5rem;
	}

	.text-box {
<<<<<<< HEAD
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
=======
		display: block;
		width: 100%;
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
		min-height: 5rem;
		padding: 20px;
		border: 2px solid #000000;
		border-radius: 8px;
<<<<<<< HEAD
		user-select: none;
		font-size: 1.25rem;
=======
		background: #ffffff;
		color: inherit;
		text-align: left;
		font: inherit;
		text-wrap: wrap;
	}

	button.text-box {
		cursor: pointer;
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
	}

	.hint {
		display: block;
<<<<<<< HEAD
		text-align: right;
		font-size: 0.8rem;
		opacity: 0.7;
		margin-top: 10px;
=======
		margin-top: 10px;
		text-align: right;
		font-size: 0.8rem;
		opacity: 0.7;
	}

	.game-status {
		margin-bottom: 1rem;
	}

	.role-label,
	.text-box-heading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.role-label img {
		width: 2rem;
		height: 2.5rem;
		object-fit: contain;
	}

	.role-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.5rem;
		margin-top: 0.75rem;
	}

	.text-box-heading img {
		width: 2.5rem;
		height: 3.25rem;
		object-fit: contain;
	}

	.text-box-heading {
		margin-bottom: 0.75rem;
	}

	.dialogue-copy {
		display: block;
	}

	.user-created-word {
		color: #f76c91;
		font-weight: 600;
	}

	.transcript {
		max-height: 18rem;
		overflow-y: auto;
		margin-bottom: 1.5rem;
		padding: 1rem;
		border: 3px solid #b5b5b5;
		border-radius: 8px;
		text-wrap: wrap;
		background: #ffffff;
	}

	.transcript-entry + .transcript-entry {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #dbdbdb;
		text-wrap: wrap;
	}

	.transcript-worm {
		float: left;
		width: 1.75rem;
		height: 2.5rem;
		margin-right: 0.5rem;
		object-fit: contain;
	}

	.submit-button {
		margin-top: 0.75rem;
	}

	.verdict-buttons {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.error-message {
		margin-top: 1rem;
		color: #b00020;
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
	}
</style>
