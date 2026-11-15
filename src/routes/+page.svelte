<script lang="ts">

import { onMount } from 'svelte';
import background1 from '#lib/assets/JoinPt1.ogg';
import background2 from '#lib/assets/JoinPt2.ogg';
<<<<<<< HEAD
import worm from '#lib/assets/naked_worm.gif';
=======
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
  
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

	import { Sound } from 'svelte-sound';

	// Create a reusable sound action
	const click_sound = new Sound(background1);
	const click_sound2 = new Sound(background2);

	onMount(() => {
		const stop_btn = document.getElementById('stop');
		const play_btn = document.getElementById('play');
		stop_btn.addEventListener('click', () => {
  			stop_btn.style.color = "#5b7cdd";
			play_btn.style.color = "";
			click_sound.stop();
		});
		play_btn.addEventListener('click', () => {
  			play_btn.style.color = "#5b7cdd";
			stop_btn.style.color = "";
			click_sound.play();
		});
	});

</script>

<section class="section">

<div class="container">
	<h1 class="title bouncing-text">Court of Worms</h1>
	<p class="subtitle bouncing-text">
		a madlibs style debate game!
	</p>

	<div class="field has-addons">
		<input class="input" bind:value={username} type="text" placeholder="Your name" />
		<div class="control is-expanded">
			<button class="button is-primary" onclick={createLobby}>Host Game</button>
		</div>
	</div>

	<div class="field has-addons">
<<<<<<< HEAD
		<input class="input" type="text" bind:value={roomId} placeholder="Enter room code" />
=======
		<input class="input" type="text" autocomplete="off" bind:value={roomId} placeholder="Enter room code" />
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
		<div class="control is-expanded">

			<button onclick={joinLobby} class="button is-primary">Join Game</button>
		</div>
	</div>
</div>

</section>

<section class="section">

<div class="hero-body is-flex is-flex-direction-column is-justify-content-flex-end is-align-items-flex-end">
<button id="play" onclick={() => {playSound}}>
  Dance Party! (Music) ▶
</button>
<button id="stop" onclick={stopSound}> Stop ■</button>
</div>
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
