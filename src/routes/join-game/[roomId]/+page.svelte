<<<<<<< HEAD
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PartySocket from 'partysocket';

	let players = $state([]);
	let username = $state('');
	let joined = $state(false);
	const roomId = page.params.roomId;

	function connectToLobby(username) {
		const socket = new PartySocket({
			host: 'localhost:8787',
			party: 'lobby',
			room: roomId
		});
		socket.addEventListener('open', () => {
			socket.send(JSON.stringify({ type: 'join', name: username }));
			joined = true;
		});

		socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'sync') {
				players = data.players;
			}
		});

		return () => socket.close();
	}

	onMount(() => {
		const savedName = sessionStorage.getItem('username');
		if (savedName) {
			username = savedName;
			connectToLobby(savedName);
		}
	});

	function directJoin() {
		if (!username.trim()) return;
		sessionStorage.setItem('username', playerName.trim());
		connectToLobby(playerName.trim());
	}
</script>

{#if !joined}
	<input bind:value={username} placeholder="Enter a username" />
	<button onclick={directJoin}>Join</button>
{:else}
	<h1 class="title">Join code:</h1>
	<p>{roomId}</p>
	<ul>
		<p>Share this link:</p>
		{#each players as player (player.id)}
			<li>{player.name}</li>
		{/each}
	</ul>
	<div class="buttons">
		<a class="button is-primary" href="/starting-screen">Start Game</a>
	</div>
{/if}
=======
<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PartySocket from 'partysocket';
	import { partyServerHost } from '#lib/party-server.js';

	const roomId = page.params.roomId;
	let players = $state([]);
	let username = $state('');
	let playerId = $state('');
	let hostId = $state(null);
	let joined = $state(false);
	let errorMessage = $state('');
	let closeSocket;

	function connectToLobby(name, id) {
		if (!partyServerHost) {
			errorMessage = 'The real-time game server is not configured.';
			return () => {};
		}

		const socket = new PartySocket({
			host: partyServerHost,
			party: 'lobby',
			room: roomId
		});

		socket.addEventListener('open', () => {
			socket.send(JSON.stringify({ type: 'join', name, playerId: id }));
			joined = true;
		});

		socket.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);
			if (message.type === 'sync') {
				players = message.players;
				hostId = message.hostId;
				if (message.gameState) {
					goto(`/argument_page?room=${encodeURIComponent(roomId)}`);
				}
			} else if (message.type === 'error') {
				errorMessage = message.message;
			}
		});

		socket.addEventListener('close', () => {
			joined = false;
		});

		return () => socket.close();
	}

	onMount(() => {
		username = sessionStorage.getItem('username') ?? '';
		playerId = sessionStorage.getItem('playerId') ?? crypto.randomUUID();
		sessionStorage.setItem('playerId', playerId);

		if (username) closeSocket = connectToLobby(username, playerId);
		return () => closeSocket?.();
	});

	function directJoin() {
		const name = username.trim();
		if (!name) return;

		username = name;
		sessionStorage.setItem('username', name);
		playerId = sessionStorage.getItem('playerId') ?? crypto.randomUUID();
		sessionStorage.setItem('playerId', playerId);
		closeSocket?.();
		closeSocket = connectToLobby(name, playerId);
	}
</script>

<section class="section">
	<div class="container">
		{#if !joined}
			<h1 class="title">Join Court of Worms</h1>
			<div class="field has-addons">
				<div class="control is-expanded">
					<input class="input" bind:value={username} placeholder="Enter a username" />
				</div>
				<div class="control">
					<button class="button is-primary" onclick={directJoin}>Join</button>
				</div>
			</div>
		{:else}
			<h1 class="title">Room code: {roomId}</h1>
			<p>Share this link with the other players.</p>
			<h2 class="subtitle">Players ({players.length})</h2>
			<ul>
				{#each players as player (player.id)}
					<li>
						{player.name}{player.id === hostId ? ' (host)' : ''}
						{#if !player.online}
							(reconnecting...){/if}
					</li>
				{/each}
			</ul>

			{#if playerId === hostId}
				<a
					class="button is-primary"
					href={`/argument_page?room=${encodeURIComponent(roomId)}&name=${encodeURIComponent(username)}&playerId=${encodeURIComponent(playerId)}`}
					target="_blank"
					rel="noopener"
				>
					Continue to trial setup
				</a>
				{#if players.length < 3}
					<p class="help">At least three players are needed to start the trial.</p>
				{/if}
			{/if}
		{/if}

		{#if errorMessage}
			<p class="error-message" role="alert">{errorMessage}</p>
		{/if}
	</div>
</section>

<style>
	.error-message {
		margin-top: 1rem;
		color: #b00020;
	}
</style>
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
