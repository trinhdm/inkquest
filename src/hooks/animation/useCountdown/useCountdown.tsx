import { useEffect, useRef, useState } from 'react'
import { formatTime } from '@/utils/helpers'
import type { TimeFormat } from '@/types/shared'

interface UseCountdownOptions {
	format?: TimeFormat
	onComplete?: () => void
	timestamp: number					//	UTC timestamp in milliseconds
}

const calculateTimeLeft = (target: number): number =>
	Math.max(0, target - Date.now())

export const useCountdown = ({
	format,
	onComplete,
	timestamp,
}: UseCountdownOptions) => {
	const [timeLeft, setTimeLeft] = useState<number>(() => calculateTimeLeft(timestamp))
	// const [isActive, setIsActive] = useState<boolean>(true)

	const callbackRef = useRef<() => void>(onComplete)
	const timerRef = useRef<number>(null)

	useEffect(() => {
		callbackRef.current = onComplete
	}, [onComplete])

	useEffect(() => {
		const updateTimer = () => {
			const remaining = calculateTimeLeft(timestamp)

			if (remaining > 0) {
				setTimeLeft(remaining)
				timerRef.current = requestAnimationFrame(updateTimer)
			} else {
				setTimeLeft(0)
				callbackRef.current?.()
			}
		}

		timerRef.current = requestAnimationFrame(updateTimer)
		return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current) }
	}, [timestamp])

	return formatTime(timeLeft, format)
}
