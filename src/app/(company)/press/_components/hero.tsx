import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

export const PressHero = () => {
	const pageID = 'press'

	return (
		<Section
			eyebrow="Press kit"
			id={ `${pageID}-hero` }
			layout="hero"
			title="Writing about us?"
		>
			<>Everything you need — boilerplate, facts, logos, and photography. For interviews and anything not covered here, email <a href="press@inkquest.com" data-cta>press@inkquest.com</a>.</>

			<Section.Footer>
				<Button>Download full kit (ZIP)</Button>
			</Section.Footer>
		</Section>
	)
}

PressHero.displayName = 'PressHero'
