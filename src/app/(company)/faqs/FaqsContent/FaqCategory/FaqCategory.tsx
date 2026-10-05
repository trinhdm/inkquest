'use client'

import { countFaqs, type FaqGroup } from '../../faqs.data'
import { highlightText } from '@/lib/component'
import { Accordion } from '@/components/data/Accordion'
import { Section } from '@/components/layout/Section'

interface FaqCategoryProps {
	group: FaqGroup
	terms?: string[]
}

export const FaqCategory = ({
	group,
	terms,
}: FaqCategoryProps) => {
	const { category, id, questions } = group

	const count = countFaqs([group]),
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
								{ !!terms?.length ? highlightText(title, terms) : title }
							</Accordion.Title>
							<Accordion.Content>
								{ !!terms?.length ? highlightText(content, terms) : content }
							</Accordion.Content>
						</Accordion>
					)) }
				</Accordion.Group>
			) : (
				<div className="faq-content">
					<p>Nothing here yet. Check back soon.</p>
				</div>
			) }
		</Section>
	)
}

FaqCategory.displayName = 'FaqCategory'
