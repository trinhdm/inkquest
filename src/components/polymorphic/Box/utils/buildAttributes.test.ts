import { buildAttributes, type AttrSource } from './buildAttributes'

describe('buildAttributes', () => {
	describe('type="button" injection', () => {
		it('injects type="button" when as is "button" and the caller does not already own a "type" key', () => {
			expect(buildAttributes({ as: 'button' })).toEqual({ type: 'button' })
		})

		it('does not inject type when the caller already owns a "type" key, regardless of its value', () => {
			const props = { as: 'button', type: 'reset' } as AttrSource & { type: string }
			expect(buildAttributes(props)).toEqual({})
		})

		it('does not inject type for a non-button tag', () => {
			expect(buildAttributes({ as: 'a' })).toEqual({})
		})
	})

	describe('native disabled — DISABLEABLE_TAGS gate', () => {
		it('sets native disabled when data.disabled is true and the tag is disableable', () => {
			const result = buildAttributes({
				as: 'button',
				attributes: { data: { disabled: true } },
			})
			expect(result).toMatchObject({ disabled: true, type: 'button' })
		})

		it('does not set native disabled when the tag is not disableable, even with data.disabled true', () => {
			const result = buildAttributes({
				as: 'a',
				attributes: { data: { disabled: true } },
			})
			expect(result).not.toHaveProperty('disabled')
			expect(result).toHaveProperty('data-disabled', '')
		})

		it('does not set native disabled when data.disabled is false', () => {
			const result = buildAttributes({
				as: 'button',
				attributes: { data: { disabled: false } },
			})
			expect(result).not.toHaveProperty('disabled')
		})
	})

	describe('unstyled filtering (STATE_KEYS)', () => {
		it('keeps all data attributes when unstyled is not set', () => {
			const result = buildAttributes({
				attributes: { data: { variant: 'solid', loading: true } },
			})
			expect(result).toEqual({ 'data-variant': 'solid', 'data-loading': '' })
		})

		it('drops non-state keys but keeps state keys when unstyled', () => {
			const result = buildAttributes({
				unstyled: true,
				attributes: { data: { variant: 'solid', loading: true } },
			})
			expect(result).toEqual({ 'data-loading': '' })
		})

		it('drops "disabled" from data even though it is itself a STATE_KEY, when unstyled AND the tag is disableable — native disabled already conveys it', () => {
			const result = buildAttributes({
				as: 'button',
				unstyled: true,
				attributes: { data: { disabled: true } },
			})
			expect(result).toEqual({ type: 'button', disabled: true })
		})

		it('keeps "disabled" in data when unstyled but the tag is NOT disableable — no native duplicate to defer to', () => {
			const result = buildAttributes({
				as: 'a',
				unstyled: true,
				attributes: { data: { disabled: true } },
			})
			expect(result).toEqual({ 'data-disabled': '' })
		})

		it('produces no data attributes at all when there is no data bag to begin with', () => {
			expect(buildAttributes({ as: 'div' })).toEqual({})
		})
	})

	describe('ordering / composition of data, aria, and native attributes', () => {
		it('merges data, aria, and native attributes into a single object without either clobbering the other', () => {
			const result = buildAttributes({
				as: 'button',
				attributes: {
					data: { variant: 'solid' },
					aria: { label: 'Save' },
				},
			})

			expect(result).toEqual({
				'data-variant': 'solid',
				'aria-label': 'Save',
				type: 'button',
			})
		})
	})
})
