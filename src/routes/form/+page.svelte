<script>
    import MadLibsForm from './MadLibsForm.svelte';
    
    let { data } = $props();
</script>

<MadLibsForm madlibs={data.madlibs} currentUser="user1" />