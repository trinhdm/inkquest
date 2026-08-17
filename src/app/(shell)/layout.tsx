import { AppProvider } from '@/providers/AppProvider'
import { StyleInliner, VariantStyleInliner } from '@/components/document'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
	const VariableStyles = (
		<>
			<StyleInliner />
			<VariantStyleInliner names={ ['Button', 'Badge'] } />
		</>
	)

	return (
		<AppProvider themeStyles={ VariableStyles }>
			{ children }
		</AppProvider>
	)
}
