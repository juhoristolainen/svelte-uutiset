<script>
  import { getAllNews, getEntNews, getSportNews } from './newsstore';
  import Uutinen from './Uutinen.svelte';

  export let newsclass;
  let newslist = getAllNews;

  // Aina kun newsclass-muuttujan arvo vaihtuu, niin haetaan
  // eri genren uutiset
  $: {
    switch (newsclass) {
      case 'Uutiset':
        newslist = getAllNews;
        break;

      case 'Urheilu':
        newslist = getSportNews;
        break;

      case 'Viihde':
        newslist = getEntNews;
        break;
    }
  }

  // newslist.then(console.log(newslist));
</script>

<div class="news">
  <!-- Odotetaan newslistin promise valmiiksi. Kun tiedot saadaan
      niin, loopataan ne {#each}:n avulla. -->
  {#await newslist}
    <p>odotellaan</p>
  {:then newslist}
    <!-- Loopataan jokainen newslistin solu ja annetaan 
       solun arvo lapsikomponentille. -->
    {#each newslist as news}
      <Uutinen {news} />
    {/each}
  {/await}
</div>

<style>
  .news {
    width: 70%;
  }
</style>
