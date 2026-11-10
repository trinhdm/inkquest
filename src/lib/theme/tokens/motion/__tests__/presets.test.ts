import { getTransitionPresetTokens } from '../presets'
import { alias } from '../../../reference'

describe('getTransitionPresetTokens', () => {
	const { box, colors } = getTransitionPresetTokens()
	const parts = (value: string) => value.split(',').map(part => part.trim())

	it('composes box from the background and border transitions', () => {
		expect(parts(box)).toEqual([alias.transition.background(), alias.transition.border()])
	})

	it('composes colors as box plus the text color transition', () => {
		expect(parts(colors)).toEqual([...parts(box), alias.transition.color()])
	})

	it('emits a valid comma-separated list with no empty segments', () => {
		for (const value of [box, colors])
			expect(parts(value).every(part => part.startsWith('var(--inkq-motion-'))).toBe(true)
	})
})
