<script>
  import Navbar from './Navbar.svelte';
  import Uutiset from './Uutiset.svelte';
  import Footer from './Footer.svelte';

  let newsclass = 'Uutiset';

  // let salaisuus = process.env.NEWS_URL;
</script>

<main>
  <header>
    <Navbar bind:newsclass />
  </header>
  <!-- <h1>salaisuus: {salaisuus}</h1> -->
  <h1>salaisuus</h1>
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
