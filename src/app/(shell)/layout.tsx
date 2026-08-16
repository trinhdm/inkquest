import { AppProvider } from '@/providers/AppProvider'
import { CssVariables } from '@/components/core/CssVariables'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
	return (
		<AppProvider themeStyles={<CssVariables />}>
			{ children }
		</AppProvider>
	)
}
