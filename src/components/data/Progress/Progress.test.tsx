import { act, render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Progress } from './Progress'

//	the bar mirrors page scroll, so the document's geometry is stubbed per test
const setScroll = ({ client = 500, scroll = 1500, top = 0 } = {}) => {
	const root = document.documentElement
	Object.defineProperty(root, 'clientHeight', { configurable: true, value: client })
	Object.defineProperty(root, 'scrollHeight', { configurable: true, value: scroll })
	Object.defineProperty(root, 'scrollTop', { configurable: true, value: top })
}

const scrollTo = (top: number) => {
	setScroll({ top })
	act(() => { window.dispatchEvent(new Event('scroll')) })
}

describe('Progress', () => {
	reset('Progress')

	let raf: jest.SpyInstance, caf: jest.SpyInstance

	beforeEach(() => {
		//	run animation frames synchronously so assertions need no timers
		raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
			cb(0)
			return 1
		})
		caf = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
		setScroll()
	})

	afterEach(() => {
		raf.mockRestore()
		caf.mockRestore()
	})

	describe('defaults', () => {
		it('registers a native progress element, fixed to the top, 3px tall, full width, out of 100', () => {
			expect(getDefaultProps('Progress')).toEqual({
				anchor: 'top', as: 'progress', height: '3px',
				layout: 'fixed', max: 100, width: '100%',
			})
		})
	})

	describe('rendering', () => {
		it('renders a progress element exposed with the progressbar role', () => {
			render(<Progress label="Reading progress" />)

			const bar = screen.getByRole('progressbar')
			expect(bar.tagName).toBe('PROGRESS')
			expect(bar).toHaveAttribute('max', '100')
		})

		it('names the bar with a label tied to it by htmlFor/id', () => {
			render(<Progress label="Reading progress" />)

			const bar = screen.getByRole('progressbar', { name: 'Reading progress' })
			expect(screen.getByLabelText('Reading progress')).toBe(bar)
			expect(bar.id).toBeTruthy()
		})

		it('uses a consumer-supplied id for both the bar and the label', () => {
			render(<Progress id="page-progress" label="Reading progress" />)

			expect(screen.getByRole('progressbar')).toHaveAttribute('id', 'page-progress')
			expect(screen.getByText('Reading progress')).toHaveAttribute('for', 'page-progress')
		})

		it('gives two bars on the same page distinct ids', () => {
			render(<><Progress label="First" /><Progress label="Second" /></>)

			const [first, second] = screen.getAllByRole('progressbar')
			expect(first.id).not.toBe(second.id)
			expect(screen.getByLabelText('First')).toBe(first)
			expect(screen.getByLabelText('Second')).toBe(second)
		})

		it('forwards a custom max to the element', () => {
			render(<Progress label="Reading progress" max={ 50 } />)
			expect(screen.getByRole('progressbar')).toHaveAttribute('max', '50')
		})

		it('passes unknown attributes through to the bar', () => {
			render(<Progress data-testid="bar" label="Reading progress" />)
			expect(screen.getByTestId('bar')).toBe(screen.getByRole('progressbar'))
		})

		it('does not leak its sizing props onto the DOM element', () => {
			render(<Progress height={ 8 } label="Reading progress" width={ 200 } />)

			const bar = screen.getByRole('progressbar')
			expect(bar).not.toHaveAttribute('height')
			expect(bar).not.toHaveAttribute('width')
		})
	})

	describe('sizing tokens', () => {
		const tokensOf = (bar: HTMLElement) => ({
			height: bar.style.getPropertyValue('--progress-bar-height'),
			width: bar.style.getPropertyValue('--progress-bar-width'),
		})

		it('applies the default string sizes as CSS custom properties', () => {
			render(<Progress label="Reading progress" />)
			expect(tokensOf(screen.getByRole('progressbar'))).toEqual({ height: '3px', width: '100%' })
		})

		it('keeps consumer string sizes verbatim', () => {
			render(<Progress height="1rem" label="Reading progress" width="50vw" />)
			expect(tokensOf(screen.getByRole('progressbar'))).toEqual({ height: '1rem', width: '50vw' })
		})

		it('converts numeric sizes to rem', () => {
			//	jsdom reports no root font size, which makes `rem()` return NaN; a browser reports 16px
			const computed = jest.spyOn(window, 'getComputedStyle')
				.mockReturnValue({ fontSize: '16px' } as CSSStyleDeclaration)

			try {
				render(<Progress height={ 16 } label="Reading progress" width={ 320 } />)
				expect(tokensOf(screen.getByRole('progressbar'))).toEqual({ height: '1rem', width: '20rem' })
			} finally {
				computed.mockRestore()
			}
		})
	})

	describe('scroll tracking', () => {
		it('starts empty when the page has not scrolled', () => {
			render(<Progress label="Reading progress" />)
			expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
			expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBe(0)
		})

		it('fills in proportion to how far the page has scrolled', () => {
			render(<Progress label="Reading progress" />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			//	scrollable range = 1500 - 500 = 1000
			scrollTo(250)
			expect(bar.value).toBe(25)

			scrollTo(1000)
			expect(bar.value).toBe(100)
		})

		it('rounds the percentage to a whole number', () => {
			render(<Progress label="Reading progress" />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			scrollTo(333)
			expect(bar.value).toBe(33)
		})

		it('scales the value to a custom max', () => {
			render(<Progress label="Reading progress" max={ 10 } />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			scrollTo(500)
			expect(bar.value).toBe(5)
		})

		it('reads the current scroll position on mount', () => {
			setScroll({ top: 500 })
			render(<Progress label="Reading progress" />)
			expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBe(50)
		})

		it('stays at zero when the page is not scrollable', () => {
			setScroll({ client: 800, scroll: 800, top: 0 })
			render(<Progress label="Reading progress" />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			scrollTo(0)
			expect(bar.value).toBe(0)
			expect(Number.isNaN(bar.value)).toBe(false)
		})

		it('returns to zero when scrolled back to the top', () => {
			render(<Progress label="Reading progress" />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			scrollTo(600)
			expect(bar.value).toBe(60)
			scrollTo(0)
			expect(bar.value).toBe(0)
		})
	})

	describe('cleanup', () => {
		it('stops listening to scroll and cancels the pending frame on unmount', () => {
			const { unmount } = render(<Progress label="Reading progress" />)
			const bar = screen.getByRole('progressbar') as HTMLProgressElement

			scrollTo(500)
			expect(bar.value).toBe(50)

			unmount()
			expect(caf).toHaveBeenCalled()

			setScroll({ top: 1000 })
			act(() => { window.dispatchEvent(new Event('scroll')) })
			expect(bar.value).toBe(50)
		})

		it('registers the scroll listener as passive', () => {
			const add = jest.spyOn(window, 'addEventListener')
			try {
				render(<Progress label="Reading progress" />)
				expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
			} finally {
				add.mockRestore()
			}
		})
	})
})
