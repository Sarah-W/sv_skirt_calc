<script>
import {signIn,signUserOut,user} from "$lib/firebase.js"
let newuser = false
</script>

<nav>
  <div class = container>
    <div id = start><h1>Skirt Calculator</h1></div>
    <div id = middle></div>
    <div id = end >
      <div id = user >
        {#if $user}
        {$user.displayName} 
        <div id ="usrpic" style:background-image={`url(${$user.photoURL})`}></div>
          <button on:click={signUserOut}>Log out</button>
        {:else}
          <div>
            <button on:click={signIn.google}>Log in with Google</button>
            <button on:click={()=>newuser = true}>Sign up</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
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
  #user{
    display: flex;
    align-items: center;
  }
  #usrpic{
    height:40px;
    width:40px;
    border-radius: 40px;
    margin:10px;
    background-position: center;
    background-size: cover;
    background-color: grey;
  }

</style>