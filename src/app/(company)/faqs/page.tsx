'use client'

import { use } from 'react'
import { Accordion } from '@/components/data'
import { Grid, Section } from '@/components/layout'
import { FAQ_ITEMS, resolveFaqGroup } from './faqs.data'

export default function FAQs({ searchParams }: PageProps<'/faqs'>) {
	const pageID = 'faqs'
	const activeGroup = resolveFaqGroup(use(searchParams).category)
	// const [activeCategory, setActiveCategory] = useState(() => categories[0])

	return (
		<>
			<Section
				eyebrow="Company · FAQs"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Questions, answered."
			>
				Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can't find it? Message us.
			</Section>

			<Section
				id={ `${pageID}-list` }
				// title="What we believe."
			>
				<Grid gap="lg">
					{ FAQ_ITEMS.map(({ category, id: faqsID, questions }) => {
						const faqCount = questions.length

						if (activeGroup.id !== faqsID) return null

						return (
							<div id={ faqsID } key={ `category-${faqsID}-group` }>
								<div>
									<h2>{ category }</h2>
									<span className="inkq-eyebrow">{ faqCount } questions</span>
								</div>

								{ faqCount > 0 && (
									<Accordion.Group>
										{ questions.map(({ content, id, title }) => (
											<Accordion id={ id } key={ `faq-${id}` }>
												<Accordion.Title>{ title }</Accordion.Title>
												<Accordion.Content>{ content }</Accordion.Content>
											</Accordion>
										)) }
									</Accordion.Group>
								) }
							</div>
						)
					}) }
				</Grid>
			</Section>

			<Section
				eyebrow="Still need help?"
				id={ `${pageID}-cta` }
				layout="cta"
				title="Ask a human."
			>
				Our support team answers within a day — usually much faster. For booking disputes or safety concerns, head straight to the Support page.

				<Section.Button href="/careers">Open ticket</Section.Button>
				<Section.Button href="/press">Email support</Section.Button>
			</Section>
		</>
	)
}
