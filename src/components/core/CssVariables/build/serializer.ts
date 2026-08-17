import { SCHEME_STORAGE_KEY } from '../../ScriptInjector'
import type { ThemeTokens } from '@/lib/theme'
import type { VariantScheme } from '@/lib/theme/buildVariantSchemes'

const BASE_SELECTORS = [':root'] as const

interface DeclarationBlockArgs
	extends Pick<SerializeArgs, 'hasIndent'> {
	input: Record<string, unknown>
}

const declarationBlock = ({ input, hasIndent }: DeclarationBlockArgs) => {
	const block = Object.entries(input)
		.map(([property, value]) => {
			const declaration = `${property}: ${value};`
			return hasIndent ? `\t${declaration}` : declaration
		})
		.join(hasIndent ? '\n' : ' ')

	return hasIndent ? `\n${block}\n` : ` ${block} `
}

interface ListSelectorsArgs
	extends Omit<SerializeArgs, 'tokens'> {
	name: keyof SerializeArgs['tokens']
}

const listSelectors = ({
	hasIndent,
	lsKey,
	name,
	selector,
}: ListSelectorsArgs) => {
	const selectors = !!selector ? [selector] : BASE_SELECTORS,
		attr = name === 'base' ? '' : `[data-${lsKey}="${name}"]`,
		space = hasIndent ? `\n` : ` `

	return selectors.map(s => `${s}${attr}`).join(`,${space}`)
}

interface SerializeArgs {
	hasIndent?: boolean
	lsKey?: string
	selector?: string
	tokens: ThemeTokens
}

export const serializeCssVars = ({
	hasIndent = true,
	lsKey = SCHEME_STORAGE_KEY,
	selector,
	tokens,
}: SerializeArgs) => {
	const tokenList = Object.keys(tokens) as (keyof typeof tokens)[]
	const rules = tokenList.map(name => {
		const input = tokens[name]
		if (!Object.keys(input).length) return

		const declaration = declarationBlock({ input, hasIndent }),
			selectors = listSelectors({ name, selector, hasIndent, lsKey })

		return `${selectors} {${declaration}}`
	})
		.filter(Boolean)
		.join(`\n\n`)

	return rules
}


export const serializeVariantSchemes = (
	schemes: VariantScheme[],
	hasIndent: boolean = true
) =>
	schemes
		.filter(({ vars }) => Object.keys(vars).length)
		.map(({ selector, vars }) => `${selector} {${declarationBlock({ input: vars, hasIndent })}}`)
		.join(hasIndent ? '\n\n' : ' ')
