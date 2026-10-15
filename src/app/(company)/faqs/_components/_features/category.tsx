import { countFaqs } from '../../_utils'
import { highlightText } from '@/lib/component/children'
import { Accordion } from '@/components/data/Accordion'
import { Section } from '@/components/layout/Section'
import type { FaqGroup } from '../../_utils/faqs.data'

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
			className="faq__category"
			id={ id }
		>
			<div className="faq__heading">
				<h2 id={ headingID }>{ category }</h2>
				<span className="faq__count">{ count } question{ count === 1 ? '' : 's' }</span>
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
				<div className="faq__content">
					<p>Nothing here yet. Check back soon.</p>
				</div>
			) }
		</Section>
	)
}

FaqCategory.displayName = 'FaqCategory'
