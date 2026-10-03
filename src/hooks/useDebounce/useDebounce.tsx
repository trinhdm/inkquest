'use client'

import { useEffect, useRef } from 'react'

interface UseDebounce {
	cancel: () => void
	debounced: (...args: any[]) => void
}

export const useDebounce = (
	callback: (...args: any[]) => any,
	delay = 250
): UseDebounce => {
	const callbackRef = useRef(callback)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => { callbackRef.current = callback })

	const cancel = () => clearTimeout(timeoutRef.current)

	// mirrors `useOutsideClick`'s unmount cleanup — a bare `useEffect(() =>
	// cancel, [])` runs `cancel` as the effect's own cleanup, on unmount only
	useEffect(() => cancel, [])

	const debounced = (...args: any[]) => {
		cancel()
		timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay)
	}

	return { cancel, debounced }
}
