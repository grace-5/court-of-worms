<script>

import { onMount } from 'svelte';
import background from '#lib/assets/Verdict.mp3';

let audio;

let ruling = $state('');
let explanation = $state('');

onMount(() => {
    audio.play();
});

</script>

<audio bind:this={audio} src={background} loop></audio>

<section class="section">
    <container class="container">
        <form method="post" action="?/enter">
            <div class="field">
                <h1 class="heading zooming-text">What's the verdict?</h1>
                <div class="button-container">
                    <button
                        class:selected={ruling === 'Guilty'}
                        class="player1"
                        type="button"
                        onclick={() => ruling = 'Guilty'}>
                        Guilty
                    </button>
                
                    <button
                        class:selected={ruling === 'Not Guilty'}
                        class="player2"
                        type="button"
                        onclick={() => ruling = 'Not Guilty'}>
                        Not Guilty
                    </button>
                </div>
                
                <div class="judge_ruling">
                    <textarea class = "text_area"
                        bind:value={explanation}
                        placeholder="Explain your ruling (optional)">
                    </textarea>
                </div>
            </div>
        </form>
    </container>
</section>

<style>
    .button-container {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 20px;
    }

    .player1, .player2 {
        color: white;
        font-size: large;
        border: 3px solid transparent;
        cursor: pointer;
        border-radius: 5px;
        padding: 10px 20px;
    }

    .player1 {
        background-color: #db2929;
    }

    .player2 {
        background-color: #44aa44;
    }

    .player1.selected, .player2.selected {
        border: 3px solid black;
        transform: scale(1.05);
    }

    .judge_ruling textarea {
        width: 100%;
        min-height: 150px;
        padding: 12px;
        font-size: 16px;
        font-family: Arial, Helvetica, sans-serif;
        resize: vertical;
        box-sizing: border-box;
        border-radius: 5px;
    }

    .heading {
		font-size: 2em;
        transform: translateY(-1em);
	}

    .zooming-text {
    animation: zoom_bounce 1s ease-in-out infinite;
    transform-origin: top left;
    }

    @keyframes zoom_bounce {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

</style>


