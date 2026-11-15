<script>
    import MadLibsForm from './MadLibsForm.svelte';
    
    let { data } = $props();
</script>

<MadLibsForm madlibs={data.madlibs} currentUser="user1" />


<section class="section">
    <container class="container">
        <form method="post" action="?/enter">
            <div class="field">
                <label class="label">Noun</label>
                <div class="control">
                <input class="input" type="text" placeholder="Your name">
                </div>
            </div>
            <div class="field">
                <label class="label">Place.. etc. etc</label>
                <div class="control">
                <input class="input" type="text" placeholder="Your name">
                </div>
            </div>
        </form>
    </container>
</section>
