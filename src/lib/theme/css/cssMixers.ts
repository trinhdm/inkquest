
export const colorMix = (mixColor: string, percent: number, withColor: string): string =>
	`color-mix(in oklab, ${mixColor} ${percent}%, ${withColor})`


type LCHValues<T extends 'l' | 'c' | 'h'> =
	| `${number}${T extends 'h' ? 'deg' : '%'}`
	| `${T}`
	| number
	| 'none'

type AsLCH<T extends 'l' | 'c' | 'h'> =
	T extends 'l' ? LCHValues<'l'>
		: T extends 'c' ? LCHValues<'c'>
			: T extends 'h' ? LCHValues<'h'>
				: never

type ToOKLCHValue =
	`${AsLCH<'l'>} ${AsLCH<'c'>} ${AsLCH<'h'>}`

type ToOKLCHString =
	| `oklch(${ToOKLCHValue})`
	| `oklch(${ToOKLCHValue} / ${number})`
	| `oklch(${number} / ${ToOKLCHValue})`

export interface ToOKLCHArgs {
	l?: AsLCH<'l'>
	c?: AsLCH<'c'>
	h?: AsLCH<'h'>
	alpha?: number
}

export const toOklch = (
	{ l = 'l', c = 'c', h = 'h', alpha }: ToOKLCHArgs
): ToOKLCHString => {
	const alphaPart = alpha !== undefined ? ` / ${alpha}` as const : ''
	return `oklch(${l} ${c} ${h}${alphaPart})`
}


type LCHCalc<T extends 'l' | 'c' | 'h'> =
	| `calc(${T} + ${number})`

type AsCalcLCH<T extends 'l' | 'c' | 'h'> =
	T extends 'l' ? LCHCalc<'l'>
		: T extends 'c' ? LCHCalc<'c'>
			: T extends 'h' ? LCHCalc<'h'>
				: never

type FromOKLCHValue =
	`${AsCalcLCH<'l'>} ${AsCalcLCH<'c'>} ${AsCalcLCH<'h'>}`

export type FromOKLCHString =
	| `oklch(from ${string} ${FromOKLCHValue})`
	| `oklch(from ${string} ${FromOKLCHValue} / ${number})`
	| `oklch(from ${string} ${number} / ${FromOKLCHValue})`

export interface FromOKLCHArgs {
	l?: number
	c?: number
	h?: number
	alpha?: number
}

export const fromOklch = (
	color: string,
	{ l = 0, c = 0, h = 0, alpha }: FromOKLCHArgs
): FromOKLCHString => {
	const alphaPart = alpha !== undefined ? ` / ${alpha}` as const : ''
	return `oklch(from ${color} calc(l + ${l}) calc(c + ${c}) calc(h + ${h})${alphaPart})`
}


type ExtractUnit<T extends string> =
	T extends `${infer N extends number}${infer U}`
		? U extends "" ? never : U
		: never

type OKLCHArgs =
	| FromOKLCHArgs
	// | ToOKLCHArgs

export const scaleLCH = (lch: OKLCHArgs, factor: number) =>
	(Object.keys(lch) as (keyof OKLCHArgs)[]).reduce<OKLCHArgs>((acc, key) => {
		const value = lch[key]
		let total: OKLCHArgs[typeof key]

		if (typeof value === 'number') {
			total = (factor * value) as FromOKLCHArgs[typeof key]
			acc[key] = total
		}

		return acc

		// if (typeof value === 'string') {
		// 	const num = parseFloat(value),
		// 		unit = value.replace(/[\d.-]/g, '') as ExtractUnit<typeof value>

		// 	if (Number.isNaN(num))
		// 		total = num

		// 	if (!Number.isNaN(num)) {
		// 		total = factor * num
		// 		// if (unit) total = `${total}${unit}` as ToOKLCHArgs[typeof key]
		// 	}
		// }
	}, {})
