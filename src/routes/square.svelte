<script>
import Rotato from '../lib/Rotato.svelte'
  let rects=[
    {
      height:200,
      width:200,
      x:400,
      y:400,
      rot:0
    },
    {
      height:100,
      width:100,
      x:200,
      y:200,
      rot:0
    }
  ]
  
</script>


<svg width=800 height=800>
  {#each rects as rect}
  <Rotato {...rect}></Rotato>
  {/each}  
</svg>


<style lang="scss">
  svg{
    background-color: aquamarine;
  }
</style>