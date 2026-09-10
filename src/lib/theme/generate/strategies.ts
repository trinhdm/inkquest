import { formatToken, getShorthand } from '../format'
import { hasShorthandMatch, labelStep, toEntry, validate } from './utils'
import { isObject } from '@/utils/helpers'
import { rem } from '@/lib/general'
import type { GeneratorStrategy } from './types'

const primitiveStrategy: GeneratorStrategy<string> = {
	matches: () => true,
	run: (args) => toEntry({ name: formatToken(args), value: args.value }),
}

const hexCodeStrategy: GeneratorStrategy<string> = {
	matches: ({ value }) => validate().hex(value),
	run: ({ path, value }) => toEntry({
		name: formatToken({ path: [...path, labelStep(0, value)] }),
		value,
	})
}

const nestedObjectStrategy: GeneratorStrategy<Record<string, unknown>> = {
	matches: ({ value }) => isObject(value),
	run: ({ path, prefix, value }, generate) =>
		Object.entries(value).flatMap(([k, v]) =>
			generate({ value: v, path: [...path, k], prefix }))
}

const shorthandStrategy: GeneratorStrategy<Record<string, unknown>> = {
	matches: ({ value }) => hasShorthandMatch(value),
	run: (args) => {
		const { value } = args,
			is = validate().shorthand,
			[property] = (Object.keys(is) as (keyof typeof is)[]).filter(ck => is[ck](value))

		const name = formatToken(args),
			shorthand = getShorthand({ property, values: [value] })

		return toEntry({ name, value: shorthand })
	}
}

const numericArrayStrategy: GeneratorStrategy<number[]> = {
	matches: ({ value }) => Array.isArray(value) && value.every(v => typeof v === 'number'),
	run: ({ path, prefix, value }) => {
		const is = validate().numeric

		return value.flatMap((v, i) => {
			let output: `${number}rem` | number = v,
				step = labelStep(i, v)

			if (path[0].toLowerCase().includes('size')) {
				step = `${v}`
				output = rem(v)
			} else if (is.percent(v)) {
				const label = is.integer(v) ? v : 100 * v
				step = `${label}`
			} else if (is.weight(v)) {
				step = `${v}`
			} else {
				output = rem(v)
			}

			const pathname = [...path, step],
				name = formatToken({ path: pathname, prefix, value: output })

			return toEntry({ name, value: output })
		})
	}
}

const textArrayStrategy: GeneratorStrategy<string[]> = {
	matches: ({ value }) => Array.isArray(value) && value.every(v => typeof v === 'string'),
	run: ({ path, prefix, value }) => (
		value.flatMap((v, i) => {
			const pathname = [...path, labelStep(i, v)],
				name = formatToken({ path: pathname, prefix, value: v })

			return toEntry({ name, value: v })
		})
	)
}

const scaleStrategy: GeneratorStrategy<number> = {
	matches: ({ path, value }) => path[0] === 'scale' && typeof value === 'number',
	run: ({ path, prefix, value }) => {
		const pathname = path.slice(1)
		const steps = Array.from({ length: 16 }, (_, i) => {
			const j = i + 1

			if (j <= 10) return j
			else if (j <= 15) return 10 + (j - 10) * 2
			return 20 + (j - 15) * 4
		})

		return steps.flatMap((v, i) => {
			const step = v * value,
				output = rem(step),
				name = formatToken({ path: [...pathname, `${i + 1}`], prefix, value: output })

			return toEntry({ name, value: output })
		})
	}
}

export const GENERATOR_STRATEGIES: GeneratorStrategy[] = [
	scaleStrategy,
	numericArrayStrategy,
	textArrayStrategy,
	shorthandStrategy,
	nestedObjectStrategy,
	hexCodeStrategy,
	primitiveStrategy,
]
