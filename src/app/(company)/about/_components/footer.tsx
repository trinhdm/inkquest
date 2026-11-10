import { Button } from '@/components/core/Button'
import { NavRoutes } from '@/utils/navigation'
import { Section } from '@/components/layout/Section'

export const AboutFooter = () => {
	const pageID = 'about'

	return (
		<Section
			eyebrow="Careers · Brooklyn + remote"
			id={ `${pageID}-banner` }
			layout="banner"
			title="Do your best work here."
		>
			We&apos;re a growing team in Brooklyn hiring across engineering, community, and artist relations.

			<Section.Footer>
				<Button href={ NavRoutes.COMPANY_CAREERS }>See open roles</Button>
				<Button href={ NavRoutes.COMPANY_PRESS }>Get the press kit</Button>
			</Section.Footer>
		</Section>
	)
}

AboutFooter.displayName = 'AboutFooter'
