import Link from 'next/link'
import parse, { domToReact, DOMNode, Element } from 'html-react-parser'
import { useMemo } from 'react'
import { isExternalLink } from '@/utils/helpers'
import type { Route } from 'next'

export const withEmailLink = (text: string) => {
	const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
		parts = text.split(emailRegex)

	return parts.map((part, index) => {
		if (emailRegex.test(part))
			return <a key={index} href={ `mailto:${part}` } data-cta>{part}</a>

		return part
	})
}

export const useParser = (htmlContent?: string) => {
	const parsedContent = useMemo(() => {
		if (!htmlContent) return null

		const replace = (domNode: DOMNode) => {
			if (!(domNode instanceof Element) || domNode.name !== 'a') return

			const { attribs: { href, ...domAttrs } } = domNode,
				content = domToReact(domNode.children as DOMNode[], options),
				sharedProps = { ...domAttrs, ['data-cta']: '' }

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

		const content = withEmailLink(htmlContent),
			options = { replace }

		return <>{parse(`${content}`, options)}</>
	}, [htmlContent])

	return parsedContent
}
