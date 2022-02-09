<script>
  import { getAllNews, getEntNews, getSportNews } from './newsstore';
  import Uutinen from './Uutinen.svelte';

  export let newsclass;
  let newslist = getAllNews;

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

  newslist.then(console.log(newslist));
</script>

<main>
  {#await newslist}
    <p>odotellaan</p>
  {:then newslist}
    {#each newslist as news}
      <Uutinen {news} />
    {/each}
  {/await}
</main>

<style>
  main {
    width: 70%;
  }
</style>
