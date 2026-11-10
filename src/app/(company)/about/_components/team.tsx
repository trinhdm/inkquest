import { Card } from '@/components/core/Card'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { SEPARATOR } from '@/utils/constants'
import { TEAM_MEMBERS } from '../_utils/about.data'

export const AboutTeam = () => {
	const pageID = 'about'
	if (!TEAM_MEMBERS.length) return null

	return (
		<Section
			eyebrow="Team"
			id={ `${pageID}-team` }
			title="The crew."
		>
			<Grid columns={ 3 }>
				{ TEAM_MEMBERS.map(({ id, name, role }) => (
					<Card
						key={ `${id}-member` }
						title={ name }
						caption={ role?.join(SEPARATOR) }
					/>
				)) }
			</Grid>
		</Section>
	)
}

AboutTeam.displayName = 'AboutTeam'
