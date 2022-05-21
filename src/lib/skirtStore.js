import { readable, writable, derived } from 'svelte/store';
import { types } from '$lib/skirt_types';
import { scaleLinear } from 'd3-scale';

let defaultSkirt = {
	type: 0,
	waistMeasurement: 80,
	skirtLength: 50,
	seamAllowance: 1.5,
	hemAllowance: 1.5,
	fabricWidth: 112
};

const defaultScale = scaleLinear().domain([0, 1]).range([0, 3]);

export function newSkirt(_skirt = defaultSkirt, _scale = defaultScale) {
	const _pieces = ([skirt, xscale]) => {
		return types[skirt.type].layoutGenerator(skirt, xscale);
	};

	const skirt = writable(_skirt);
	const scale = writable(_scale);

	const pieces = derived([skirt, scale], _pieces);

	return { skirt, pieces };
}
