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
	import { arc } from 'd3-shape';

	const _arc = function () {
		return arc()({
			innerRadius: this.innerRadius,
			outerRadius: this.outerRadius,
			startAngle: this.startAngle + this.pieceRotaton,
			endAngle: this.endAngle + this.pieceRotaton
		});
	};
	const centroid = function () {
		return arc().centroid({
			innerRadius: this.innerRadius,
			outerRadius: this.outerRadius,
			startAngle: this.startAngle + this.pieceRotaton,
			endAngle: this.endAngle + this.pieceRotaton
		});
	};

	let csa = function () {
		//curved seam/hem allowances (top and bottom)
		let waist = arc()({
			innerRadius: this.innerRadius - this.seamAllowance,
			outerRadius: this.innerRadius,
			startAngle: this.startAngle + this.pieceRotaton,
			endAngle: this.endAngle + this.pieceRotaton
		});
		let hem = arc()({
			innerRadius: this.outerRadius,
			outerRadius: this.outerRadius + this.hemAllowance,
			startAngle: this.startAngle + this.pieceRotaton,
			endAngle: this.endAngle + this.pieceRotaton
		});

		return [
			{ name: 'waist', path: waist },
			{ name: 'hem', path: hem }
		];
	};
	let ssa = function () {
		//straight seam allowances (sides)
		let height = this.seamAllowance + this.hemAllowance + this.outerRadius - this.innerRadius;
		let width = this.seamAllowance;

		let x1 =
			(this.innerRadius - this.seamAllowance) * Math.sin(this.startAngle + this.pieceRotaton);
		let y1 =
			(this.innerRadius - this.seamAllowance) * -1 * Math.cos(this.startAngle + this.pieceRotaton);

		let transform1 =
			'translate(' +
			x1 +
			',' +
			y1 +
			') rotate(' +
			(180 * (this.startAngle + this.pieceRotaton - Math.PI)) / Math.PI +
			')';

		let x2 =
			(this.innerRadius - this.seamAllowance) * Math.sin(this.endAngle + this.pieceRotaton) +
			this.seamAllowance * Math.cos(this.endAngle + this.pieceRotaton);
		let y2 =
			(this.innerRadius - this.seamAllowance) * -1 * Math.cos(this.endAngle + this.pieceRotaton) +
			this.seamAllowance * Math.sin(this.endAngle + this.pieceRotaton);

		let transform2 =
			'translate(' +
			x2 +
			',' +
			y2 +
			') rotate(' +
			(180 * (this.endAngle + this.pieceRotaton - Math.PI)) / Math.PI +
			')';

		return [
			{ name: 'start', height: height, width: width, transform: transform1 },
			{ name: 'end', height: height, width: width, transform: transform2 }
		];
	};

	let basePiece = {
		path: _arc,
		centroid,
		csa,
		ssa,
		dx: 0,
		dy: 0,
		pieceRotaton: 0
	};

	let types = [
		{
			name: 'Half circle',
			layoutGenerator: function (skirt) {
				const r = skirt.waistMeasurement / Math.PI;
				const R = skirt.skirtLength + r;
				skirt.r = r;
				skirt.R = R;

				const angle = Math.PI;
				if (2 * (R + skirt.hemAllowance) <= skirt.fabricWidth) {
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							endAngle: Math.PI,
							startAngle: 0,
							x: xscale(skirt.seamAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: 0,
							endAngle: Math.PI / 2,
							x: xscale(skirt.seamAllowance),
							y: xscale(skirt.seamAllowance)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI,
							endAngle: (3 * Math.PI) / 2,
							x: Math.max(
								xscale(
									skirt.seamAllowance +
										Math.sqrt(
											4 * (R + skirt.hemAllowance) ** 2 -
												(skirt.fabricWidth - 2 * skirt.seamAllowance) ** 2
										)
								),
								xscale(R + skirt.hemAllowance)
							),
							y: xscale(skirt.fabricWidth - skirt.seamAllowance)
						}
					];
				}
			}
		},
		{
			name: 'Full circle with centre back seam',

			layoutGenerator: function (skirt) {
				const r = skirt.waistMeasurement / (2 * Math.PI);
				const R = skirt.skirtLength + r;
				skirt.r = r;
				skirt.R = R;
				if (2 * R + skirt.hemAllowance <= skirt.fabricWidth) {
					// one piece
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: 0,
							endAngle: 4 * Math.PI,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					//3 pieces
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: 0,
							endAngle: Math.PI / 2,
							x: xscale(skirt.seamAllowance),
							y: xscale(skirt.seamAllowance)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI / 2,
							endAngle: (3 * Math.PI) / 2,
							x: xscale(
								Math.max(
									skirt.seamAllowance +
										Math.sqrt(
											4 * (R + skirt.hemAllowance) ** 2 -
												(skirt.fabricWidth - 2 * skirt.seamAllowance) ** 2
										),
									R + skirt.hemAllowance + skirt.seamAllowance
								)
							),
							y: xscale(skirt.fabricWidth - skirt.seamAllowance)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (3 * Math.PI) / 2,
							endAngle: 2 * Math.PI,
							x: xscale(
								Math.max(
									skirt.seamAllowance +
										2 *
											Math.sqrt(
												4 * (R + skirt.hemAllowance) ** 2 -
													(skirt.fabricWidth - 2 * skirt.seamAllowance) ** 2
											),
									2 * (R + skirt.hemAllowance) + skirt.seamAllowance
								)
							),
							y: xscale(skirt.seamAllowance)
						}
					];
				}
			}
		},
		{
			name: 'Full circle without centre back seam',
			layoutGenerator: function (skirt) {
				const r = skirt.waistMeasurement / (2 * Math.PI);
				const R = skirt.skirtLength + r;
				skirt.r = r;
				skirt.R = R;

				if (2 * (R + skirt.hemAllowance) <= skirt.fabricWidth) {
					// one piece
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: 0,
							endAngle: 4 * Math.PI,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					//2 pieces
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (-1 * Math.PI) / 2,
							endAngle: Math.PI / 2,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(skirt.seamAllowance)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI / 2,
							endAngle: (3 * Math.PI) / 2,
							x: xscale(
								R +
									skirt.hemAllowance +
									Math.sqrt(
										4 * (R + skirt.hemAllowance) ** 2 -
											(skirt.fabricWidth - 2 * skirt.seamAllowance) ** 2
									)
							),
							y: xscale(skirt.fabricWidth - skirt.seamAllowance)
						}
					];
				}
			}
		},
		{
			name: 'Three Quarter circle, straight sides together',
			layoutGenerator: function (skirt) {
				const r = (2 * skirt.waistMeasurement) / (3 * Math.PI);
				const R = skirt.skirtLength + r;

				skirt.r = r;
				skirt.R = R;

				let x =
					3 * (R + skirt.hemAllowance) - skirt.fabricWidth + 2 * Math.SQRT2 * skirt.seamAllowance;

				const f = skirt.fabricWidth - 2 * skirt.hemAllowance;

				let yOffset = 0;

				if (f - R + (r - skirt.seamAllowance) * Math.SQRT1_2 > f / 2) {
					x = x - (r - skirt.seamAllowance * Math.SQRT1_2);
				}

				if (f - R + (r - skirt.seamAllowance) * Math.SQRT1_2 > R + skirt.hemAllowance) {
					x = (R + skirt.hemAllowance + skirt.seamAllowance) * Math.SQRT1_2;
					yOffset = f - 2 * R + Math.SQRT1_2 * (r - 2 * skirt.seamAllowance) - skirt.seamAllowance;
				}

				if (2 * (R + skirt.hemAllowance) <= skirt.fabricWidth - 2 * skirt.seamAllowance) {
					// one piece
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (3 * Math.PI) / 4,
							endAngle: (9 * Math.PI) / 4,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					//2 pieces
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (3 * Math.PI) / 2,
							endAngle: (9 * Math.PI) / 4,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(skirt.fabricWidth - (R + yOffset + skirt.hemAllowance))
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI / 2,
							endAngle: (5 * Math.PI) / 4,
							x: xscale(x),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				}
			}
		},

		{
			name: 'Three Quarter circle layout on selvedge, curved sides together',

			layoutGenerator: function (skirt) {
				const r = (2 * skirt.waistMeasurement) / (3 * Math.PI);
				const R = skirt.skirtLength + r;

				skirt.r = r;
				skirt.R = R;

				const f = skirt.fabricWidth - 2 * skirt.seamAllowance;
				let x = 3 * (R + skirt.hemAllowance) - f;

				let yOffset = 0;
				if (f - R + skirt.hemAllowance + r * Math.SQRT1_2 > f / 2) {
					x = x - r;
				}
				if (f - R + skirt.hemAllowance + r * Math.SQRT1_2 > R + skirt.hemAllowance) {
					x = R * Math.SQRT1_2;
					yOffset = skirt.fabricWidth - 2 * R + Math.SQRT1_2 * r;
				}

				if (2 * (R + skirt.hemAllowance) <= skirt.fabricWidth - 2 * skirt.seamAllowance) {
					// one piece
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (3 * Math.PI) / 4,
							endAngle: (9 * Math.PI) / 4,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					//2 pieces
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (3 * Math.PI) / 2,
							endAngle: (9 * Math.PI) / 4,
							x: xscale(
								Math.SQRT1_2 * (R + skirt.hemAllowance) +
									Math.sqrt(4 * (R + skirt.hemAllowance) ** 2 - f ** 2)
							),
							y: xscale(skirt.seamAllowance)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI / 2,
							endAngle: (5 * Math.PI) / 4,
							x: xscale(Math.SQRT1_2 * (R + skirt.hemAllowance)),
							y: xscale(skirt.fabricWidth - skirt.seamAllowance)
						}
					];
				}
			}
		},
		{
			name: 'Three Quarter circle, layout on cross grain',

			layoutGenerator: function (skirt) {
				const r = (2 * skirt.waistMeasurement) / (3 * Math.PI);
				const R = skirt.skirtLength + r;

				skirt.r = r;
				skirt.R = R;

				//      s=Math.sin(Math.PI/8)
				let s = 0.3826834323650898;
				//      c=Math.cos(Math.PI/8)
				let c = 0.9238795325112867;
				let f =
					skirt.fabricWidth - 2 * (skirt.seamAllowance * c) + 2 * (r - skirt.seamAllowance) * s; //effective fabric width

				let x_offset =
					2 * (R + skirt.hemAllowance) <= f
						? 0
						: Math.sqrt(4 * (R + skirt.hemAllowance) ** 2 - f ** 2);

				if (2 * (R + skirt.hemAllowance) <= skirt.fabricWidth - 2 * skirt.seamAllowance) {
					// one piece
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: Math.PI / 2,
							endAngle: 2 * Math.PI,
							x: xscale(R + skirt.hemAllowance),
							y: xscale(R + skirt.hemAllowance)
						}
					];
				} else {
					//2 pieces
					return [
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (13 * Math.PI) / 8,
							endAngle: (19 * Math.PI) / 8,
							x: xscale(c * (R + skirt.hemAllowance) + s * skirt.seamAllowance),
							y: xscale(-1 * (r - skirt.seamAllowance) * s + skirt.seamAllowance * c)
						},
						{
							...basePiece,
							seamAllowance: xscale(skirt.seamAllowance),
							hemAllowance: xscale(skirt.hemAllowance),
							innerRadius: xscale(r),
							outerRadius: xscale(R),
							startAngle: (5 * Math.PI) / 8,
							endAngle: (11 * Math.PI) / 8,
							//            x:scale(c*(R+skirt.hemAllowance)+ x_offset),
							x: xscale(c * (R + skirt.hemAllowance) + s * skirt.seamAllowance + x_offset),
							y: xscale(skirt.fabricWidth + (r - skirt.seamAllowance) * s - skirt.seamAllowance * c)
						}
					];
				}
			}
		}
	];

	let skirt = {
		name: 'skirt',
		type: types[0],
		waistMeasurement: 80,
		skirtLength: 50,
		seamAllowance: 1.5,
		hemAllowance: 1.5,
		fabricWidth: 112
	};

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
      <g class = pieces transform={`translate(${offset},${yscale(skirt.fabricWidth)+offset})`}>
        {#each skirt.type.layoutGenerator(skirt) as piece}
        <g transform={`translate(${piece.x},${-1*piece.y})`}>
          {console.log(piece)}
          <path class=main d={piece.path()}/>
          {#each piece.csa() as csa}
            <path class=csa d={csa.path}/>
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
