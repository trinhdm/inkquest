import {
	useCallback,
	useMemo,
	type ComponentPropsWithoutRef,
	type MouseEvent, type MouseEventHandler,
	type ReactNode, type Ref,
} from 'react'

import Link, { type LinkProps } from 'next/link'
import { Copy, LoaderCircle, Printer } from 'lucide-react'
import { useButtonGroupProps, ButtonGroup } from './ButtonGroup'
import { buildSections, ButtonSection } from './ButtonSection'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { extractText } from '@/lib/component/children'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { Box } from '@/components/polymorphic/Box'
import { ButtonProvider, type ButtonContext } from './Button.context'

import type {
	Priority as ThemePriority,
	Tone as ThemeTone,
	Variant as ThemeVariant,
} from '@/lib/theme/types'

import type { Route } from 'next'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './Button.module.scss'

const NAME = 'Button' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	hasIcon: true,
	size: 'md',
	variant: 'solid',
} as const

const SUBCOMPONENTS = {
	Group: ButtonGroup,
	Section: ButtonSection,
} as const

interface BaseButtonProps {
	animate?: 'left' | 'right'
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	priority?: ThemePriority
	showLabel?: boolean
	size?: Size
	tone?: ThemeTone
	variant?: ThemeVariant
}

type LinkOptions<T extends string = string> =
	Pick<LinkProps<T>, 'onNavigate' | 'prefetch' | 'replace' | 'scroll'>

interface LinkButtonProps<T extends string = string>
	extends
		ComponentPropsWithoutRef<'a'>,
		LinkOptions<T> {
	action?: never
	hasIcon?: never
	href: Route<T>
	onClick?: never
	ref?: Ref<HTMLAnchorElement>
}

interface NativeButtonProps
	extends
		ComponentPropsWithoutRef<'button'>,
		Record<keyof LinkOptions, never> {
	action?: never
	hasIcon?: never
	href?: never
	onClick?: MouseEventHandler<HTMLButtonElement>
	ref?: Ref<HTMLButtonElement>
}

interface ActionButtonProps
	extends Omit<NativeButtonProps, 'action' | 'hasIcon'> {
	action: 'copy' | 'print'
	hasIcon?: boolean
}

type ButtonProps = BaseButtonProps & (
	| LinkButtonProps
	| NativeButtonProps
	| ActionButtonProps
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
	| 'label' | 'icon' | 'loader'

type ButtonTokens = {
	root:
		| '--button-font-size'
		| '--button-icon-size'
		| '--button-icon-translate'
		| '--button-tracking'
	inner:
		| '--button-gap'
		| '--button-padding'
}

const tokens = defineTokens<ButtonSpecs>()(({ props, theme }) => {
	const { animate, loading, size } = props
	let buttonFontSize, buttonIconSize,
		buttonPadding, buttonTracking,
		iconTranslate

	if (!!size) {
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

		buttonIconSize = theme.el.icon.size(size)
		if (!!loading) buttonIconSize = `calc(.125rem + ${buttonIconSize})`

		if (!!animate) {
			const baseDistance = theme.space('icon'),
				step = { sm: 2, md: 1, lg: 0 },
				xPos = rem(step[size])

			iconTranslate = `calc(${baseDistance} - ${xPos})`
			if (animate === 'left') iconTranslate = `calc(-1 * ${iconTranslate})`
		}
	}

	return {
		root: {
			'--button-font-size': buttonFontSize,
			'--button-icon-size': buttonIconSize,
			'--button-icon-translate': iconTranslate,
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
		action, animate, as,
		children, disabled, fullWidth,
		hasIcon, loading, onClick,
		prefetch, priority, replace,
		scroll, showLabel, size,
		tone, unstyled, variant,
		...rest
	} = props

	const others = extractOthers(rest)
	const ctxValues = useMemo(() => ({ unstyled }), [unstyled])

	const handleClick = useCallback((evt: MouseEvent<HTMLButtonElement>) => {
		if (!!loading) {
			evt.preventDefault()
			return
		}

		if (typeof onClick === 'function') onClick(evt)
		if (action === 'print') window.print()
	}, [action, loading, onClick])

	const isDisabled = !!disabled,
		isInert = isDisabled || !!loading

	const aria = {
		disabled: isInert,
		label: !!showLabel ? extractText(children) : undefined,
	}

	const data = {
		variant, tone, priority, animate,
		block: !!fullWidth || null,
		disabled: isDisabled || null,
		loading: !!loading || null,
	}

	const sharedProps = {
		...styles('root', { global: { block: fullWidth } }),
		attributes: { aria, data },
		disabled,
		unstyled,
	}

	const childList = Array.isArray(children) ? [...children] : [children]

	if (!!(action && hasIcon)) {
		const IconTag = { copy: Copy, print: Printer }[action]
		const ActionSection = (
			<ButtonSection>
				<IconTag { ...styles('icon') } aria-hidden />
			</ButtonSection>
		)
		childList.unshift(ActionSection)
	}

	const innerEl = (
		<ButtonProvider value={ ctxValues }>
			<Box as="span" { ...styles('inner') }>
				{ loading && <LoaderCircle { ...styles('loader', true) } aria-hidden /> }
				{ buildSections({
					children: [...new Set(childList)],
					parentName: Button.displayName,
					styles,
				}) }
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
				{ innerEl }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			{ ...others }
			as={ as }
			onClick={ handleClick }
		>
			{ innerEl }
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

	export type BaseProps = BaseButtonProps
		& Pick<ButtonProps, 'action' | 'hasIcon' | 'onClick'>

	export type Priority = ThemePriority
	export type Size = NonNullable<Button.Props['size']>
	export type Tone = ThemeTone
	export type Variant = ThemeVariant

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
