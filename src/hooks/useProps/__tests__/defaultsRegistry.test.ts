import { getDefaultProps, resetComponentDefaults, setDefaultProps } from '../defaultsRegistry'

describe('component defaults registry', () => {
	const originalNodeEnv = process.env.NODE_ENV

	afterEach(() => {
		resetComponentDefaults()
		Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true })
	})

	describe('resolve', () => {
		it('returns an empty object for a name that was never registered', () => {
			expect(getDefaultProps('Registry.NeverRegistered')).toEqual({})
		})

		it('returns the registered defaults for a known name', () => {
			setDefaultProps('Registry.Known', { size: 'sm', variant: 'solid' })

			expect(getDefaultProps('Registry.Known')).toEqual({ size: 'sm', variant: 'solid' })
		})
	})

	describe('register', () => {
		it('no-ops (does not warn) when re-registering shallow-equal defaults', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

			setDefaultProps('Registry.Redundant', { size: 'sm' })
			setDefaultProps('Registry.Redundant', { size: 'sm' })

			expect(warnSpy).not.toHaveBeenCalled()
			expect(getDefaultProps('Registry.Redundant')).toEqual({ size: 'sm' })

			warnSpy.mockRestore()
		})

		it('warns in non-production when overwriting an existing name with different values', () => {
			Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true })
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

			setDefaultProps('Registry.Overwritten', { size: 'sm' })
			setDefaultProps('Registry.Overwritten', { size: 'lg' })

			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy.mock.calls[0][0]).toContain('Registry.Overwritten')
			expect(getDefaultProps('Registry.Overwritten')).toEqual({ size: 'lg' })

			warnSpy.mockRestore()
		})

		it('does not warn in production even when overwriting with different values', () => {
			Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true })
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

			setDefaultProps('Registry.OverwrittenProd', { size: 'sm' })
			setDefaultProps('Registry.OverwrittenProd', { size: 'lg' })

			expect(warnSpy).not.toHaveBeenCalled()
			expect(getDefaultProps('Registry.OverwrittenProd')).toEqual({ size: 'lg' })

			warnSpy.mockRestore()
		})

		it('still overwrites the stored value even on the redundant-registration path\'s sibling: different key sets', () => {
			// Same key count would need identical keys to be shallow-equal;
			// a different key set is never redundant even with overlapping values.
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

			setDefaultProps('Registry.DifferentKeys', { size: 'sm' })
			setDefaultProps('Registry.DifferentKeys', { size: 'sm', variant: 'solid' })

			expect(getDefaultProps('Registry.DifferentKeys')).toEqual({ size: 'sm', variant: 'solid' })

			warnSpy.mockRestore()
		})
	})

	describe('reset', () => {
		it('deletes only the named entry when a name is given', () => {
			setDefaultProps('Registry.ToDelete', { size: 'sm' })
			setDefaultProps('Registry.ToKeep', { size: 'lg' })

			resetComponentDefaults('Registry.ToDelete')

			expect(getDefaultProps('Registry.ToDelete')).toEqual({})
			expect(getDefaultProps('Registry.ToKeep')).toEqual({ size: 'lg' })
		})

		it('clears every registered entry when called with no name', () => {
			setDefaultProps('Registry.A', { size: 'sm' })
			setDefaultProps('Registry.B', { size: 'lg' })

			resetComponentDefaults()

			expect(getDefaultProps('Registry.A')).toEqual({})
			expect(getDefaultProps('Registry.B')).toEqual({})
		})
	})
})
