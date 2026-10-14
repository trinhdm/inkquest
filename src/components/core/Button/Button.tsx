import {
	isValidElement, useMemo, Children,
	type ComponentPropsWithoutRef, type MouseEventHandler,
	type ReactNode, type Ref,
} from 'react'

import Link, { type LinkProps } from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { extractText, verifyChildren } from '@/lib/component/children'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { ButtonGroup, useButtonGroupProps } from './ButtonGroup'
import { ButtonProvider, type ButtonContext } from './Button.context'
import { ButtonSection } from './ButtonSection'

import type {
	Priority as ThemePriority,
	Tone as ThemeTone,
	Variant as ThemeVariant,
} from '@/lib/theme/types'

import type { Route } from 'next'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import type { StyleFn } from '@/hooks/useStyles'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	size: 'md',
	variant: 'solid',
} as const

const SUBCOMPONENTS = {
	Group: ButtonGroup,
	Section: ButtonSection,
} as const

interface BaseButtonProps {
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	priority?: ThemePriority
	size?: Size
	showLabel?: boolean
	tone?: ThemeTone
	variant?: ThemeVariant
}

type LinkOptions<T extends string = string> =
	Pick<LinkProps<T>, 'onNavigate' | 'prefetch' | 'replace' | 'scroll'>

interface LinkButtonProps<T extends string = string>
	extends ComponentPropsWithoutRef<'a'>, LinkOptions<T> {
	href: Route<T>
	onClick?: never
	ref?: Ref<HTMLAnchorElement>
}

interface NativeButtonProps
	extends ComponentPropsWithoutRef<'button'>, Record<keyof LinkOptions, never> {
	href?: never
	onClick?: MouseEventHandler<HTMLButtonElement>
	ref?: Ref<HTMLButtonElement>
}

type ButtonProps = BaseButtonProps & (
	| LinkButtonProps
	| NativeButtonProps
)

interface ButtonSpecs {
	context: ButtonGroup.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: ButtonProps
	selectors: ButtonSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: ButtonTokens
}

type ButtonSelectors =
	| 'root' | 'inner'
	| 'label' | 'loader'

type ButtonTokens = {
	root:
		| '--button-font-size'
		| '--button-icon-size'
		| '--button-tracking'
	inner:
		| '--button-gap'
		| '--button-padding'
}

const buildSections = (
	children: ButtonProps['children'],
	styles: StyleFn<ButtonSpecs>,
) => {
	const label: ReactNode[] = []
	let left: ReactNode = null,
		right: ReactNode = null

	Children.toArray(children).forEach(child => {
		if (isValidElement<ButtonSection.Props>(child) && child.type === ButtonSection) {
			const isLeft = 'left' in child.props && !!child.props.left,
				taken = isLeft ? left : right

			if (!taken) {
				if (isLeft) left = child
				else right = child
			} else {
				const childName = `${ButtonSection.displayName}[${isLeft ? 'left' : 'right'}]`
				verifyChildren({ name: { childName, parentName: Button.displayName }, repeated: [child] })
			}
			return
		}

		label.push(child)
	})

	const content = <span { ...styles('label') }>{ label }</span>

	if (!left && !right) return content
	return <>{ left }{ content }{ right }</>
}

const tokens = defineTokens<ButtonSpecs>()(({ props, theme }) => {
	const { size } = props
	let buttonFontSize, buttonPadding, buttonTracking

	if (size) {
		const buttonFontSizes: Record<Button.Size, string> = {
			sm: theme.fontSize('label'),
			md: theme.fontSize('body'),
			lg: theme.fontSize('body'),
		}

		const buttonPaddings: Record<Button.Size, string> = {
			sm: theme.padding('chip'),
			md: theme.padding('item'),
			lg: theme.padding('block'),
		}

		const buttonTrackings: Record<Button.Size, string> = {
			sm: theme.letterSpacing('heading'),
			md: theme.letterSpacing('display'),
			lg: theme.letterSpacing('stat'),
		}

		buttonFontSize = buttonFontSizes[size]
		buttonPadding = buttonPaddings[size]
		buttonTracking = buttonTrackings[size]
	}


	return {
		root: {
			'--button-font-size': buttonFontSize,
			'--button-icon-size': !!size ? theme.el.icon.size(size) : undefined,
			'--button-tracking': buttonTracking,
		},
		inner: {
			'--button-gap': theme.space('chip'),
			'--button-padding': buttonPadding,
		},
	}
})

export const Button = polymorphic<ButtonSpecs>((_props, { useProps, useStyles, useVariants }) => {
	useVariants()
	const props = useProps(useButtonGroupProps(_props))
	const styles = useStyles({ props, tokens })

	const {
		as, children, disabled,
		fullWidth, loading, prefetch,
		priority, replace, scroll,
		showLabel, size, tone,
		unstyled, variant,
		...rest
	} = props

	const others = extractOthers(rest)

	const clsx = {
		global: { block: fullWidth },
	}

	const ariaLabel = extractText(children),
		aria = { label: !!(showLabel && ariaLabel.length) ? ariaLabel : undefined }

	const data = {
		variant, tone, priority,
		block: !!fullWidth || null,
		disabled: !!disabled || null,
		loading: !!loading || null,
	}

	const sharedProps = {
		...styles('root', clsx),
		attributes: { aria, data },
		unstyled,
	}

	const ctxValues = useMemo(() => ({ unstyled }), [unstyled])

	const inner = (
		<ButtonProvider value={ ctxValues }>
			<Box as="span" { ...styles('inner') }>
				{ loading && <LoaderCircle { ...styles('loader', true) } /> }
				{ buildSections(children, styles) }
			</Box>
		</ButtonProvider>
	)

	if (keyHasValue(others, 'href')) {
		// narrows `rest` typing (`LinkButtonProps | NativeButtonProps`)
		// by excluding `NativeButtonProps` from `rest`
		// this allows `rest` to be properly typed

		let linkProps = {
			...sharedProps,
			...others as Extract<typeof others, LinkButtonProps>,
		}

		if (isExternalLink(others.href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return (
			<Box
				{ ...linkProps }
				as={ Link }
				prefetch={ prefetch }
				scroll={ scroll }
				replace={ replace }
			>
				{ inner }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			{ ...others }
			as={ as }
		>
			{ inner }
		</Box>
	)
}, { name: NAME, classes })

Button.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Button {
	export type Context = ButtonContext
	export type Props = ButtonProps
	export type Specs = ButtonSpecs

	export type Priority = ThemePriority
	export type Tone = ThemeTone
	export type Variant = ThemeVariant

	export type Size = NonNullable<Button.Props['size']>

	export namespace Group {
		export type Context = ButtonGroup.Context
		export type Props = ButtonGroup.Props
		export type Specs = ButtonGroup.Specs
	}

	export namespace Section {
		export type Props = ButtonSection.Props
		export type Specs = ButtonSection.Specs
	}
}
