import {
	DEFAULT_COLOR_SCHEME,
	schemeControls,
} from '../src/components/document'
import { useEffect } from 'react'
import { AppProvider } from '../src/providers/AppProvider'
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

const decorators: Preview['decorators'] = [(Story) => {
	useEffect(() => {
		schemeControls().applyScheme(DEFAULT_COLOR_SCHEME)
	}, [])

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

		docs: {
			// theme: ensure(themes.dark),
			toc: true,
		},

		// Vertically/horizontally centers each story's content within the
		// preview canvas by default. Stories with wide/multi-row content
		// (e.g. `FullWidth`, `AsLink`) override this with their own
		// `parameters.layout: 'padded'`, which still wins over this default.
		layout: 'centered',

		options: {
			// Within any title group: Docs first, then nested subcomponent
			// groups (e.g. 'Core/Button/Button.Group'), then the group's own
			// stories in the order they're declared in the file.
			storySort: (a, b) => {
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
					if (aParts[i] !== bParts[i])
						return aParts[i].localeCompare(bParts[i])
				}

				return bParts.length - aParts.length
			},
		},
	} satisfies PreviewParameters,
	tags: ['autodocs'],
}

export default preview
