<script>
  import { page } from '$app/state';
</script>

<section class="section">
<h1 class="title">404 — Page not found</h1>
<p>{page.error.message}</p>
<p>You've visited a page that doesn't exist.</p>
</section>