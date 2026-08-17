import { SCHEME_STORAGE_KEY } from '../ScriptInjector'
import type { CssRule, ThemeTokens } from '@/lib/theme'

const BASE_SELECTORS = ':root, :host'

export const standardizeRules = (
	tokens: ThemeTokens,
	lsKey = SCHEME_STORAGE_KEY
): CssRule[] =>
	(Object.keys(tokens) as (keyof ThemeTokens)[])
		.filter(name => Object.keys(tokens[name]).length)
		.map(name => ({
			selector: name === 'base' ? BASE_SELECTORS : `[data-${lsKey}="${name}"]`,
			vars: tokens[name],
		}))

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

export const serializeStyles = (
	rules: CssRule[],
	hasIndent: boolean = true
) =>
	rules
		.filter(({ vars }) => Object.keys(vars).length)
		.map(({ selector, vars }) => `${selector} {${declarationBlock({ input: vars, hasIndent })}}`)
		.join(hasIndent ? '\n\n' : ' ')
