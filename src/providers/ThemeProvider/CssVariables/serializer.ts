import type { ThemeTokens } from '../theme.types'

const BASE_SELECTORS = [':root', ':host'] as const

const declarationBlock = ({ input, hasIndent }: {
	input: Record<string, unknown>,
	hasIndent?: boolean
}) => {
	const block = Object.entries(input)
		.map(([property, value]) => {
			const declaration = `${property}: ${value};`
			return hasIndent ? `\t${declaration}` : declaration
		})
		.join(hasIndent ? '\n' : ' ')

	return hasIndent ? `\n${block}\n` : ` ${block} `
}

const listSelectors = ({ name, selector, hasIndent }: {
	name: keyof ThemeTokens,
	selector?: string,
	hasIndent?: boolean
}) => {
	const selectors = !!selector ? [selector] : BASE_SELECTORS,
		attr = name === 'base' ? '' : `[data-theme="${name}"]`,
		space = hasIndent ? `\n` : ` `

	return selectors.map(s => `${s}${attr}`).join(`,${space}`)
}

export const serializeCssVars = (
	tokens: ThemeTokens,
	selector?: string,
	hasIndent: boolean = true
) => {
	const rules = (Object.keys(tokens) as (keyof typeof tokens)[]).map(name => {
		const declaration = declarationBlock({ input: tokens[name], hasIndent }),
			selectors = listSelectors({ name, selector, hasIndent })

		return `${selectors} {${declaration}}`
	}).join(`\n\n`)

	return rules
}
