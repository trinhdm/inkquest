'use client'

import { useMemo, type ReactNode } from 'react'
import { StyleInliner, VariantStyleInliner } from '@/components/document/StyleInliner'
import { ThemeProvider } from '../ThemeProvider'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
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
	const props = useMemo(
		() => ({ ...DEFAULT_APP, ...rest }),
		[rest.prefix, rest.theme]
	)

	return (
		<ThemeProvider { ...props }>
			<StyleInliner { ...props } />
			<VariantStyleInliner prefix={ props.prefix } />
			{ children }
		</ThemeProvider>
	)
}
