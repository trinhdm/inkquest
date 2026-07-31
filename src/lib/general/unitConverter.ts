import type { Unit } from '@/types/shared'

const pxUnitConverter = <const U extends Unit>(unit: U) => {
	type UnitNum<T extends U = U> = `${number}${T}`

	const calculate = (px: number): UnitNum<U> => {
		const computed = getComputedStyle(document.documentElement),
			rootFontSize = parseFloat(computed.fontSize)

		return `${px / rootFontSize}${unit}` as UnitNum<U>
	}

	// const convert = (value: N | string): UnitNum<U> =>
	function convert(value: number): UnitNum<U>
	function convert(value: string): string
	function convert(value: number | string): UnitNum | string {
		const none = `0${unit}` as UnitNum<U>
		let temp = undefined

		if (value === 0 || value === '0')
			return none

		switch (typeof value) {
			case 'number':
				return calculate(value)
			case 'string':
				if (value === '') return none

				temp = value.replace('px', '')
				temp = parseFloat(temp)

				if (!Number.isNaN(Number(temp)))
					return calculate(temp)

				break
		}

		return value as string
	}

	return convert
}

export const em = pxUnitConverter('em')
export const rem = pxUnitConverter('rem')
