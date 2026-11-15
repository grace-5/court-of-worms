<!-- 
<ul>
	{#each messages as msg}
		<li>{msg}</li>
	{/each}
</ul>

<form onsubmit={sendMessage}>
	<input bind:value={input} />
	<button type="submit">Submit</button>
</form> -->

<script>
	import { goto } from '$app/navigation';

	let roomId = $state('');
	let username = $state('');

	function createLobby() {
		if (!username.trim()) return;
		sessionStorage.setItem('username', username.trim());
		roomId = crypto.randomUUID().slice(0, 6).toUpperCase();
		goto(`/join-game/${roomId}`);
	}

	function joinLobby() {
		if (!username.trim() || !roomId.trim()) return;
		sessionStorage.setItem('username', username.trim());
		const lobbyData = roomId.trim().toUpperCase();
		goto(`/join-game/${lobbyData}`);
	}
</script>

<div class="container">
	<h1 class="title">Court of Worms</h1>
	<p class="subtitle">a madlibs style debate game!</p>

	<input class="input" bind:value={username} type="text" placeholder="Your name" />
	<button class="button is-primary" onclick={createLobby}>Host Game</button>

	<input class="input" type="text" bind:value={roomId} placeholder="Enter room code" />
	<button onclick={joinLobby} class="button is-primary">Join Game</button>
</div>
