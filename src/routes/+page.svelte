<script lang="ts">

import { onMount } from 'svelte';
import background1 from '#lib/assets/JoinPt1.ogg';
import background2 from '#lib/assets/JoinPt2.ogg';
import JoinRoom from './JoinRoom.svelte';
  
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

let audio: HTMLAudioElement | null = null;
let currentTrack = $state(0);

const tracks = [background1, background2];

function playNextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    audio.src = tracks[currentTrack];
    audio.play();
}

onMount(() => {
        audio.play();
    });

</script>

<audio bind:this={audio} src={tracks[currentTrack]} onended={playNextTrack}></audio>

<section class="section">
	<div class="container">
	<h1 class="title bouncing-text">Court of Worms</h1>
	<p class="subtitle bouncing-text">
		a madlibs style debate game!
	</p>
	<div class="field">
		<div class="control">
		<input class="input" type="text" placeholder="Your name">
		</div>
	</div>
	<div class="buttons">
		<a class="button is-primary">Join Game</a>
	</div>
	</div>
</section>

<section class="section">
<p>Put room join room thing here</p>
<JoinRoom></JoinRoom>
</section>
<style>

.bouncing-text {
    animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

</style>
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


<div class="container">
	<h1 class="title">Court of Worms</h1>
	<p class="subtitle">a madlibs style debate game!</p>

	<input class="input" bind:value={username} type="text" placeholder="Your name" />
	<button class="button is-primary" onclick={createLobby}>Host Game</button>

	<input class="input" type="text" bind:value={roomId} placeholder="Enter room code" />
	<button onclick={joinLobby} class="button is-primary">Join Game</button>
</div>
