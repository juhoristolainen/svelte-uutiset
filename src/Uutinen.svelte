<script>
  export let news;

  const url = `https://iltalehti.fi/${news.category.category_name}/a/${news.article_id}`;
</script>

<main>
  <a href={url} target="_blank" rel="noreferrer noopener">
    <div class="news">
      <div>
        <img src={news.main_image_urls.size138} alt="" />
      </div>
      <div>
        <h1>{news.headline}</h1>
        <p>{news.lead}</p>
      </div>
    </div>
  </a>
</main>

<style>
  p {
    margin-top: 0;
  }

  h1 {
    margin-bottom: 0;
    font-size: 1.5em;
  }

  img {
    height: 7em;
    margin-right: 1em;
  }

  .news {
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin: 1em;
    padding: 1em;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
    display: flex;
  }

  a {
    text-decoration: none;
    color: black;
  }
</style>
