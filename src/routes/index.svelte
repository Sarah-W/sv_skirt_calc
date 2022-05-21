<script>
	import { onMount, tick } from 'svelte';

	// import { format } from 'd3-format';
	import { scaleLinear } from 'd3-scale';
	import { types } from '$lib/skirt_types';
	import Piece from '$lib/Piece.svelte';
	import { newSkirt } from '$lib/skirtStore';

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

	onMount(() => {
		_pieces = $pieces;
	});
</script>

<div class="container">
	<h1>Skirt calculator</h1>

	<div class="setup">
		<div>
			<div>
				<label for="waist">Waist: </label>
				<input
					type="number"
					id="waist"
					on:blur={recalc}
					on:keypress={enter}
					bind:value={_skirt.waistMeasurement}
					label="Waist"
				/>
			</div>
			<div>
				<label for="length">Length: </label>
				<input
					type="number"
					id="length"
					on:blur={recalc}
					on:keypress={enter}
					bind:value={_skirt.skirtLength}
				/>
			</div>
			<div>
				<label for="seam_allowance">Seam Allowance: </label>
				<input
					type="number"
					id="seam_allowance"
					on:blur={recalc}
					on:keypress={enter}
					bind:value={_skirt.seamAllowance}
				/>
			</div>
			<div>
				<label for="hem_allowance">Hem Allowance: </label>
				<input
					type="number"
					id="hem_allowance"
					on:blur={recalc}
					on:keypress={enter}
					bind:value={_skirt.hemAllowance}
				/>
			</div>
			<div>
				<label for="fabricwidth">Fabric Width: </label>
				<input
					type="number"
					id="fabricwidth"
					on:blur={recalc}
					on:keypress={enter}
					bind:value={_skirt.fabricWidth}
				/>
			</div>
		</div>
		<div>
			{#each types as type, n}
				<label>
					<input type="radio" bind:group={_skirt.type} on:change={newlayout} value={n} />
					{type.name}
				</label>
			{/each}
		</div>
		<div>
			<h1>Your skirt</h1>
			<h2>You need at least {result.fabric} cm of fabric.</h2>
			<p>
				Your pieces have an inner radius of {result.innerRadius} cm and an outer radius of {result.outerRadius}
				cm, including hem and seam allowances.
			</p>
		</div>
	</div>
	<div class="layout" bind:clientWidth={layoutWidth}>
		<svg style={`width:${layoutWidth}px;height:${layoutHeight}px`}>
			<g class="xgridlines gridlines" transform={`translate(${offset},${offset})`}>
				{#each getTicks(width, 50) as tickValue}
					<g transform={`translate(${scale(tickValue)},0)`}>
						<line y1={-10} y2={height} stroke="black" />
						<text class="tickvalue" text-anchor="middle" dy=".71em" y={height + offset / 2}>
							{tickValue}
						</text>
					</g>
				{/each}
			</g>
			<g class="ygridlines gridlines" transform={`translate(${offset},${offset})`}>
				{#each getTicks(height, 20) as tickValue}
					<g transform={`translate(0,${scale(tickValue)})`}>
						<line x1={-10} x2={width - offset} stroke="black" />
						<text text-anchor="start" x={width - offset / 2}>
							{tickValue}
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
		div {
      display: flex;
      flex-direction: column;
      
			margin: 5px;
      div{
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
      }
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
