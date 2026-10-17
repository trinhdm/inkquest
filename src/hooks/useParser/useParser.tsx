import parse, {
	attributesToProps, domToReact,
	DOMNode, Element, Text,
	type HTMLReactParserOptions,
} from 'html-react-parser'

import Link from 'next/link'
import { useMemo } from 'react'
import { isExternalLink } from '@/utils/helpers'
import { withEmailLink } from './withEmailLink'
import type { Route } from 'next'

export const useParser = (htmlContent?: string) => {
	const parsedContent = useMemo(() => {
		if (!htmlContent) return null

		const replace = (domNode: DOMNode) => {
			if (domNode instanceof Text) {
				const inLink = domNode.parent instanceof Element && domNode.parent.name === 'a'
				if (inLink || !domNode.data.includes('@')) return
				return <>{ withEmailLink(domNode.data) }</>
			}

			if (!(domNode instanceof Element) || domNode.name !== 'a') return

			const { href, ...linkProps } = attributesToProps(domNode.attribs)
			if (typeof href !== 'string') return

			const content = domToReact(domNode.children as DOMNode[], options),
				sharedProps = { ...linkProps, 'data-cta': '' }

			if (isExternalLink(href)) {
				return (
					<a href={ href } { ...sharedProps } target="_blank" rel="noopener noreferrer">
						{ content }
					</a>
				)
			}

			return (
				<Link href={ href as Route } { ...sharedProps }>
					{ content }
				</Link>
			)
		}

		const options: HTMLReactParserOptions = { replace }
		return <>{ parse(htmlContent, options) }</>
	}, [htmlContent])

	return parsedContent
}
