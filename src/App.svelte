<script>
  import Navbar from './Navbar.svelte';
  import Uutiset from './Uutiset.svelte';
  import Footer from './Footer.svelte';

  let newsclass = 'Uutiset';
</script>

<main>
  <header>
    <Navbar bind:newsclass />
  </header>
  <div class="newslist">
    <Uutiset {newsclass} />
  </div>
  <Footer />
</main>

<style>
  .newslist {
    display: flex;
    justify-content: center;
  }
</style>
