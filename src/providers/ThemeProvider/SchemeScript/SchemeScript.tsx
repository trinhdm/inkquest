import { themeInitScript } from './applyTheme'
import { useTheme } from '../ThemeProvider'
import type { ThemeName } from '../theme.types'

// const scriptScheme = () => {}

interface ScriptProps {
	defaultScheme?: ThemeName
}

export const SchemeScript = ({
	defaultScheme = 'dark',
}: ScriptProps) => {
	// const theme = useTheme()

	return (
		<script
			// suppressHydrationWarning
			data-theme-script
			dangerouslySetInnerHTML={{
				__html: themeInitScript
			}}
		/>
	)
}

SchemeScript.displayName = 'SchemeScript'
