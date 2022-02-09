<script>
  export let newsclass = 'Uutiset';
</script>

<main>
  <div class="navbar">
    <div>
      <h1>NETTILEHTI</h1>
    </div>
    <div class="buttons">
      <p on:click={() => (newsclass = 'Uutiset')}>Uutiset</p>
      <p on:click={() => (newsclass = 'Urheilu')}>Urheilu</p>
      <p on:click={() => (newsclass = 'Viihde')}>Viihde</p>
    </div>
  </div>
</main>

<style>
  .navbar {
    background-color: #557a95;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 4em;
    margin-bottom: 1em;
  }

  h1 {
    padding: 0;
    margin: 0;
  }

  .buttons {
    display: flex;
    flex-direction: row;
  }

  p {
    margin: 0.5em;
    cursor: pointer;
  }
</style>
