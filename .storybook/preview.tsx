import { useEffect } from 'react'
import type { Preview } from '@storybook/nextjs-vite'
import { AppProvider } from '../src/providers/AppProvider'
import {
	DEFAULT_COLOR_SCHEME,
	StyleInliner,
	VariantStyleInliner,
	schemeControls,
} from '../src/components/document'
import '../src/styles/_global.scss'

const decorators: Preview['decorators'] = [(Story) => {
	useEffect(() => {
		schemeControls().applyScheme(DEFAULT_COLOR_SCHEME)
	}, [])

	return (
		<AppProvider themeStyles={
			<>
				<StyleInliner />
				<VariantStyleInliner names={
					['Button', 'ButtonGroup', 'Badge', 'Icon']
				} />
			</>
		}>
			<Story />
		</AppProvider>
	)
}]

const preview: Preview = {
	decorators,
	parameters: {
		a11y: {
			test: 'todo'
		},

		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		docs: {
			toc: true
		},
	},
	tags: ['autodocs'],
}

export default preview
