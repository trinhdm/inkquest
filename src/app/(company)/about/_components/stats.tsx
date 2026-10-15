import { Section } from '@/components/layout/Section'
import { Statistic } from '@/components/data/Statistic'
import { PLATFORM_STATS } from '../_utils/about.data'

export const AboutStats = () => {
	const pageID = 'about'
	if (!PLATFORM_STATS.length) return null

	return (
		<Section id={ `${pageID}-stats` } layout="blocks">
			<Statistic.Group>
				{ PLATFORM_STATS.map(({ isHighlight, ...stat }) => (
					<Statistic key={ stat.id } highlight={ isHighlight } { ...stat } />
				)) }
			</Statistic.Group>
		</Section>
	)
}

AboutStats.displayName = 'AboutStats'
