// Pass-through segment layout — see src/app/(company)/layout.tsx for the
// rationale. Mirrors it exactly for the (user) route group.
export default function UserLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <>{ children }</>
}
