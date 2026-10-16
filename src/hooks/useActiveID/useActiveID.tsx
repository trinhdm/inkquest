import { useCallback, useEffect, useRef, useState } from 'react'

//	how far down the viewport the spy's line sits (matches the top of `SPY_MARGIN`)
const SPY_LINE = .2

//	a 1%-tall band at the line; the observer fires whenever a section crosses it
const SPY_MARGIN = '-20% 0px -79% 0px'

/**
 *	tracks which element is at the top of the viewport
 *	@param ids - stable array of element ids in page order
 *	@returns `[activeID, selectID]`: the id of the last element whose top has passed the line
 *	(or `ids[0]` above them all), with a setter that jumps straight to an id and holds it
 *	until the page gets there; the URL hash must change to that id, as the Sidebar's links do
 */
export const useActiveID = (ids: string[]) => {
	const [activeID, setActiveID] = useState(ids[0])

	//	set while the page scrolls to a destination: `{ id }` when it's known, `{}` when it isn't;
	//	the spy is ignored until the page arrives or comes to rest
	const travel = useRef<{ id?: string } | null>(null)

	const findCurrent = useCallback(() => {
		const line = window.innerHeight * SPY_LINE
		const current = ids.findLast(id => {
			const el = document.getElementById(id)
			return !!el && el.getBoundingClientRect().top <= line
		})

		return current ?? ids[0]
	}, [ids])

	const travelTo = useCallback((id?: string) => {
		if (id) setActiveID(id)

		//	without `scrollend` (Safari before 26.2) nothing would end the hold, so the spy keeps running
		const canHold = 'onscrollend' in window && id !== findCurrent()
		travel.current = canHold ? { id } : null
	}, [findCurrent])

	useEffect(() => {
		const targets = ids
			.map(id => document.getElementById(id))
			.filter(el => el !== null)

		if (!targets.length) return

		const observer = new IntersectionObserver(() => {
			const current = findCurrent()
			if (travel.current && travel.current.id !== current) return

			travel.current = null
			setActiveID(current)
		}, { rootMargin: SPY_MARGIN })

		targets.forEach(el => observer.observe(el))

		return () => observer.disconnect()
	}, [ids, findCurrent])

	useEffect(() => {
		//	the page is as far down as it goes, but `id` still sits below the line (e.g. a short last section)
		const isOutOfReach = (id: string) => {
			const el = document.getElementById(id)
			const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1

			return !!el && atBottom && el.getBoundingClientRect().top > window.innerHeight * SPY_LINE
		}

		//	the page came to rest without reaching the line at `id`: it fell short, or the reader took over
		const onScrollEnd = () => {
			const hold = travel.current
			if (!hold) return

			//	a scroll that ended before Next moved to `id` (e.g. a wheel still settling) isn't the glide
			if (hold.id && window.location.hash.slice(1) !== hold.id) return

			//	Chrome also fires `scrollend` when a wheel gesture ends mid-glide, so check the page has stopped
			const y = window.scrollY
			requestAnimationFrame(() => requestAnimationFrame(() => {
				if (travel.current !== hold || window.scrollY !== y) return

				travel.current = null
				setActiveID(hold.id && isOutOfReach(hold.id) ? hold.id : findCurrent())
			}))
		}

		//	Back/Forward: `popstate` fires before the browser scrolls, and the URL already names the destination
		const onPopState = () => {
			const id = window.location.hash.slice(1)
			travelTo(ids.includes(id) ? id : undefined)
		}

		window.addEventListener('scrollend', onScrollEnd)
		window.addEventListener('popstate', onPopState)

		return () => {
			window.removeEventListener('scrollend', onScrollEnd)
			window.removeEventListener('popstate', onPopState)
		}
	}, [ids, findCurrent, travelTo])

	return [activeID, travelTo] as const
}
