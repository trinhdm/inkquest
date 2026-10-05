'use client'

import { useEffect, useRef, type RefObject } from 'react'

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
	ref: RefObject<T | null>,
	callback: (...args: any[]) => void
) => {
	const callbackRef = useRef(callback)

	useEffect(() => { callbackRef.current = callback })

	useEffect(() => {
		const handleOutsideEvent = (evt: MouseEvent | TouchEvent) => {
			if (!ref.current || ref.current.contains(evt.target as Node)) return
			callbackRef.current(evt)
		}

		document.addEventListener('mousedown', handleOutsideEvent)
		document.addEventListener('touchstart', handleOutsideEvent)

		return () => {
			document.removeEventListener('mousedown', handleOutsideEvent)
			document.removeEventListener('touchstart', handleOutsideEvent)
		}
	}, [ref])
}
