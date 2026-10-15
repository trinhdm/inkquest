import { Accordion } from '@/components/data/Accordion'
import { Section } from '@/components/layout/Section'
import { COMPANY_VALUES } from '../_utils/about.data'

export const AboutValues = () => {
	const pageID = 'about'
	if (!COMPANY_VALUES.length) return null

	return (
		<Section
			eyebrow="Values"
			id={ `${pageID}-values` }
			title="What we believe."
		>
			<Accordion.Group layout="steps" size="lg">
				{ COMPANY_VALUES.map(({ content, id, title }) => (
					<Accordion id={ id } key={ `${id}-value` }>
						<Accordion.Title>{ title }</Accordion.Title>
						<Accordion.Content>{ content }</Accordion.Content>
					</Accordion>
				)) }
			</Accordion.Group>
		</Section>
	)
}

AboutValues.displayName = 'AboutValues'
