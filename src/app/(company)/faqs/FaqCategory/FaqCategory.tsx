'use client'

import { createElement, type ReactNode } from 'react'
import { Accordion } from '@/components/data/Accordion'
import { Section } from '@/components/layout/Section'
import type { FaqGroup } from '../faqs.data'

interface FaqCategoryProps {
	group: FaqGroup
	terms?: string[]
}

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g
const escapeTerm = (term: string): string => term.replace(ESCAPE_REGEX, '\\$&')

export const highlightMatch = (text: string, terms: string[]): ReactNode => {
	if (!terms.length) return text

	const pattern = new RegExp(`(${terms.map(escapeTerm).join('|')})`, 'gi')
	const parts = text.split(pattern)

	return parts.map((part, index) => (
		index % 2 === 1
			? createElement('mark', { key: `${ index }-${ part }` }, part)
			: part
	))
}

export const FaqCategory = ({
	group,
	terms,
}: FaqCategoryProps) => {
	const { category, id, questions } = group
	const count = questions.length,
		headingID = `${id}-heading`

	return (
		<Section
			unstyled
			attributes={ { aria: { labelledby: headingID } } }
			className="faq-category-group"
			id={ id }
		>
			<div className="faq-heading">
				<h2 id={ headingID }>{ category }</h2>
				<span className="inkq-eyebrow">{ count } question{ count === 1 ? '' : 's' }</span>
			</div>

			{ count > 0 ? (
				<Accordion.Group>
					{ questions.map(({ content, id, title }) => (
						<Accordion id={ id } key={ `faq-${id}` }>
							<Accordion.Title>
								{ !!terms?.length ? highlightMatch(title, terms) : title }
							</Accordion.Title>
							<Accordion.Content>
								{ content }
							</Accordion.Content>
						</Accordion>
					)) }
				</Accordion.Group>
			) : (
				<p>Nothing here yet. Check back soon.</p>
			) }
		</Section>
	)
}
