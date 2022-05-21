let basePiece = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	pieceRotaton: 0
};

const validSkirt = (skirt) => {
	const { type, waistMeasurement, skirtLength, seamAllowance, hemAllowance, fabricWidth } = skirt;
	if (type < 0 || type > types.length - 1) return false;
	if (waistMeasurement < 1) return false;
	if (skirtLength < 1) return false;
	if (seamAllowance < 0.01) return false;
	if (hemAllowance < 0.01) return false;
	if (fabricWidth < 1) return false;
	return true;
};

export let types = [
	// {
	// 	name: 'test piece',
	// 	layoutGenerator: function (skirt, xscale) {
	// 		if (!validSkirt(skirt)) return [];
	// 		const r = skirt.waistMeasurement / Math.PI;
	// 		const R = skirt.skirtLength + r;
	// 		skirt.r = r;
	// 		skirt.R = R;
	// 		return [
	// 			{
	// 				...basePiece,
	// 				seamAllowance: xscale(skirt.seamAllowance),
	// 				hemAllowance: xscale(skirt.hemAllowance),
	// 				innerRadius: xscale(r),
	// 				outerRadius: xscale(R),
	// 				endAngle: Math.PI / 2,
	// 				startAngle: 0,
	// 				x: xscale(skirt.fabricWidth / 4),
	// 				y: xscale(skirt.fabricWidth / 4)
	// 			}
	// 		];
	// 	}
	// },
	{
		name: 'Half circle',
		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
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

		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
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
		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
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
		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
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

		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
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

		layoutGenerator: function (skirt, xscale) {
			if (!validSkirt(skirt)) return [];
			const r = (2 * skirt.waistMeasurement) / (3 * Math.PI);
			const R = skirt.skirtLength + r;

			skirt.r = r;
			skirt.R = R;

			//      s=Math.sin(Math.PI/8)
			let s = 0.3826834323650898;
			//      c=Math.cos(Math.PI/8)
			let c = 0.9238795325112867;
			let f = skirt.fabricWidth - 2 * (skirt.seamAllowance * c) + 2 * (r - skirt.seamAllowance) * s; //effective fabric width

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
