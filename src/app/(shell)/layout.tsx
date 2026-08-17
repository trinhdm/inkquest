import { AppProvider } from '@/providers/AppProvider'
import { StyleInliner, VariantStyleInliner } from '@/components/document'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
	const ComponentWithVariants = [
		'Button', 'ButtonGroup', 'Badge',
		'Icon',
	]
	const VariableStyles = (
		<>
			<StyleInliner />
			<VariantStyleInliner names={ ComponentWithVariants } />
		</>
	)

	return (
		<AppProvider themeStyles={ VariableStyles }>
			{ children }
		</AppProvider>
	)
}
