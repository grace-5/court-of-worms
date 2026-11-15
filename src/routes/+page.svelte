<script lang="ts">
	import JoinRoom from './JoinRoom.svelte';
	import { onMount } from 'svelte';
	import PartySocket from 'partysocket';

	let messages = $state([]);
	let socket: PartySocket;

	onMount(() => {
		socket = new PartySocket({
			host: "localhost:8787",
			party: "chat-server",
			room: "lobby"
		});

		socket.addEventListener("message", (event) => {
			messages.push(event.data);
		});

		return () => socket.close();
	});

	function sendMessage(e: SubmitEvent) {
		e.preventDefault();
		if (!input.trim()) return;
		socket.send(input);
		input = '';
	}
</script>

<ul>
	{#each messages as msg}
		<li>{msg}</li>
	{/each}
</ul>

<form onsubmit={sendMessage}>
	<input bind:value={input} />
	<button type="submit">Submit</button>
</form>
