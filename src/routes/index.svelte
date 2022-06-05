<script>
	import { onMount, tick } from 'svelte';

	// import { format } from 'd3-format';
	import { scaleLinear } from 'd3-scale';
	import { types } from '$lib/skirt_types';
	import Piece from '$lib/Piece.svelte';
	import { newSkirt } from '$lib/skirtStore';
	import {user,saveSkirt,skirtlist,updateSkirt,deleteSkirt} from '$lib/firebase.js'

	let _skirt = {
		type: 0,
		waistMeasurement: 80,
		skirtLength: 50,
		seamAllowance: 1.5,
		hemAllowance: 1.5,
		fabricWidth: 112
	};

	const scale = scaleLinear().domain([0, 1]).range([0, 3]);

	let { skirt, pieces } = newSkirt({ ..._skirt }, scale);

	//clone of skirt. We dont want to update skirt on change, which is what bind will do, but on blur or enter.

	let layoutWidth = 500;

	let _pieces = [];

	let width, height, layoutHeight, offset;
	offset = 40;

	$: width = layoutWidth - 2 * offset;
	$: height = scale($skirt.fabricWidth) + offset / 2;
	$: layoutHeight = scale($skirt.fabricWidth) + 3 * offset;

	const getTicks = (width, tick = 50) => {
		const fabriclength = scale.invert(width);
		const nticks = Math.floor(fabriclength / tick);
		return new Array(nticks + 1).fill(1).map((x, i) => i * tick);
	};

	const recalc = () => {
		$skirt = _skirt;
		let deltas = _pieces.map((piece) => ({
			dx: piece.dx,
			dy: piece.dy,
			pieceRotation: piece.pieceRotation
		}));
		_pieces = $pieces.map((piece, i) => ({ ...piece, ...deltas[i] }));
		measure();
	};

	const newlayout = () => {
		$skirt = _skirt;
		_pieces = $pieces;
		skirtindex="blank"
		newSkirtName = ""
	};

	const enter = (e) => {
		if (e.code == 'Enter') {
			recalc();
		}
	};

	let pieces_group;
	let result = {
		fabric: 0,
		innerRadius: 0,
		outerRadius: 0
	};
	const measure = async () => {
		await tick();
		let groupwidth = pieces_group.getBoundingClientRect().width;
		result.fabric = Math.ceil(scale.invert(groupwidth));
		result.innerRadius = Math.round($pieces[0].innerRadius - $skirt.seamAllowance);
		result.outerRadius = Math.round($pieces[0].outerRadius - $skirt.hemAllowance);
	};

	let newSkirtName =""
	let skirtindex = "blank"
	let skirtID = ""


	const save = ()=>{
		skirtindex= 0
		saveSkirt(newSkirtName,$user,$skirt,_pieces)
		makeNewSkirt=false
	}

	const load = ()=>{
		console.log("loading? ", skirtindex)
		if(skirtindex == "blank"){return}
		skirtID=$skirtlist[skirtindex].id
		console.log(skirtID)
		_skirt = {...$skirtlist[skirtindex].data.skirt}
		_pieces =  [...$skirtlist[skirtindex].data._pieces]
		recalc()
		newSkirtName = ""
	}

	const update = ()=>{
		updateSkirt($skirtlist[skirtindex],_skirt,_pieces)
	}

	const del = ()=>{
		deleteSkirt(skirtID).then(load)
	}

	onMount(() => {
		_pieces = $pieces;
	});

$:console.log($skirtlist[skirtindex]?.data)
let makeNewSkirt = false
</script>

