<script>
    import { enhance } from '$app/forms';
    let { madlibs, currentUser } = $props();

    let assignedEntries = $derived(
        Object.entries(madlibs).filter(
            ([key, field]) => field.assigned_user === currentUser
        ).slice(0, 9)
    );
</script>

<section class="section">
    <div class="container">
        <h2 class="title is-4">Fill in the words!</h2>

        {#if assignedEntries.length === 0}
            <p>You don't have any words assigned!</p>
        {:else}
            <form method="POST" action="?/submit" use:enhance>
                {#each Array.from(
                    { length: Math.ceil(assignedEntries.length / 3) },
                    (_, i) => assignedEntries.slice(i * 3, i * 3 + 3)
                ) as group}
                    <div class="columns is-variable is-2">
                        {#each group as [key, field]}
                            <div class="column is-one-third">
                                <div class="field">
                                    <label class="label" for={key}>
                                        {field.type.replaceAll("_", " ")}
                                    </label>

                                    <p class="help mb-2">{field.description}</p>

                                    <div class="control">
                                        <input
                                            class="input"
                                            type="text"
                                            id={key}
                                            name={key}
                                            autocomplete="off"
                                            maxLength="20" 
                                            pattern="^[A-Za-z ,.'\-]+$"
                                            placeholder={field.examples.join(", ")}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
                
                <div class="buttons is-centered">
                    <button class="button is-primary mt-4 " type="submit">
                        Submit
                    </button>
                </div>
            </form>
        {/if}
    </div>
</section>