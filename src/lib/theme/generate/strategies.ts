import { formatToken, getShorthand } from '../format'
import { isFontShorthandMatch, labelStep, toEntry, validate } from './utils'
import { isObject } from '@/utils/helpers'
import { rem } from '@/lib/general'
import type { GeneratorStrategy } from './types'

const primitiveStrategy: GeneratorStrategy<string> = {
	matches: () => true,
	run: (args) => toEntry({ name: formatToken(args), value: args.value }),
}

const nestedObjectStrategy: GeneratorStrategy<Record<string, unknown>> = {
	matches: ({ value }) => isObject(value),
	run: ({ path, prefix, value }, generate) =>
		Object.entries(value).flatMap(([k, v]) =>
			generate({ value: v, path: [...path, k], prefix }))
}

const shorthandStrategy: GeneratorStrategy<Record<string, unknown>> = {
	matches: ({ value }) => isFontShorthandMatch(value),
	run: (args) => {
		const { value } = args
		const name = formatToken(args),
			shorthand = getShorthand({ property: 'font', values: [value] })

		return toEntry({ name, value: shorthand })
	}
}

const arrayStrategy: GeneratorStrategy<unknown[]> = {
	matches: ({ value }) => Array.isArray(value),
	run: ({ path, prefix, value }) => {
		const is = validate()

		return value.flatMap((v, i) => {
			let output = v,
				step = labelStep(i, v)

			if (typeof v === 'number') {
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
			}

			const pathname = [...path, step],
				name = formatToken({ path: pathname, prefix, value: output })

			return toEntry({ name, value: output })
		})
	}
}

const scaleStrategy: GeneratorStrategy<number> = {
	matches: ({ path, value }) => path[0] === 'scale' && typeof value === 'number',
	run: ({ path, prefix, value }) => {
		const steps = Array.from({ length: 12 }, (_, i) => i + 1)
		const pathname = path.slice(1)

		return steps.flatMap(v => {
			const step = v * value,
				output = rem(step)
			const name = formatToken({ path: [...pathname, `${step}`], prefix, value: output })
			return toEntry({ name, value: output })
		})
	}
}

export const GENERATOR_STRATEGIES: GeneratorStrategy[] = [
	scaleStrategy,
	arrayStrategy,
	shorthandStrategy,
	nestedObjectStrategy,
	primitiveStrategy,
]
