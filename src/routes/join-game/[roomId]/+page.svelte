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
