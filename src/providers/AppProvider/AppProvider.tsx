'use client'

import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { ThemeProvider } from '../ThemeProvider'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { StyleInliner, VariantStyleInliner } from '@/components/document'
import type { ReactNode } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface AppProviderProps {
	children: ReactNode
	prefix?: string
	theme?: SiteTheme
}

const DEFAULT_APP = {
	prefix: PREFIX_CSS_SELECTOR,
	theme: DEFAULT_THEME,
}

export const AppProvider = ({
	children,
	...rest
}: AppProviderProps) => {
	const props = { ...DEFAULT_APP, ...rest }

	return (
		<ThemeProvider { ...props }>
			<StyleInliner { ...props } />
			<VariantStyleInliner prefix={ props.prefix } />
			{ children }
		</ThemeProvider>
	)
}
