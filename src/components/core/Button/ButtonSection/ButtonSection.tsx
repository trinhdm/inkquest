import { useButtonCtx } from '../Button.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const NAME = 'Button.Section' as const

interface LeftSectionProps {
	left: true
	right?: never
}
interface RightSectionProps {
	left?: never
	right: true
}

type ButtonSectionProps = (
	| LeftSectionProps
	| RightSectionProps
)

type ButtonSectionSpecs = {
	context: Button.Context
	isCompound: true
	props: ButtonSectionProps
	selectors: ButtonSectionSelectors
}

type ButtonSectionSelectors =
	| 'section'

export const ButtonSection = polymorphic<ButtonSectionSpecs>((_props, { useProps, useStyles }) => {
	const context = useButtonCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, withRootName: true })

	const { children, left, right, ...rest } = props
	const others = extractOthers(rest)

	const data = { side: left ? 'left' : 'right' }

	return (
		<Box
			{ ...styles(context.baseName) }
			{ ...others }
			as="span"
			attributes={ { data } }
		>
			{ children }
		</Box>
	)
}, { name: NAME, classes })

ButtonSection.set({ displayName: NAME })

export declare namespace ButtonSection {
	export type Props = ButtonSectionProps
	export type Specs = ButtonSectionSpecs
}
