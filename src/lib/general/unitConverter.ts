import type { Unit } from '@/types/shared'

const pxUnitConverter = <const U extends Unit>(unit: U) => {
	type UnitNum<T extends U = U> = `${number}${T}`

	const calculate = (px: number, round?: number): UnitNum<U> => {
		let base = 16

		if (typeof window !== 'undefined') {
			const computed = getComputedStyle(document.documentElement)
			base = parseFloat(computed.fontSize)
		}

		let value = px / base

		if (typeof round === 'number') {
			const step = 1/round
			value = Math.ceil(value * step) / step
		}

		return `${value}${unit}` as UnitNum<U>
	}

	function convert(value: number, round?: number): UnitNum<U>
	function convert(value: string, round?: number): string
	function convert(value: number | string, round?: number): UnitNum | string {
		const none = `0${unit}` as UnitNum<U>
		let temp = undefined

		if (value === 0 || value === '0')
			return none

		switch (typeof value) {
			case 'number':
				return calculate(value, round)
			case 'string':
				if (value === '') return none

				temp = value.replace('px', '')
				temp = parseFloat(temp)

				if (!Number.isNaN(Number(temp)))
					return calculate(temp, round)

				break
		}

		return value as string
	}

	return convert
}

export const em = pxUnitConverter('em')
export const rem = pxUnitConverter('rem')
