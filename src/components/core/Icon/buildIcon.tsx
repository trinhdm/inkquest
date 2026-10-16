import { extractOthers } from '@/hooks/useProps'
import { keyHasValue } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { ICON_MAP } from './IconMap'
import type { Icon } from './Icon'
import type { StyleFn } from '@/hooks/useStyles'

const getBrandProps = (type: Icon.Props['type']): Icon.Svg.Props | undefined => {
	switch (type) {
		case 'google':
			return {
				children: (
					<g>
						<path d="M20.6 12.2c0 4.8-3.4 8.2-8.4 8.2a8.4 8.4 0 0 1 0-16.8c2.3 0 4.2.8 5.6 2.2l-2.3 2.2a4.8 4.8 0 0 0-3.3-1.3 5.2 5.2 0 0 0 0 10.4c2.6 0 4.4-1.5 4.8-3.6h-4.8" />
						<path d="M16.2 13.5h4.4" />
					</g>
				),
				strokeWidth: '1.999',
				viewBox: '1.776 1.776 23.999 23.999',
			}
		case 'apple':
			return {
				children: (
					<g>
						<path d="M15.6 5.6c-.9 1.1-2.3 1.2-2.3 1.2s-.2-1.4.8-2.5c.9-1.1 2.3-1.1 2.3-1.1s.2 1.3-.8 2.4Z" />
						<path d="M16.9 20.4c-.9.5-1.9.5-2.8-.1-.9-.5-1.9-.5-2.8 0-1.2.6-2.3.4-3.2-.8-2.2-3-2.7-6.9-.5-9 1.1-1.1 2.7-1.2 3.9-.5.8.5 1.7.5 2.5 0 1.2-.7 2.8-.6 3.9.5-1.5 1.1-1.8 3-.6 4.6.4.5.8.8 1.4 1-.5 1.7-1 3.3-1.8 4.3Z" />
					</g>
				),
				strokeWidth: '2.133',
				viewBox: '-0.799 -0.7999 25.599 25.599',
			}
		case 'instagram':
			return {
				children: (
					<g>
						<rect x="2" y="2" width="20" height="20" rx="5" />
						<circle cx="12" cy="12" r="4" />
						<path d="M17.5 6.5h.01" />
					</g>
				),
				strokeWidth: '2.222',
				viewBox: '-1.33 -1.33 26.66 26.66',
			}
		case 'tiktok':
			return {
				children: <path d="M9 12a4 4 0 1 0 4 4V4c.4 2.8 2.2 5 5 5" />,
				strokeWidth: '1.777',
				viewBox: '0.833 1.333 21.333 21.333',
			}
		case 'x':
			return {
				children: <path d="M3.2 3.2h5.3l5.1 6.9 5.9-6.9h2.3l-7 8.2 7.6 10.4h-5.3l-5.3-7.2-6.2 7.2H3l7.4-8.6z" />,
				fill: 'currentColor',
				stroke: 'none',
				viewBox: '1.06 0.86 23.28 23.28',
			}
		default:
			return
	}
}

const isLucideIcon = (type: Icon.Props['type']): type is Icon.Lucide.Props['type'] =>
	keyHasValue(ICON_MAP, type)

interface BuildIconArgs {
	props: Icon.Props
	styles: StyleFn<Icon.Specs>
	tag?: 'svg'
}

export const buildIcon = ({ props, styles, tag }: BuildIconArgs) => {
	const {
		color, filled, href,
		hidden, size, type,
		...rest
	} = props

	const others = extractOthers(rest)

	const sharedProps = {
		...styles('glyph'),
		...others,
		attributes: { aria: {
			hidden,
			label: `${type} icon`,
		} },
	}

	if (isLucideIcon(type)) {
		const target = ICON_MAP[type]

		return (
			<Box
				{ ...sharedProps }
				as={ target }
				color={ color }
				fill={ !!filled ? 'currentColor' : 'none' }
				size={ size }
			/>
		)
	}

	const brandProps = getBrandProps(type)
	if (!brandProps) return null

	return (
		<Box
			{ ...sharedProps }
			{ ...brandProps }
			as={ tag }
			fill={ keyHasValue(brandProps, 'fill') ? brandProps.fill : 'none' }
			height={ size }
			role="img"
			stroke={ color }
			width={ size }
		>
			<title>{ type }</title>
			{ brandProps.children }
		</Box>
	)
}
