<script>
    import MadLibsForm from './MadLibsForm.svelte';
    
    let { data } = $props();
</script>

<<<<<<< HEAD
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
=======
<MadLibsForm madlibs={data.madlibs} currentUser="user1" />
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
