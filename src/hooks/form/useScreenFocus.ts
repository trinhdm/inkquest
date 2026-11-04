import { useEffect, useRef } from 'react'

//	on screen change, focuses the new screen's section,
//	unless `Form` already focused a field inside it
export const useScreenFocus = <T extends string>(
	screen: T,
	sectionID: string,
) => {
	const lastScreen = useRef(screen)

	useEffect(() => {
		if (lastScreen.current === screen) return

		lastScreen.current = screen
		const section = document.getElementById(sectionID)

		if (!section?.contains(document.activeElement))
			section?.focus()
	}, [screen, sectionID])
}
