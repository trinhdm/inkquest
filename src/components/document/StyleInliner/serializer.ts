import type { CssRule } from '@/lib/theme'

const declarationBlock = (
	variables: Record<string, unknown>,
	hasIndent: boolean
) => {
	const block = Object.entries(variables)
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
	rules.map(({ selector, vars }) => `${selector} {${declarationBlock(vars, hasIndent)}}`)
		.join(hasIndent ? '\n\n' : ' ')
