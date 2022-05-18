<script >
  import { onMount,tick } from 'svelte';
	import Textfield from '@smui/textfield';
	// import Icon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import Radio from '@smui/radio';
	// import FormField from '@smui/form-field';
  import List, { Item, Graphic, Label } from '@smui/list';


	// import Card, { Content } from '@smui/card';
	// import Paper from '@smui/paper';
	// import { format } from 'd3-format';
	import { scaleLinear } from 'd3-scale';
	import { types } from '$lib/skirt_types'
	import Piece from '$lib/Piece.svelte'
  import { newSkirt } from '$lib/skirtStore';

  let _skirt = {
    type: 0,
    waistMeasurement: 80,
    skirtLength: 50,
    seamAllowance: 1.5,
    hemAllowance: 1.5,
    fabricWidth: 112
  };

  const scale = scaleLinear().domain([0,1]).range([0,3])

  let {skirt, pieces} = newSkirt({..._skirt},scale)

 //clone of skirt. We dont want to update skirt on change, which is what bind will do, but on blur or enter.

  let layoutWidth = 500 

  let _pieces =[]

  let width, height, layoutHeight, offset 
  offset = 40
  
  $: width = layoutWidth - 2*offset
  $: height = scale($skirt.fabricWidth)+offset/2
  $: layoutHeight = scale($skirt.fabricWidth) + 3*offset

  const getTicks = (width,tick=50) => {
    const fabriclength = scale.invert(width)
    const nticks = Math.floor(fabriclength/tick)
    return new Array(nticks+1).fill(1).map((x,i)=>i*tick)  
  }

  const recalc = ()=>{
    $skirt = _skirt
    let deltas = _pieces.map(piece=>({dx:piece.dx,dy:piece.dy,pieceRotation:piece.pieceRotation}))
    _pieces = $pieces.map((piece,i)=>({...piece,...deltas[i]}))
    measure()
  } 

  const newlayout =() => {
    $skirt = _skirt
    _pieces = $pieces
  }

  const enter = (e)=>{
    if(e.code == 'Enter'){recalc()}
  }

  
  let pieces_group
  let result ={
    fabric:0,
    innerRadius: 0,
    outerRadius: 0
  }
  const measure = async()=>{
    await tick()
    let groupwidth = pieces_group.getBoundingClientRect().width
    result.fabric= Math.ceil(scale.invert(groupwidth))
    result.innerRadius=Math.round($pieces[0].innerRadius - $skirt.seamAllowance)
    result.outerRadius=Math.round($pieces[0].outerRadius - $skirt.hemAllowance)
  }

  onMount(()=>{
    _pieces=$pieces
  })

</script>

<div class="container">
  <h1>Skirt calculator</h1>
	<div class = setup>
		<div>
      <div class="textfield">
        <Textfield variant="outlined" type="number" input$step="1"  on:blur ={recalc} on:keypress={enter}
          bind:value={_skirt.waistMeasurement} label="Waist">
            <HelperText slot="helper">Waist Measurement in cm</HelperText>
        </Textfield>
      </div>
      <div class="textfield">
			<Textfield class="textfield" type="number" input$step="1" on:blur ={recalc} on:keypress={enter}
        variant="outlined" bind:value={_skirt.skirtLength} label="Length">
				  <HelperText slot="helper">Length in cm</HelperText>
			</Textfield>
    </div>
    <div class="textfield">
			<Textfield class="textfield" type="number" input$step="0.1" on:blur ={recalc} on:keypress={enter}
        variant="outlined" bind:value={_skirt.seamAllowance} label="Seam Allowance">
				  <HelperText slot="helper">Seam allowance in cm</HelperText>
			</Textfield>
    </div>
    <div class="textfield">
			<Textfield class="textfield" type="number" input$step="0.1" on:blur ={recalc} on:keypress={enter}
        variant="outlined" bind:value={_skirt.hemAllowance} label="Hem Allowance">
				  <HelperText slot="helper">Hem allowance in cm</HelperText>
			</Textfield>
    </div>
		</div>
		<div>
      <div class="textfield">
			<Textfield class="textfield" type="number" input$step="1" on:blur ={recalc} on:keypress={enter}
        variant="outlined" bind:value={_skirt.fabricWidth} label="Fabric Width">
				  <HelperText slot="helper">Fabric width in cm</HelperText>
			</Textfield>
      </div>
		</div>
		<div>
      <List>
        {#each types as type,n}
          <Item>
            <Graphic>
              <Radio bind:group={_skirt.type} on:change ={newlayout} value={n} />
            </Graphic>
            <Label>{type.name}</Label>
          </Item>
        {/each}
      </List>
    </div>
    <div>
      <h1>Your skirt</h1>
      <h2>You need at least {result.fabric} cm of fabric.</h2>
      <p>Your pieces have an inner radius of  {result.innerRadius} cm and an outer radius of {result.outerRadius} cm, including hem and seam allowances.</p>
    </div>
	</div>
  <div class=layout bind:clientWidth={layoutWidth}>
    <svg style={`width:${layoutWidth}px;height:${layoutHeight}px`}>
      <g class ='xgridlines gridlines' transform={`translate(${offset},${offset})`}>
        {#each getTicks(width,50) as tickValue}
          <g transform={`translate(${scale(tickValue)},0)`}>
            <line y1={-10} y2={height} stroke="black" />
            <text class="tickvalue" text-anchor="middle" dy=".71em" y={height+offset/2}>
              {tickValue}
            </text>
          </g>
        {/each}
      </g>
      <g class ='ygridlines gridlines' transform={`translate(${offset},${offset})`}>
        {#each getTicks(height,20) as tickValue}
          <g transform={`translate(0,${scale(tickValue)})`}>
            <line x1={-10} x2={width-offset} stroke="black" />
            <text text-anchor="start" x={width-offset/2}>
              {tickValue}
            </text>
          </g>
        {/each}
      </g>
      <g class=fabric transform={`translate(${offset},${offset})`}>
        <rect height ={scale($skirt.fabricWidth)} width = {width-50 } ></rect>
      </g>
      <g class = pieces bind:this={pieces_group} transform={`translate(${offset},${scale($skirt.fabricWidth)+offset})`}>
        {#each _pieces as {
          x, 
          y,
          dx,
          dy,
          pieceRotation,
          seamAllowance,
          hemAllowance,
          startAngle, 
          endAngle,
          innerRadius,
          outerRadius}, i (`${JSON.stringify($skirt)}${i}`)}
          <Piece 
            {x} 
            {y}
            bind:dx={dx}
            bind:dy={dy}
            bind:pieceRotation={pieceRotation}
            {seamAllowance}
            {hemAllowance}
            {startAngle}
            {endAngle}
            {innerRadius}
            {outerRadius}
            on:change={measure}></Piece>
        {/each} 
      </g>
    </svg>
  </div>
</div>

<style lang=scss>
  svg{
    background-color: rgb(222, 232, 241);
  }
	.container {
		min-height: 50px;
		width: 80%;
		margin: auto;
		padding: 10px;
		border: solid thin grey;
	}
  .setup{
    display: flex;
    flex-direction: row; 
    justify-content: flex-start;
    border: solid thin grey;
    div{
      flex-direction: column;
      margin:5px;
    }
  }

  .layout{
    min-height: 50px;
    border: solid thin grey;
  }
  .textfield{
    margin-top: 8px;
    border-style:none;
  }
  line{
    stroke-width: 1px;
    stroke:grey;
  }
  .fabric{
    rect{
      stroke:none;
      fill:rgb(207, 202, 202);
      fill-opacity: 0.5;
    }
  }



</style>
