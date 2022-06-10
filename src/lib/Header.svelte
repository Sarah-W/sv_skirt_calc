<script>
  import User from './User.svelte';
</script>

<nav>
  <div class = container>
    <div id = start>
      <h1 style="margin-bottom:0px">Skirt Calculator</h1>
      <p style="margin-top:0px">Calculates a curtting layout for a circle skirt.</p>
    </div>
    <div id = middle></div>
    <div id = end >
      <User></User>
    </div>
  </div>
</nav>

<style lang="scss">
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* min-height: 40px; */
    width: 80%;
    margin: auto;
    padding: 10px;
    border: solid thin grey;

  }
</style>