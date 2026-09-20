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
})
