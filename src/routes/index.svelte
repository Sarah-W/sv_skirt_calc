<script lang="ts">
	import Textfield from '@smui/textfield';
	// import Icon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import Radio from '@smui/radio';
	// import FormField from '@smui/form-field';
  import List, { Item, Graphic, Label } from '@smui/list';


	import Card, { Content } from '@smui/card';
	import Paper from '@smui/paper';
	import { format } from 'd3-format';
	import { scaleLinear } from 'd3-scale';
	import { axisBottom, axisRight } from 'd3-axis';
	import { types } from '$lib/skirt_types'

	let skirt = {
		name: 'skirt',
		type: types[0],
		waistMeasurement: 80,
		skirtLength: 50,
		seamAllowance: 1.5,
		hemAllowance: 1.5,
		fabricWidth: 112
	};

	const piece_rotate = (piece)=>{
		const oldCentroid = piece.centroid()
		piece.pieceRotaton = piece.pieceRotaton + Math.PI/4
		const newCentroid = piece.centroid()
		const dx=oldCentroid[0]-newCentroid[0]
		const dy=oldCentroid[1]-newCentroid[1]
		piece.dx=piece.dx+dx
		piece.dy=piece.dy-dy
		piece.transform=piece_transform(piece)
		piece = piece
		console.log("rotating" , piece)
		return piece
	}

	const piece_drag = (piece)=>{

	}

	const piece_transform = (piece) => {
		return `translate(${piece.x + piece.dx},${-1*piece.y+piece.dy}) rotate(${piece.pieceRotaton})`
	}
	
  // need to regenerate skirt on change of input. may also need to do some sanity-isation

  let layoutWidth
  let offset = 40
  let xscale = scaleLinear()
  let yscale = scaleLinear()

// have to do the gridlines by hand, only using the yscale for nice ticks and that's really not a good enough reason  

  $: width = layoutWidth - 2*offset 
  $: xscale = xscale.domain([0,width/3]).range([0,width])
  $: height = xscale(skirt.fabricWidth+20) 
  $: layoutHeight = height + 2*offset
  $: yscale = yscale.domain([0,height/3]).range([0,height])


	const get_pieces = (skirt)=>{
		let pieces = skirt.type.layoutGenerator(skirt, xscale)
		pieces.forEach((piece)=>{piece.transform=piece_transform(piece)})
		// console.log(pieces)
		return pieces
	}
  
  // $:console.log({layoutWidth,scale: xscale})
  // let xgridlines = axisBottom(xscale)
  // let ygridlines = axisRight(xscale)
  // let xg

</script>

<div class="container">
  <h1>Skirt calculator</h1>
	<div class = setup>
		<div>
      <div class="textfield">
        <Textfield variant="outlined" bind:value={skirt.waistMeasurement} label="Waist">
          <HelperText slot="helper">Waist Measurement in cm</HelperText>
        </Textfield>
      </div>
      <div class="textfield">
			<Textfield class="textfield" variant="outlined" bind:value={skirt.skirtLength} label="Length">
				<HelperText slot="helper">Length in cm</HelperText>
			</Textfield>
    </div>
    <div class="textfield">
			<Textfield class="textfield" variant="outlined" bind:value={skirt.seamAllowance} label="Seam Allowance">
				<HelperText slot="helper">Seam allowance in cm</HelperText>
			</Textfield>
    </div>
    <div class="textfield">
			<Textfield class="textfield" variant="outlined" bind:value={skirt.hemAllowance} label="Hem Allowance">
				<HelperText slot="helper">Hem allowance in cm</HelperText>
			</Textfield>
    </div>
		</div>
		<div>
      <div class="textfield">
			<Textfield class="textfield" variant="outlined" bind:value={skirt.fabricWidth} label="Fabric Width">
				<HelperText slot="helper">Fabric width in cm</HelperText>
			</Textfield>
      </div>
		</div>
		<div>
      <List>
        {#each types as type}
          <Item>
            <Graphic>
              <Radio bind:group={skirt.type} value={type} />
            </Graphic>
            <Label>{type.name}</Label>
          </Item>
        {/each}
      </List>
    </div>
	</div>
  <div class=layout bind:clientWidth={layoutWidth}>
    <svg style={`width:${layoutWidth}px;height:${layoutHeight}px`}>
      <!-- <g class ='xgridlines gridlines' bind:this={xg}></g> -->
      <g class ='xgridlines gridlines' transform={`translate(${offset},${offset})`}>
        {#each xscale.ticks() as tickValue}
        <g transform={`translate(${xscale(tickValue)},0)`}>
          <line y1={-10} y2={height} stroke="black" />
          <text text-anchor="middle" dy=".71em" y={height+offset/2}>
            {tickValue}
          </text>
        </g>
      {/each}
      </g>
      <g class ='ygridlines gridlines' transform={`translate(${offset},${offset})`}>
        {#each yscale.ticks() as tickValue}
        <g transform={`translate(0,${yscale(tickValue)})`}>
          <line x1={-10} x2={width-offset} stroke="black" />
          <text text-anchor="start" x={width-offset/2}>
            {tickValue}
          </text>
        </g>
      {/each}
      </g>
      <g class=fabric transform={`translate(${offset},${offset})`}>
        <rect height ={yscale(skirt.fabricWidth)} width = {width-50 } ></rect>
      </g>
      <g class = pieces  transform={`translate(${offset},${yscale(skirt.fabricWidth)+offset})`}>
        {#each get_pieces(skirt) as piece}
        <g on:click={()=>piece = piece_rotate(piece)} transform={piece.transform}>
          <path class=main d={piece.path()}/>
          {#each piece.csa() as csa}
            <path class=csa d={csa.path} />
          {/each}
          {#each piece.ssa() as {height,width,transform}}
            <rect class=csa {height} {width} {transform}/>
          {/each}
        </g>
        {/each} 
      </g>

    </svg>
  </div>
</div>

<style lang=scss>
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
      fill:grey;
      fill-opacity: 0.5;
    }
  }
  .main{
    stroke:none;
      fill:hotpink;
      fill-opacity: 0.5;
  }


</style>