<!-- {#each $skirtlist as {id,data} }
<button on:click={()=>deleteSkirt(id)}>{data.skirtname}</button>
{/each} -->

<div class="container">
	<!-- <h1>Skirt calculator</h1> -->

	<div class="setup">
		<div>
      
      <fieldset class = radio_wrap>
        <legend>Set pattern measurements </legend>
        <div class = number_input>
          <label for="waist">Waist measurement in cm: </label>
          <input
            type="number"
            id="waist"

            on:blur={recalc}
            on:keypress={enter}
            bind:value={_skirt.waistMeasurement}
            label="Waist"
          />
        </div>
        <div class = number_input>
          <label for="length">Length of skirt in cm: </label>
          <input
            type="number"
            id="length"
            on:blur={recalc}
            on:keypress={enter}
            bind:value={_skirt.skirtLength}
          />
        </div>
        <div class = number_input>
          <label for="seam_allowance">Seam allowance in cm: </label>
          <input
            type="number"
            id="seam_allowance"
            step=0.5
            on:blur={recalc}
            on:keypress={enter}
            bind:value={_skirt.seamAllowance}
          />
        </div>
        <div class = number_input>
          <label for="hem_allowance">Hem allowance in cm: </label>
          <input
            type="number"
            id="hem_allowance"
            step=0.5
            on:blur={recalc}
            on:keypress={enter}
            bind:value={_skirt.hemAllowance}
          />
        </div>
        <div class = number_input>
          <label for="fabricwidth">Fabric width in cm: </label>
          <input
            type="number"
            id="fabricwidth"
            on:blur={recalc}
            on:keypress={enter}
            bind:value={_skirt.fabricWidth}
          />
        </div>
      </fieldset>
		</div>
    <div>
      <fieldset class = radio_wrap>
        <legend>Choose a layout</legend> 
        {#each types as type, n}
        <div class = "radio_input">
          <input type="radio" id={"_"+n} bind:group={_skirt.type} on:change={newlayout} value={n} />
          <label for ={"_"+n}>	{type.name} </label>
        </div>
        {/each}
      </fieldset>
    </div>
		<div>
      <fieldset class = radio_wrap>
        <legend>Your skirt</legend>
        <h2>You need at least {result.fabric} cm of fabric.</h2>
        <p>
          Your pieces have an inner radius of {result.innerRadius} cm and an outer radius of {result.outerRadius}
          cm, including hem and seam allowances.
        </p>
      </fieldset>
		</div>
		<div>
      <fieldset class = radio_wrap>
				<legend>Your saved skirts</legend>
				<div class = save_input style:display={makeNewSkirt?"none":null}>
          <label for="skirts">Load a skirt: </label>
          <select
            type="select"
            id="skirts"
            bind:value={skirtindex}
						on:change={load}
          >
						<option value={"blank"}></option>
						{#each $skirtlist as {data,id},i (id)}
							<option value={i}>{data.skirtname}</option>
						{/each}
					</select>
        </div>
				<div style:display={makeNewSkirt?"none":null} class = buttonset>
					<button disabled = {skirtindex=="blank"}  on:click={update}>Save</button>	
					<button disabled = {skirtindex=="blank"} on:click={load}>Revert</button>
					<button disabled = {skirtindex=="blank"}  on:click={del}>Delete</button>
				</div>

				<div class = save_input  style:display={makeNewSkirt?null:"none"} >
          <label for="skirtname">New skirt name: </label>
          <input
            type="text"
            id="skirtname"
            bind:value={newSkirtName}
          />
        </div>

        <div class = buttonset style:display={makeNewSkirt?null:"none"}>
          <button disabled = {!newSkirtName} on:click={save}>Save</button>
					<button on:click={()=>{makeNewSkirt=false}}>Cancel</button>
        </div>
				<div class = buttonset>
					<button disabled = {false} style:display={makeNewSkirt?"none":null} on:click={()=>{makeNewSkirt = true}}>New Skirt</button>
				</div>
	

      </fieldset>
		</div>
	</div>
	<div class="layout" bind:clientWidth={layoutWidth}>
		<svg style={`width:${layoutWidth}px;height:${layoutHeight}px`}>
			<g class="xgridlines gridlines" transform={`translate(${offset},${offset})`}>
				{#each getTicks(width, 50) as tickValue}
					<g transform={`translate(${scale(tickValue)},0)`}>
						<line y1={-10} y2={height} stroke="black" />
						<text class="tickvalue" text-anchor="middle" dy=".71em" y={height + offset / 2}>
							{tickValue} cm
						</text>
					</g>
				{/each}
			</g>
			<g class="ygridlines gridlines" transform={`translate(${offset},${offset})`}>
				{#each getTicks(height, 20) as tickValue}
					<g transform={`translate(0,${scale(tickValue)})`}>
						<line x1={-10} x2={width - offset} stroke="black" />
						<text text-anchor="start" x={width - offset / 2}>
							{tickValue} cm
						</text>
					</g>
				{/each}
			</g>
			<g class="fabric" transform={`translate(${offset},${offset})`}>
				<rect height={scale($skirt.fabricWidth)} width={width - 50} />
			</g>
			<g
				class="pieces"
				bind:this={pieces_group}
				transform={`translate(${offset},${scale($skirt.fabricWidth) + offset})`}
			>
				{#each _pieces as { x, y, dx, dy, pieceRotation, seamAllowance, hemAllowance, startAngle, endAngle, innerRadius, outerRadius }, i (`${JSON.stringify($skirt)}${i}`)}
					<Piece
						{x}
						{y}
						bind:dx
						bind:dy
						bind:pieceRotation
						{seamAllowance}
						{hemAllowance}
						{startAngle}
						{endAngle}
						{innerRadius}
						{outerRadius}
						on:change={measure}
					/>
				{/each}
			</g>
		</svg>
	</div>
</div>

<style lang="scss">
	svg {
		background-color: rgb(222, 232, 241);
	}
	.container {
		min-height: 50px;
		width: 80%;
		margin: auto;
		padding: 10px;
		border: solid thin grey;
	}
	.setup {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		border: solid thin grey;
    div{
      display: flex;
      flex-direction: column;
			margin: 5px;
    }

    fieldset{
      border-radius:4px;
      border-color: #ccc;
      border-width: thin;
      border-style: solid;
      margin:5px; 
    }
		.radio_input{
      display: flex;
      flex-direction: row;
      align-items: center;
      input{
        margin:5px;
      }
    }

    .number_input{
      display: flex;
      flex-direction: column;
			margin: 5px;
      input,select{
        font-size: large;
        margin-left: 30px;
        width:60%;
        color:darkslategrey;
        border-radius:4px;
        border-color: #ccc;
        border-width: thin;
        border-style: solid;
        padding:3px;
      }
      label{
        margin-bottom: 3px;
        font-size: small;
      }
    }  
		.save_input{
      display: flex;
      flex-direction: column;
      input,select{
        font-size: large;
        width:100%;
        color:darkslategrey;
        border-radius:4px;
        border-color: #ccc;
        border-width: thin;
        border-style: solid;
        padding:3px;
      }
      label{
        margin-bottom: 3px;
        font-size: small;
      }
    }  
	}
	
	div.buttonset{
		width:200px;
		display:flex;
		flex-direction: row;
		margin:0;
		padding:5px;
		gap:5px;
		justify-content: space-between;
		button{
			width:100%
		}
	}

	.layout {
		min-height: 50px;
		border: solid thin grey;
	}
	line {
		stroke-width: thin;
		stroke: grey;
	}
	.fabric {
		rect {
			stroke: none;
			fill: rgb(207, 202, 202);
			fill-opacity: 0.5;
		}
	}
</style>
