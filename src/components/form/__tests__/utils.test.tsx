import {
	Calendar, Calendar1, CalendarDays,
	Clock, Eye, Globe,
	Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import { getIcon, getSharedTokens } from '../utils'
import { tokens } from '@/lib/theme/reference'
import type { SiteThemeConfig } from '@/lib/theme/types'

type InputArgs = Parameters<ReturnType<typeof getSharedTokens<'input'>>>[0]

// The callback reads theme.space and theme.el.field.padding, so use the real
// token catalog and compute expected values from the same accessors.
const theme = {
	...tokens,
	prefix: 'inkq',
	prefixSelector: (name: string) => `.inkq-${name}`,
} as unknown as SiteThemeConfig

const iconSpace = theme.space('icon')
const iconSize = 'var(--field-icon-size)'
const fallbackBlock = 'var(--field-padding-block)'

// `icon` is a ReactNode, so any element works.
const iconNode = <svg data-testid="icon" />

// A Field context as `useSafeRootCtx` returns it. Only `icon` and `size` are read.
const asContext = (context: Record<string, unknown>) =>
	({ rootName: 'Field', ...context }) as unknown as NonNullable<InputArgs['context']>

const asProps = (props: Record<string, unknown>) => props as unknown as InputArgs['props']

const inputTokens = (
	props: Record<string, unknown>,
	context: InputArgs['context'] | undefined = undefined,
) => getSharedTokens('input')({ context: context as InputArgs['context'], props: asProps(props), theme })

// Splits a CSS shorthand on top-level spaces only, so `calc(a + b)` stays whole.
const splitShorthand = (value: string) => {
	const parts: string[] = []
	let depth = 0, current = ''
	for (const char of value) {
		if (char === '(') depth++
		if (char === ')') depth--
		if (char === ' ' && depth === 0) {
			parts.push(current)
			current = ''
		} else current += char
	}
	parts.push(current)
	return parts
}

const sides = (value: string) => {
	const [top, right, bottom, left] = splitShorthand(value)
	return { top, right, bottom, left }
}

const padding = (result: ReturnType<typeof inputTokens>) => String(result.root!['--form-control-padding'])
const inset = (result: ReturnType<typeof inputTokens>) => result.icon!['--form-control-icon-inset']

// Expected values, derived exactly as the source derives them.
const expectedFor = (size?: Parameters<typeof theme.el.field.padding>[0]) => {
	const block = size ? theme.el.field.padding(size) : fallbackBlock
	const inline = `calc(${iconSpace} + ${block})`
	const iconPadding = `calc(calc(2 * ${inline}) + ${iconSize} - ${iconSpace})`
	return { block, inline, iconPadding }
}

describe('form/utils', () => {
	describe('getSharedTokens', () => {
		describe('context requirement', () => {
			it.each([
				['null', null],
				['undefined', undefined],
			])('returns {} when the context is %s', (_label, context) => {
				expect(inputTokens({ size: 'lg' }, context)).toEqual({})
			})

			it('returns tokens once a context exists (positive control)', () => {
				const result = inputTokens({ size: 'lg' }, asContext({}))

				expect(Object.keys(result)).toEqual(['root', 'icon'])
				expect(Object.keys(result.root!)).toEqual(['--form-control-padding'])
				expect(Object.keys(result.icon!)).toEqual(['--form-control-icon-inset'])
				expect(padding(result)).toEqual(expect.any(String))
			})
		})

		describe('size resolution', () => {
			it('lg and sm give different padding, so the size rules below are not vacuous', () => {
				expect(theme.el.field.padding('lg')).not.toBe(theme.el.field.padding('sm'))
				expect(padding(inputTokens({}, asContext({ size: 'lg' }))))
					.not.toBe(padding(inputTokens({}, asContext({ size: 'sm' }))))
			})

			it('the control\'s own size wins over the Field\'s (an exception to group-wins)', () => {
				const result = inputTokens({ size: 'sm' }, asContext({ size: 'lg' }))

				expect(padding(result)).toBe(`${expectedFor('sm').block} ${expectedFor('sm').inline}`)
				expect(padding(result)).not.toBe(padding(inputTokens({}, asContext({ size: 'lg' }))))
			})

			it('falls back to the Field\'s size when the control passes no size', () => {
				const result = inputTokens({}, asContext({ size: 'lg' }))

				expect(padding(result)).toBe(`${expectedFor('lg').block} ${expectedFor('lg').inline}`)
			})

			it('falls back to the Field\'s size when the control passes size={undefined} explicitly', () => {
				const result = inputTokens({ size: undefined }, asContext({ size: 'lg' }))

				expect(padding(result)).toBe(`${expectedFor('lg').block} ${expectedFor('lg').inline}`)
				expect(padding(result)).not.toBe(padding(inputTokens({ size: 'sm' }, asContext({ size: 'lg' }))))
			})

			it('uses the control\'s size when the context has none', () => {
				const result = inputTokens({ size: 'sm' }, asContext({}))

				expect(padding(result)).toBe(`${expectedFor('sm').block} ${expectedFor('sm').inline}`)
			})

			it('uses var(--field-padding-block) when neither sets a size', () => {
				const result = inputTokens({}, asContext({}))

				expect(padding(result)).toBe(`${fallbackBlock} calc(${iconSpace} + ${fallbackBlock})`)
				expect(padding(result)).not.toBe(padding(inputTokens({ size: 'sm' }, asContext({}))))
			})
		})

		describe('icon position and padding', () => {
			it('without an icon, padding is the two-value `block inline` form and the inset is `auto 0`', () => {
				const { block, inline } = expectedFor('lg')
				const result = inputTokens({}, asContext({ size: 'lg' }))

				expect(splitShorthand(padding(result))).toEqual([block, inline])
				expect(inset(result)).toBe('auto 0')
			})

			it('without an icon, iconPosition does not change the padding or the inset', () => {
				const base = inputTokens({}, asContext({ size: 'lg' }))

				expect(inputTokens({ iconPosition: 'right' }, asContext({ size: 'lg' }))).toEqual(base)
				expect(inputTokens({ iconPosition: 'left' }, asContext({ size: 'lg' }))).toEqual(base)
			})

			it('an icon with no iconPosition is treated as left: extra padding on the LEFT, inset `0 auto`', () => {
				const { block, inline, iconPadding } = expectedFor('lg')
				const result = inputTokens({}, asContext({ icon: iconNode, size: 'lg' }))

				expect(sides(padding(result))).toEqual({
					top: block, right: inline, bottom: block, left: iconPadding,
				})
				expect(inset(result)).toBe('0 auto')
			})

			it('iconPosition="left" matches the default', () => {
				const context = asContext({ icon: iconNode, size: 'lg' })

				expect(inputTokens({ iconPosition: 'left' }, context)).toEqual(inputTokens({}, context))
			})

			it('iconPosition="right" puts the extra padding on the RIGHT, with inset `auto 0`', () => {
				const { block, inline, iconPadding } = expectedFor('lg')
				const result = inputTokens({ iconPosition: 'right' }, asContext({ icon: iconNode, size: 'lg' }))

				expect(sides(padding(result))).toEqual({
					top: block, right: iconPadding, bottom: block, left: inline,
				})
				expect(inset(result)).toBe('auto 0')
			})

			it('left and right differ in which side carries the icon padding, and in the inset', () => {
				const context = asContext({ icon: iconNode, size: 'lg' })
				const left = inputTokens({ iconPosition: 'left' }, context)
				const right = inputTokens({ iconPosition: 'right' }, context)

				expect(sides(padding(left)).left).toBe(sides(padding(right)).right)
				expect(sides(padding(left)).right).toBe(sides(padding(right)).left)
				expect(sides(padding(left)).left).not.toBe(sides(padding(left)).right)
				expect(inset(left)).not.toBe(inset(right))
			})

			it('applies the icon padding on top of the size-derived padding, using the control\'s size when the Field has none', () => {
				const { block, inline, iconPadding } = expectedFor('sm')
				const result = inputTokens({ iconPosition: 'right', size: 'sm' }, asContext({ icon: iconNode }))

				expect(sides(padding(result))).toEqual({
					top: block, right: iconPadding, bottom: block, left: inline,
				})
			})
		})

		describe('names', () => {
			const props = { iconPosition: 'right', size: 'sm' }
			const context = asContext({ icon: iconNode, size: 'lg' })

			it('behaves like "input" when called with no argument', () => {
				const result = getSharedTokens()({ context, props: asProps(props), theme })

				expect(result).toEqual(inputTokens(props, context))
				expect(result.root).toBeDefined()
				expect(getSharedTokens()({ context: null, props: asProps(props), theme })).toEqual({})
			})

			it.each(['choice', 'textarea'] as const)('"%s" gives the same tokens as "input" for the same args', name => {
				const result = getSharedTokens(name)({
					context: context as never,
					props: asProps(props) as never,
					theme,
				})

				expect(result).toEqual(inputTokens(props, context))
				expect(result.root).toBeDefined()
			})
		})
	})

	describe('getIcon', () => {
		it.each([
			['color', Pipette],
			['date', Calendar],
			['email', Mail],
			['file', Paperclip],
			['month', Calendar1],
			['number', Hash],
			['password', Eye],
			['search', Search],
			['tel', Phone],
			['time', Clock],
			['url', Globe],
			['week', CalendarDays],
		])('maps type="%s" to its lucide icon element', (type, component) => {
			const icon = getIcon(type)

			expect(icon).not.toBeNull()
			expect(icon!.type).toBe(component)
		})

		it.each([
			['undefined', undefined],
			['text', 'text'],
			['an unmapped type', 'checkbox'],
		])('returns null for %s', (_label, type) => {
			expect(getIcon(type)).toBeNull()
		})
	})
})
