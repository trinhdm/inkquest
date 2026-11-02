import { useEffect, useState, type CSSProperties } from 'react'

const SKIP_GAP = 2
const TIER_MS = 75
export const METER_CSS = { '--pw-tier-duration': `${TIER_MS}ms` } as CSSProperties

//	fills the meter toward `met` one tier per `TIER_MS`
//	multiple tiers jumps straight there, instead of animating
export const usePasswordMeter = (met: number) => {
	const [settled, setSettled] = useState(0)

	const skipping = met - settled > SKIP_GAP,
		filled = skipping || met === 0 ? met : settled + Math.sign(met - settled)

	useEffect(() => {
		if (settled === met) return

		const timer = setTimeout(() => setSettled(filled), TIER_MS)
		return () => clearTimeout(timer)
	}, [filled, met, settled])

	return { filled, level: met || settled, skipping }
}
