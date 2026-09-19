import { render } from '@testing-library/react'
import { buildScript } from './buildScript'
import { ScriptInjector } from './ScriptInjector'

describe('ScriptInjector', () => {
	it('marks the injected script with data-scheme-script so it can be located post-hydration', () => {
		const { container } = render(<ScriptInjector />)
		const script = container.querySelector('script')

		expect(script).toHaveAttribute('data-scheme-script')
	})

	it('injects the exact string produced by buildScript for the given scheme', () => {
		const { container } = render(<ScriptInjector scheme="light" />)
		const script = container.querySelector('script')

		expect(script?.innerHTML).toBe(buildScript({ scheme: 'light' }))
	})

	it('falls back to the default color scheme when scheme is omitted', () => {
		const { container } = render(<ScriptInjector />)
		const script = container.querySelector('script')

		expect(script?.innerHTML).toBe(buildScript({ scheme: undefined }))
	})

	it('forwards arbitrary script props (e.g. nonce) onto the rendered element', () => {
		const { container } = render(<ScriptInjector nonce="abc123" />)
		const script = container.querySelector('script')

		expect(script).toHaveAttribute('nonce', 'abc123')
	})
})
