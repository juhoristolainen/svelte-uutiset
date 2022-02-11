<script>
  export let news;

  const url = `https://iltalehti.fi/${news.category.category_name}/a/${news.article_id}`;
</script>

<a href={url} target="_blank" rel="noreferrer noopener">
  <div class="news">
    <!-- Mikäli kuvaa ei ole, niin sitä ei myöskään näytetä.
        Ilman iffitystä sivu jää lataamatta mikäli yhdestä uutisesta
        puuttuu kuva -->
    {#if news.main_image_urls}
      <div>
        <img src={news.main_image_urls.size138} alt="" />
      </div>
    {/if}
    <div>
      <h1>{news.headline}</h1>
      <p>{news.lead}</p>
    </div>
  </div>
</a>

<style>
  p {
    margin-top: 0;
  }

  h1 {
    margin-bottom: 0;
    font-size: 1.5em;
  }

  img {
    height: 100%;
    max-width: 10em;
    margin-right: 2em;
  }

  .news {
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin: 1em;
    padding: 1em;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    /* justify-content: space-evenly; */
  }

  a {
    text-decoration: none;
    color: black;
  }

  @media screen and (max-width: 800px) {
    .news {
      flex-direction: column;
    }
    img {
      width: 100%;
    }
  }
</style>
