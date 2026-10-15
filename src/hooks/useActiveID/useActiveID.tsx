import { useEffect, useState } from 'react'

//	a 1%-tall line 20% down the viewport; whichever section crosses it is current
const SPY_MARGIN = '-20% 0px -79% 0px'

/**
 *	tracks which element is at the top of the viewport
 *	@param ids - stable array of element ids in page order
 *	@returns the id of the intersecting element, or `ids[0]` until one does
 */
export const useActiveID = (ids: string[]): string | undefined => {
	const [activeID, setActiveID] = useState(ids[0])

	useEffect(() => {
		const targets = ids
			.map(id => document.getElementById(id))
			.filter(el => el !== null)

		if (!targets.length) return
		const visible = new Set<string>()

		const observer = new IntersectionObserver(entries => {
			entries.forEach(({ isIntersecting, target }) => {
				if (isIntersecting) visible.add(target.id)
				else visible.delete(target.id)
			})

			const current = ids.find(id => visible.has(id))
			if (current) setActiveID(current)
		}, { rootMargin: SPY_MARGIN })

		targets.forEach(el => observer.observe(el))

		return () => observer.disconnect()
	}, [ids])

	return activeID
}
