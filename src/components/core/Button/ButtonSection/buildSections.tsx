import { isValidElement, Children, type ReactNode } from 'react'
import { keyHasValue } from '@/utils/helpers'
import { verifyChildren } from '@/lib/component/children'
import { ButtonSection } from './ButtonSection'
import type { Button } from '../Button'
import type { StyleFn } from '@/hooks/useStyles'

interface BuildSectionsArgs {
	children: Button.Props['children']
	parentName: string
	styles: StyleFn<Button.Specs>
}

export const buildSections = ({
	children,
	parentName,
	styles,
}: BuildSectionsArgs) => {
	const label: ReactNode[] = []
	let left: ReactNode = null,
		right: ReactNode = null

	Children.toArray(children).forEach(child => {
		if (isValidElement<ButtonSection.Props>(child) && child.type === ButtonSection) {
			const isRight = keyHasValue(child.props, { right: true }),
				taken = isRight ? right : left

			if (!taken) {
				if (isRight) right = child
				else left = child
			} else {
				const childName = `${ButtonSection.displayName}[${isRight ? 'right' : 'left'}]`
				verifyChildren({ name: { childName, parentName }, repeated: [child] })
			}
			return
		}

		label.push(child)
	})

	const content = <span { ...styles('label') }>{ label }</span>

	if (!left && !right) return content
	return <>{ left }{ content }{ right }</>
}
