import {
	DEFAULT_COLOR_SCHEME,
	schemeControls,
} from '../src/components/document'
import { useEffect } from 'react'
import { AppProvider } from '../src/providers/AppProvider'
import { inkqDark } from './theme'
// import { DocsContainer } from '@storybook/addon-docs/blocks'
import type { Addon_StorySortComparatorV7 } from 'storybook/internal/types'
import type { Preview } from '@storybook/nextjs-vite'
import '../src/styles/_global.scss'

// const ExampleContainer = ({ children, ...props }) => {
// 	return (
// 		<DocsContainer {...props}>
// 			{children}
// 		</DocsContainer>
// 	)
// }

const SCHEME_GLOBAL = 'scheme'

const decorators: Preview['decorators'] = [(Story, context) => {
	// Driven by the toolbar global (see `globalTypes` below) rather than pinned
	// to `DEFAULT_COLOR_SCHEME`, so every story can be viewed in either scheme.
	// The generated CSS keys off `data-inkq-scheme` on `<html>`, which is what
	// `applyScheme` sets — so flipping this one attribute re-themes the whole
	// preview iframe without remounting anything.
	const scheme = context.globals[SCHEME_GLOBAL] ?? DEFAULT_COLOR_SCHEME

	useEffect(() => {
		schemeControls().applyScheme(scheme)
	}, [scheme])

	// `AppProvider` now renders `<StyleInliner />` and `<VariantStyleInliner />`
	// itself from its own `{ prefix, theme }`, so the preview no longer injects
	// them. Note this drops the previous `names={['Button','Badge','Icon']}`
	// scoping — `AppProvider` emits every variant scheme.
	return (
		<AppProvider>
			<Story />
		</AppProvider>
	)
}]

type PreviewParameters = Preview['parameters'] & {
	options: {
		storySort: Addon_StorySortComparatorV7
	}
}

const preview: Preview = {
	decorators,
	parameters: {
		a11y: {
			test: 'todo',
		},

		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		// Themes the Docs page chrome (prose, headings, ArgsTable, code
		// blocks). Shares one theme object with `manager.ts` so the sidebar
		// and the Docs page can't drift apart.
		docs: {
			theme: inkqDark,
			toc: true,
		},

		// Vertically/horizontally centers each story's content within the
		// preview canvas by default. Stories with wide/multi-row content
		// (e.g. `FullWidth`, `AsLink`) override this with their own
		// `parameters.layout: 'padded'`, which still wins over this default.
		layout: 'centered',

		options: {
			// Top-level categories follow `CATEGORY_ORDER`; every segment
			// below that is alphabetical. Within any title group: Docs first,
			// then nested subcomponent groups (e.g. 'Core/Button/Button.Group'),
			// then the group's own stories in the order they're declared in
			// the file.
			storySort: (a, b) => {
				// Everything this comparator needs must be declared INSIDE it,
				// and in plain JS. Storybook serialises the function and
				// re-evaluates it in the manager, so a reference to anything at
				// module scope throws `<name> is not defined` (misreported as a
				// "V6-style sort function in V7 mode"), and a TypeScript type
				// annotation survives into that eval as `SyntaxError:
				// Unexpected token ':'`. Keep this body annotation-free.
				const CATEGORY_ORDER = [
					'Foundation',
					'Core',
					'Layout',
					'Navigation',
					'Data',
					'Document',
				]

				// Ranks are derived inline from `indexOf` rather than via a
				// helper: a helper would need a parameter, and a parameter here
				// can carry no type annotation (see above), which
				// `noImplicitAny` rejects.
				const LAST = CATEGORY_ORDER.length

				if (a.title === b.title) {
					if (a.type === 'docs') return -1
					if (b.type === 'docs') return 1
					return 0
				}

				if (a.type === 'docs' && b.title.startsWith(`${a.title}/`)) return -1
				if (b.type === 'docs' && a.title.startsWith(`${b.title}/`)) return 1

				const aParts = a.title.split('/'),
					bParts = b.title.split('/'),
					minLen = Math.min(aParts.length, bParts.length)

				for (let i = 0; i < minLen; i++) {
					if (aParts[i] === bParts[i]) continue

					// Only the first segment is a category; deeper segments
					// (component and subcomponent names) stay alphabetical.
					// A category absent from `CATEGORY_ORDER` ranks last, so a
					// new top-level group degrades to alphabetical among its
					// peers instead of silently jumping to the top.
					if (i === 0) {
						const aIndex = CATEGORY_ORDER.indexOf(aParts[i]),
							bIndex = CATEGORY_ORDER.indexOf(bParts[i])

						const rank = (aIndex === -1 ? LAST : aIndex)
							- (bIndex === -1 ? LAST : bIndex)

						if (rank !== 0) return rank
					}

					return aParts[i].localeCompare(bParts[i])
				}

				return bParts.length - aParts.length
			},
		},
	} satisfies PreviewParameters,

	// Toolbar control for the app's light/dark scheme. The decorator above turns
	// this into the `data-inkq-scheme` attribute the generated CSS keys off.
	// Named `scheme` (not `theme`) to match the app's own vocabulary —
	// `ColorScheme` / `SCHEME_STORAGE_KEY` / `applyScheme`.
	globalTypes: {
		[SCHEME_GLOBAL]: {
			description: 'Light/dark color scheme',
			toolbar: {
				title: 'Scheme',
				icon: 'contrast',
				dynamicTitle: true,
				items: [
					{ value: 'dark', title: 'Dark', icon: 'moon' },
					{ value: 'light', title: 'Light', icon: 'sun' },
				],
			},
		},
	},

	// Starts on the app's own default so the toolbar agrees with what the
	// product ships, rather than whichever item happens to be listed first.
	initialGlobals: {
		[SCHEME_GLOBAL]: DEFAULT_COLOR_SCHEME,
	},

	tags: ['autodocs'],
}

export default preview
