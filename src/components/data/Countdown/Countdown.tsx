import { useState } from 'react'
import { useCountdown } from '@/hooks/animation'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { TimeFormat } from '@/types/shared'
import classes from './Countdown.module.scss'

const NAME = 'Countdown' as const,
	TAG = 'time' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface CountdownProps {
	from: number
	format?: TimeFormat
	onComplete?: () => void
}

interface CountdownSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: CountdownProps
	selectors: CountdownSelectors
}

type CountdownSelectors =
	| 'root'

export const Countdown = polymorphic<CountdownSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as, format,
		from, onComplete,
		...rest
	} = props

	const others = extractOthers(rest)

	const [timestamp, _setTimestamp] = useState(() => (Date.now() + from * 1000))
	const { isExpired, isoDuration, timeLeft } = useCountdown({ format, onComplete, timestamp })

	if (isExpired) return null

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			dateTime={ isoDuration }
		>
			{ timeLeft }
		</Box>
	)
}, { name: NAME, classes })

Countdown.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Countdown {
	export type Props = CountdownProps
	export type Specs = CountdownSpecs
}
