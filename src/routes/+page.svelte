<script lang="ts">

import { onMount } from 'svelte';
import background1 from '#lib/assets/JoinPt1.ogg';
import background2 from '#lib/assets/JoinPt2.ogg';
import JoinRoom from './JoinRoom.svelte';

let audio;
let currentTrack = 0;

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

h1 {
		color: rgb(146, 108, 59);
	}

p {
	color: rgb(96, 79, 36);
}
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