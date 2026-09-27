'use client'

import { Accordion } from '@/components/data'
import { Section } from '@/components/layout'
import type { FaqGroup } from '../faqs.data'

interface FaqCategoryProps {
	group: FaqGroup
}

export const FaqCategory = ({ category, id, questions }: FaqGroup) => {
	const count = questions.length,
		headingID = `${id}-heading`

	return (
		<Section
			unstyled
			attributes={ { aria: { labelledby: headingID } } }
			id={ id }
		>
			<div className="inkq-heading">
				<h2 id={ headingID }>{ category }</h2>
				<span className="inkq-eyebrow">{ count } question{ count === 1 ? '' : 's' }</span>
			</div>

			{ count > 0 ? (
				<Accordion.Group>
					{ questions.map(({ content, id, title }) => (
						<Accordion id={ id } key={ `faq-${id}` }>
							<Accordion.Title>{ title }</Accordion.Title>
							<Accordion.Content>{ content }</Accordion.Content>
						</Accordion>
					)) }
				</Accordion.Group>
			) : (
				<p>Nothing here yet. Ask us directly and we'll answer.</p>
			) }
		</Section>
	)
}
