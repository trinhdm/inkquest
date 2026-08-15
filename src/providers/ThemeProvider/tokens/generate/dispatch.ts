import { isSkippable } from './utils'
import { GENERATOR_STRATEGIES } from './strategies'
import type { GeneratorContext, TokenEntry } from './types'

const dispatch = (context: GeneratorContext): TokenEntry[] => {
	const { value } = context
	if (isSkippable(value)) return []

	const args = { ...context, value },
		strategy = GENERATOR_STRATEGIES.find(strat => strat.matches(args))

	return strategy ? strategy.run(args, dispatch) : []
}

export const dispatchGenerator = dispatch
