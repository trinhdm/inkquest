import { useCallback, useEffect, useRef, useState } from 'react'

//	how long scrolling must stop before the spy takes over again
const SETTLE_MS = 200

//	a 1%-tall line 20% down the viewport; whichever section crosses it is current
const SPY_MARGIN = '-20% 0px -79% 0px'

/**
 *	tracks which element is at the top of the viewport
 *	@param ids - stable array of element ids in page order
 *	@returns `[activeID, selectID]`: the id of the intersecting element (or `ids[0]` until one does),
 *	with a setter that jumps straight to an id and ignores the spy until the page stops scrolling
 */
export const useActiveID = (ids: string[]) => {
	const [activeID, setActiveID] = useState(ids[0])
	const paused = useRef(false)

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

			if (paused.current) return

			const current = ids.find(id => visible.has(id))
			if (current) setActiveID(current)
		}, { rootMargin: SPY_MARGIN })

		targets.forEach(el => observer.observe(el))

		return () => observer.disconnect()
	}, [ids])

	const selectID = useCallback((id: string) => {
		let timer = 0

		const resume = () => {
			window.removeEventListener('scroll', wait)
			paused.current = false
		}

		const wait = () => {
			window.clearTimeout(timer)
			timer = window.setTimeout(resume, SETTLE_MS)
		}

		paused.current = true
		setActiveID(id)

		window.addEventListener('scroll', wait, { passive: true })
		wait()
	}, [])

	return [activeID, selectID] as const
}
