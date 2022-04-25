<script>
  export let height =10
  export let width = 10
  export let x = 10
  export let y = 0
  export let rot = 0

  const clickhandler = ()=>{
    rot=rot+10
  }
</script>

<rect 
  on:click={clickhandler} 
  height={height} 
  width={width} 
  transform={`translate(${x},${y}) rotate(${rot})`}>
</rect>

<style lang="scss">
  rect{
    fill:bisque;
    stroke:brown;
  }
</style>