'use client'

import { useEffect, useRef, useState } from 'react'

interface UseDebounce {
	cancel: () => void
	debounce: (...args: any[]) => void
	waiting: boolean
}

export const useDebounce = (
	callback: (...args: any[]) => void,
	delay = 250,
): UseDebounce => {
	const callbackRef = useRef(callback)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	const [waiting, setWaiting] = useState<boolean>(false)

	useEffect(() => { callbackRef.current = callback })

	const cancel = () => {
		clearTimeout(timeoutRef.current)
		setWaiting(false)
	}

	// mirrors `useOutsideClick`'s unmount cleanup — a bare `useEffect(() =>
	// cancel, [])` runs `cancel` as the effect's own cleanup, on unmount only
	useEffect(() => cancel, [])

	const debounce = (...args: any[]) => {
		cancel()
		setWaiting(true)
		timeoutRef.current = setTimeout(() => {
			setWaiting(false)
			callbackRef.current(...args)
		}, delay)
	}

	return { cancel, debounce, waiting }
}
