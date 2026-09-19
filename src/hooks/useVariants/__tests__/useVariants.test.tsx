import { renderHook } from '@testing-library/react'
import { useVariants } from '../useVariants'
import { resetVariantStyles } from '../variantsRegistry'
import { ThemeProvider } from '@/providers/ThemeProvider'
import type { ReactNode } from 'react'

const wrapperWithPrefix = (prefix: string) =>
	({ children }: { children: ReactNode }) => (
		<ThemeProvider prefix={ prefix }>{ children }</ThemeProvider>
	)

describe('useVariants', () => {
	afterEach(() => {
		document.querySelectorAll('style[data-target-vars]').forEach(node => node.remove())
		resetVariantStyles()
	})

	it('injects a <style> tag scoped to the prefixed component selector on first render', () => {
		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		const tag = document.querySelector('style[data-target-vars="TestComponent"]')
		expect(tag).not.toBeNull()
		expect(tag?.textContent).toContain('.ink-test-component {')
	})

	it('derives the default background/border/color CSS variables with a hover fallback bridge', () => {
		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		const tag = document.querySelector('style[data-target-vars="TestComponent"]')
		const css = tag?.textContent ?? ''

		expect(css).toContain('--test-component-background: var(--variant-background, var(--ink-background-backup));')
		expect(css).toContain('--test-component-background-hover: var(--variant-background-hover, var(--test-component-background));')
		expect(css).toContain('--test-component-border: var(--variant-border, var(--ink-border-backup));')
		expect(css).toContain('--test-component-color: var(--variant-color, var(--ink-color-backup));')
	})

	it('kebab-cases a multi-word PascalCase component name for both selector and var names', () => {
		renderHook(() => useVariants('ButtonGroup'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		const tag = document.querySelector('style[data-target-vars="ButtonGroup"]')
		const css = tag?.textContent ?? ''

		expect(css).toContain('.ink-button-group {')
		expect(css).toContain('--button-group-background')
	})

	it('does not inject a second stylesheet for the same name on re-render (registry short-circuit)', () => {
		const { rerender } = renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		rerender()
		rerender()

		const tags = document.querySelectorAll('style[data-target-vars="TestComponent"]')
		expect(tags).toHaveLength(1)
	})

	it('injects again for the same name once both the in-memory registry AND the old <style> tag are cleared', () => {
		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})
		expect(document.querySelectorAll('style[data-target-vars="TestComponent"]')).toHaveLength(1)

		// `hasInjectVariant` also re-derives "already injected" from a
		// live DOM query (`[data-target-vars="name"]`), so clearing only the
		// in-memory Set is not sufficient on its own -- the stale tag must go
		// too, or the DOM fallback re-marks the name as injected anyway.
		resetVariantStyles('TestComponent')
		document.querySelectorAll('style[data-target-vars="TestComponent"]').forEach(node => node.remove())

		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		expect(document.querySelectorAll('style[data-target-vars="TestComponent"]')).toHaveLength(1)
	})

	it('resetVariantStyles alone does NOT cause re-injection while the old <style> tag remains in the DOM', () => {
		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		resetVariantStyles('TestComponent')

		renderHook(() => useVariants('TestComponent'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		// still just the one original tag -- the DOM fallback in
		// `hasInjectVariant` re-marks the name as injected
		expect(document.querySelectorAll('style[data-target-vars="TestComponent"]')).toHaveLength(1)
	})

	it('does not re-inject when a stylesheet for the name already exists in the DOM (hasInjected DOM fallback)', () => {
		const preExisting = document.createElement('style')
		preExisting.dataset.targetVars = 'PreSeeded'
		preExisting.textContent = '.pre-seeded { --pre-seeded-background: red; }'
		document.head.appendChild(preExisting)

		renderHook(() => useVariants('PreSeeded'), {
			wrapper: wrapperWithPrefix('ink'),
		})

		expect(document.querySelectorAll('style[data-target-vars="PreSeeded"]')).toHaveLength(1)
	})

	it('renders under a prefix-less ThemeProvider, but the backup CSS variable literally embeds "undefined" (no prefix guard) — a real defect worth flagging', () => {
		renderHook(() => useVariants('TestComponent'), {
			wrapper: ({ children }) => <ThemeProvider>{ children }</ThemeProvider>,
		})

		const tag = document.querySelector('style[data-target-vars="TestComponent"]')
		const css = tag?.textContent ?? ''

		expect(css).toContain('.test-component {')
		expect(css).toContain('var(--undefined-background-backup)')
	})
})
