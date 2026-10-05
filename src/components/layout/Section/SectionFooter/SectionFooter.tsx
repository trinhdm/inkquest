import { isValidElement, Children, type ReactNode } from 'react'
import { useSectionCtx, useSectionProps } from '../Section.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { revealItemFrom } from '@/hooks/animation'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import type { Section } from '../Section'
import classes from '../Section.module.scss'

const NAME = 'Section.Footer' as const

interface SectionFooterProps {
	children: ReactNode
	revealFrom?: number
	size?: Button.Size
}

interface SectionFooterSpecs {
	context: Section.Context
	isCompound: true
	props: SectionFooterProps
	selectors: SectionFooterSelectors
}

type SectionFooterSelectors =
	| 'footer' | 'footer-content'

interface FooterParts {
	buttons: ReactNode[]
	content: ReactNode[]
	/** reveal slots needed: one per button, plus one shared by all other content */
	total: number
}

export const partitionFooter = (children: ReactNode): FooterParts => {
	const buttons: ReactNode[] = [],
		content: ReactNode[] = []

	Children.toArray(children).forEach(child => {
		if (isValidElement(child) && child.type === Button) buttons.push(child)
		else content.push(child)
	})

	return {
		buttons,
		content,
		total: buttons.length + (content.length ? 1 : 0),
	}
}

export const SectionFooter = polymorphic<SectionFooterSpecs>((_props, { useProps, useStyles }) => {
	const context = useSectionCtx(NAME)
	const props = useProps(useSectionProps(_props))
	const styles = useStyles({ context, props, withRootName: true })

	const { children, revealFrom, size, ...rest } = props
	const others = extractOthers(rest)

	const { buttons, content } = partitionFooter(children),
		hasContent = !!content.length

	// content takes the first slot of the reserved range, buttons the rest
	const buttonsFrom = typeof revealFrom === 'number'
		? revealFrom + (hasContent ? 1 : 0)
		: undefined

	return (
		<Box { ...styles(context.baseName) } { ...others } as="div">
			{ hasContent && (
				<div { ...styles(`${context.baseName}-content`) } { ...revealItemFrom(0, revealFrom) }>
					{ content }
				</div>
			) }

			{ !!buttons.length && (
				<Button.Group
					hasPriority={ buttons.length > 1 }
					revealFrom={ buttonsFrom }
					size={ size }
				>
					{ buttons }
				</Button.Group>
			) }
		</Box>
	)
}, { name: NAME, classes })

SectionFooter.set({ displayName: NAME })

export declare namespace SectionFooter {
	export type Props = SectionFooterProps
	export type Specs = SectionFooterSpecs
}
