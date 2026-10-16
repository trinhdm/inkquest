import { useEffect, useId, useRef } from 'react'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { Box } from '@/components/polymorphic/Box'
import type { CSSUnit } from '@/types/shared'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Progress.module.scss'

const NAME = 'Progress' as const,
	TAG = 'progress' as const

const DEFAULT_PROPS = {
	as: TAG,
	height: '3px',
	max: 100,
	width: '100%',
} as const

interface ProgressProps {
	height?: CSSUnit | number
	id?: string
	label: string
	max?: number
	width?: CSSUnit | number
}

interface ProgressSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: ProgressProps
	selectors: ProgressSelectors
	tokens: ProgressTokens
}

type ProgressSelectors =
	| 'root' | 'bar' | 'sr'

type ProgressTokens = {
	root:
		| '--progress-bar-height'
		| '--progress-bar-width'
}

const tokens = defineTokens<ProgressSpecs>()(({ props }) => {
	const { height, width } = props
	let barHeight, barWidth

	if (height) barHeight = typeof height === 'number' ? rem(height) : height
	if (width) barWidth = typeof width === 'number' ? rem(width) : width

	return {
		root: {
			'--progress-bar-height': barHeight,
			'--progress-bar-width': barWidth,
		},
	}
})

export const Progress = polymorphic<ProgressSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, height, id,
		label, max, width,
		...rest
	} = props

	const others = extractOthers(rest)
	const ref = useRef<HTMLProgressElement>(null)

	useEffect(() => {
		const progressBar = ref.current
		if (!progressBar) return

		let frameID: number

		const updateProgress = () => {
			const { clientHeight, scrollHeight, scrollTop } = document.documentElement,
				range = scrollHeight - clientHeight

			const percent = range > 0 ? Math.round((scrollTop / range) * 100) : 0,
				progress = percent * (max / 100)

			frameID = requestAnimationFrame(() => {
				if (progressBar.value !== progress)
					progressBar.value = progress
			})
		}

		window.addEventListener('scroll', updateProgress, { passive: true })
		updateProgress()

		return () => {
			window.removeEventListener('scroll', updateProgress)
			cancelAnimationFrame(frameID)
		}
	}, [max])

	const uid = useId(),
		barID = id ?? uid

	return (
		<>
			<label { ...styles('sr', true) } htmlFor={ barID }>
				{ label }
			</label>

			<Box
				{ ...styles('root') }
				{ ...others }
				as={ as }
				id={ barID }
				max={ max }
				ref={ ref }
				value={ 0 }
			/>
		</>
	)
}, { name: NAME, classes })

Progress.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Progress {
	export type Props = ProgressProps
	export type Specs = ProgressSpecs
}
