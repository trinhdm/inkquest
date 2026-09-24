import { resolveProps } from './resolveProps'
import type { AttrSource } from './buildAttributes'

type WithId = AttrSource & { id: string }

describe('resolveProps', () => {
	it('passes props straight through unchanged when there is no "attributes" key at all', () => {
		expect(resolveProps({ id: 'x' } as WithId)).toEqual({ id: 'x' })
	})

	it('drops an explicit but falsy "attributes" value, rather than spreading undefined onto the result', () => {
		expect(resolveProps({ attributes: undefined, id: 'x' } as WithId)).toEqual({ id: 'x' })
	})

	it('adds no extra keys when "attributes" is an empty object', () => {
		expect(resolveProps({ attributes: {}, id: 'x' } as WithId)).toEqual({ id: 'x' })
	})

	it('flattens computed attributes (aria-*/data-*, and any native attribute like type) onto the top-level result, replacing the nested "attributes" key', () => {
		const result = resolveProps({
			as: 'button',
			attributes: { data: { variant: 'solid' } },
			id: 'x',
		} as WithId)

		expect(result).toEqual({
			as: 'button',
			id: 'x',
			'data-variant': 'solid',
			type: 'button',
		})
		expect(result).not.toHaveProperty('attributes')
	})

	describe('precedence: a computed attribute beats a same-named prop', () => {
		it('lets a computed native disabled win over an explicit disabled={false}', () => {
			// `attributes.data.disabled` on a disableable tag computes
			// `disabled: true`; the raw `disabled` prop must not override it.
			const result = resolveProps({
				as: 'button',
				attributes: { data: { disabled: true } },
				disabled: false,
			} as AttrSource & { disabled: boolean })

			expect(result).toHaveProperty('disabled', true)
		})

		it('lets a computed aria-* win over a directly-passed aria attribute', () => {
			const result = resolveProps({
				attributes: { aria: { label: 'from attributes' } },
				'aria-label': 'from props',
			} as AttrSource & { 'aria-label': string })

			expect(result).toHaveProperty('aria-label', 'from attributes')
		})

		it('still preserves an explicit type, which buildAttributes declines to compute', () => {
			// `getNativeAttrs` only injects `type` when the prop is absent
			// (`Object.hasOwn`), so there is no computed value to win here.
			const result = resolveProps({
				as: 'button',
				attributes: { data: { variant: 'solid' } },
				type: 'submit',
			} as AttrSource & { type: string })

			expect(result).toHaveProperty('type', 'submit')
		})
	})
})
