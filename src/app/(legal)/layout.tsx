// Pass-through segment layout. Its only job is to give the (legal) route
// group its own boundary in the route tree, so Turbopack can scope
// invalidation to routes under this group instead of treating the root
// layout as the sole segment boundary for the whole app.

export default function LegalLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <>{ children }</>
}
