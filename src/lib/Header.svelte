<script>
import {signIn,signUserOut,user} from "$lib/firebase.js"
let newuser = false
let signin = false
let logInWithEmail = false
let email = ""
let password = ""
</script>

<nav>
  <div class = container>
    <div id = start><h1>Skirt Calculator</h1></div>
    <div id = middle></div>
    <div id = end >
      <div id = user >
        {#if $user}
          {$user.displayName? $user.displayName : $user.email} 
          <div id ="usrpic" style:background-image={`url(${$user.photoURL})`}></div>
          <!-- <div id ="usrpic"></div> -->
          <button on:click={signUserOut}>Log out</button>
        {:else}
          <div id=login>
            <button on:click={()=>signin = true}>Log in</button>
            {#if signin}
              <div id=login_methods>
                <button on:click={signIn.google}>Log in with Google</button>
                <button on:click={()=>{signin=false;logInWithEmail=true}}>Log in with e-mail and password</button>
                <button on:click={()=>{newuser = true;signin=false}}>Sign up</button>
                <button on:click={()=>signin=false}>Cancel</button>
              </div>
            {/if}
            {#if newuser}
              <div class = input>
                <label for="email">Email </label>
                <input
                  type="text"
                  id="email"
                  bind:value={email}
                />
                <label for="password">Password </label>
                <input
                  type="password"
                  id="password"
                  bind:value={password}
                />
                <div class = buttonset >
                  <button disabled = {!(email && password)} on:click={()=>signIn.newUser(email,password)}>Sign up</button>
                  <button on:click={()=>{newuser=false}}>Cancel</button>
                </div>
              </div>
            {/if}
            {#if logInWithEmail}
              <div class = input>
                <label for="email">Email </label>
                <input
                  type="text"
                  id="email"
                  bind:value={email}
                />
                <label for="password">Password </label>
                <input
                  type="password"
                  id="password"
                  bind:value={password}
                />
                <div class = buttonset >
                  <button disabled = {!(email && password)} on:click={()=>{signIn.email(email,password);logInWithEmail=false}}>Sign in</button>
                  <button on:click={()=>{logInWithEmail=false}}>Cancel</button>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
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

  #login{
    position: relative;
  }

  #login_methods{
    display: flex;
    flex-direction: column;
    gap:3px;
    position: absolute;
    right:0px;
    top:0px;
    width:fit-content;
    padding: 5px;
    background-color: white;
    border: solid thin grey;
    border-radius:4px;
    button{
      width:100%;
      white-space: nowrap
    }
  }
  button{
      width:100%;
      white-space: nowrap
    }

  .input{
      display: flex;
      flex-direction: column;
      position: absolute;
      right:0px;
      top:0px;
      min-width: 250px;
      width:fit-content;
      padding: 5px;
      background-color: white;
      border: solid thin grey;
      border-radius:4px;
      input{
        font-size: large;
        color:darkslategrey;
        border-radius:4px;
        border-color: #ccc;
        border-width: thin;
        border-style: solid;
        padding:3px;
				margin-bottom: 3px;
      }

    } 

    label{
        margin-bottom: 3px;
        font-size: small;
      }

    div.buttonset{
		width:100%;
		display:flex;
		flex-direction: row;
		margin:0px;
		padding:5px 0px;
		gap:5px;
		justify-content: space-between;
		button{
			width:100%
		}
	}

  #user{
    white-space: nowrap;
    display: flex;
    align-items: center;
  }
  #usrpic{
    padding:20px;
    border-radius: 40px;
    margin:10px;
    background-position: center;
    background-size: cover;
    background-color: grey;
  }

</style>