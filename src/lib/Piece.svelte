<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { arc } from 'd3-shape';
	export let x = 0;
	export let y = 0;
	export let dx = 0;
	export let dy = 0;
	export let pieceRotation = 0;
	export let seamAllowance = 1;
	export let hemAllowance = 1;
	export let startAngle = 0;
	export let endAngle = 1;
	export let innerRadius = 0;
	export let outerRadius = 1;

	const dispatch = createEventDispatcher();
	
	let path = (pieceRotation) =>
		arc()({
			innerRadius,
			outerRadius,
			startAngle: startAngle + pieceRotation,
			endAngle: endAngle + pieceRotation
		});

	const centroid = () =>
		arc().centroid({
			innerRadius,
			outerRadius,
			startAngle: startAngle + pieceRotation,
			endAngle: endAngle + pieceRotation
		});

	let csa = function (pieceRotation) {
		//curved seam/hem allowances (top and bottom)
		let waist = arc()({
			innerRadius: innerRadius - seamAllowance,
			outerRadius: innerRadius,
			startAngle: startAngle + pieceRotation,
			endAngle: endAngle + pieceRotation
		});
		let hem = arc()({
			innerRadius: outerRadius,
			outerRadius: outerRadius + hemAllowance,
			startAngle: startAngle + pieceRotation,
			endAngle: endAngle + pieceRotation
		});

		return [
			{ name: 'waist', path: waist },
			{ name: 'hem', path: hem }
		];
	};
	let ssa = function (pieceRotation) {
		//straight seam allowances (sides)
		let height = seamAllowance + hemAllowance + outerRadius - innerRadius;
		let width = seamAllowance;

		let x1 = (innerRadius - seamAllowance) * Math.sin(startAngle + pieceRotation);
		let y1 = (innerRadius - seamAllowance) * -1 * Math.cos(startAngle + pieceRotation);

		let transform1 =
			'translate(' +
			x1 +
			',' +
			y1 +
			') rotate(' +
			(180 * (startAngle + pieceRotation - Math.PI)) / Math.PI +
			')';

		let x2 =
			(innerRadius - seamAllowance) * Math.sin(endAngle + pieceRotation) +
			seamAllowance * Math.cos(endAngle + pieceRotation);
		let y2 =
			(innerRadius - seamAllowance) * -1 * Math.cos(endAngle + pieceRotation) +
			seamAllowance * Math.sin(endAngle + pieceRotation);

		let transform2 =
			'translate(' +
			x2 +
			',' +
			y2 +
			') rotate(' +
			(180 * (endAngle + pieceRotation - Math.PI)) / Math.PI +
			')';

		return [
			{ name: 'start', height: height, width: width, transform: transform1 },
			{ name: 'end', height: height, width: width, transform: transform2 }
		];
	};

	let oldCentroid = centroid();
	let newCentroid = [0, 0];

	let mouseHasMoved = false;

	const piece_rotate = async () => {
		if (!mouseHasMoved) {
			oldCentroid = centroid();
			pieceRotation = pieceRotation + Math.PI / 4;
			newCentroid = centroid();
			const _dx = oldCentroid[0] - newCentroid[0];
			const _dy = oldCentroid[1] - newCentroid[1];
			dx = dx + _dx;
			dy = dy + _dy;
			dispatch('change', {});
		}
		mouseHasMoved = false;
	};

	let dragging = false;

	const dragstart = () => {
		mouseHasMoved = false;
		dragging = true;
	};
	const dragend = () => {
		dragging = false;
	};

	const drag = (e) => {
		if (dragging) {
			mouseHasMoved = true;
			dx = dx + e.movementX;
			dy = dy + e.movementY;
			dispatch('change', {});
		}
	};

	const piece_transform = (x, dx, y, dy) => {
		return `translate(${x + dx},${-1 * y + dy})`;
	};

	onMount(() => {
		dispatch('change', {});
	});
</script>

<g transform={piece_transform(x, dx, y, dy)}>
	<path
		class="main"
		d={path(pieceRotation)}
		on:mousedown={dragstart}
		on:mouseup={dragend}
		on:mouseleave={dragend}
		on:mousemove={drag}
		on:click={piece_rotate}
	/>
	{#each csa(pieceRotation) as csa}
		<path class="csa" d={csa.path} />
	{/each}
	{#each ssa(pieceRotation) as { height, width, transform }}
		<rect class="ssa" {height} {width} {transform} />
	{/each}
</g>

<style lang="scss">
	.main {
		stroke: none;
		fill: hotpink;
		fill-opacity: 0.5;
	}
	.csa,
	.ssa {
		stroke: none;
		fill: teal;
		fill-opacity: 0.5;
	}
</style>
