import { useTheme } from '../ThemeProvider'
import { resolveCssVars, serializeCssVars } from './build'

export const CssVariables = () => {
	const theme = useTheme(),
		tokens = resolveCssVars(theme),
		css = serializeCssVars(tokens)

	if (!css) return null

	console.log(css)

	return (
		<style
			data-theme-vars
			dangerouslySetInnerHTML={{ __html: css }}
		/>
	)
}

CssVariables.displayName = 'CssVariables'
