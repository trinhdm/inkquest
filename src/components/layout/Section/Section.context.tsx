import { createCompoundCtx } from '@/lib/component/context'
import { Grid } from '../Grid'
import type { AnimationOptions } from '@/hooks/animation'
import type { Button } from '@/components/core/Button'

interface ElSectionFooterArgs {
	as?: never
	span?: never
}

interface GridSectionFooterArgs {
	as: typeof Grid.Item
	span: Grid.Item.Props['span']
}

type SectionFooterContext =
	| ElSectionFooterArgs
	| GridSectionFooterArgs

interface BaseSectionContext
	extends Pick<AnimationOptions, 'unstyled'> {
	revealFrom?: number
	size?: Button.Size
}

export type SectionContext =
	& BaseSectionContext
	& SectionFooterContext

export const {
	RootProvider: SectionProvider,
	useRootCtx: useSectionCtx,
	useRootProps: useSectionProps,
} = createCompoundCtx<SectionContext, 'Section'>('Section')

const sharedSectionProps = [
	'revealFrom',
	'size',
	'unstyled',
] as const satisfies readonly (keyof SectionContext)[]

export const useChosenSectionProps = <P extends object>(_props: P) =>
	useSectionProps(_props, ...sharedSectionProps)

export const useSection = () => ({ useChosenSectionProps, useSectionCtx, useSectionProps })
