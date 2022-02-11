<script>
  export let newsclass = 'Uutiset';
</script>

<main>
  <div class="navbar">
    <div>
      <h1>NETTILEHTI</h1>
    </div>
    <div class="buttons">
      <!-- Päivitetään newsclass-muuttujan arvoa ja lähetetään
           muuttujan arvo äitikomponenttiin. -->
      <p on:click={() => (newsclass = 'Uutiset')}>Uutiset</p>
      <p on:click={() => (newsclass = 'Urheilu')}>Urheilu</p>
      <p on:click={() => (newsclass = 'Viihde')}>Viihde</p>
    </div>
  </div>
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=BioRhyme+Expanded:wght@800&display=swap');

  .navbar {
    background-color: #557a95;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 6em;
    margin-bottom: 1em;
  }

  h1 {
    padding: 0;
    margin: 0;
    font-family: 'BioRhyme Expanded', serif;
    letter-spacing: 25px;
    font-size: 3em;
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
