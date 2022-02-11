<script>
  import Navbar from './Navbar.svelte';
  import Uutiset from './Uutiset.svelte';
  import Footer from './Footer.svelte';

  let newsclass = 'Uutiset';
</script>

<main>
  <header>
    <!-- Otetaan komponentista arvo newsclass-muuttujaan -->
    <Navbar bind:newsclass />
  </header>
  <div class="newslist">
    <!-- Viedään newsclass muuttujan arvo lapsikomponenttiin. -->
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
