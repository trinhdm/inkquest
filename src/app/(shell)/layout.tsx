import { AppProvider } from '@/providers/AppProvider'
import { StyleInliner } from '@/components/document/StyleInliner'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
	return (
		<AppProvider themeStyles={ <StyleInliner /> }>
			{ children }
		</AppProvider>
	)
}
