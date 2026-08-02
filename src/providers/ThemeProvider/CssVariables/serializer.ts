import type { ThemeTokens } from '../theme.types'

const BASE_SELECTORS = [':root', ':host'] as const

const outputCss = ({ input, hasIndent }: {
	input: Record<string, unknown>,
	hasIndent?: boolean
}) => {
	const css = Object.entries(input)
		.map(([name, value]) => {
			const declaration = `${name}: ${value};`
			return hasIndent ? `\t${declaration}` : declaration
		})
		.join(hasIndent ? '\n' : ' ')

	return hasIndent ? `\n${css}\n` : ` ${css} `
}

const outputSelectors = ({ name, selector, hasIndent }: {
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
	const cssVars = (Object.keys(tokens) as (keyof typeof tokens)[]).map(name => {
		const input = tokens[name],
			css = outputCss({ input, hasIndent }),
			selectors = outputSelectors({ name, selector, hasIndent })

		return `${selectors} {${css}}`
	}).join(`\n\n`)

	return cssVars
}
