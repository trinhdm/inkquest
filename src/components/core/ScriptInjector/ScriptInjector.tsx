import { buildScript } from './buildScript'
import type { ComponentProps } from 'react'
import type { ThemeName } from '@/providers/ThemeProvider'

interface ScriptInjectorProps
	extends ComponentProps<'script'> {
	defaultTheme?: ThemeName
}

export const ScriptInjector = ({
	defaultTheme,
	...props
}: ScriptInjectorProps) => {
	const script = buildScript({ theme: defaultTheme })

	return (
		<script
			{ ...props }
			data-theme-script
			dangerouslySetInnerHTML={{ __html: script }}
			// suppressHydrationWarning
		/>
	)
}

ScriptInjector.displayName = 'ScriptInjector'
