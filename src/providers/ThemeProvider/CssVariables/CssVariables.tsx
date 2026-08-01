import { outputCssVars, resolveCssVars } from './resolver'
import { useTheme } from '../ThemeProvider'

export const CssVariables = () => {
	const theme = useTheme(),
		tokens = resolveCssVars(theme),
		css = outputCssVars(tokens)

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
