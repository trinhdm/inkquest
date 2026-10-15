import { Section } from '@/components/layout/Section'
import { Statistic } from '@/components/data/Statistic'
import { COMPANY_STATS } from '../_utils/press.data'

export const PressStats = () => {
	const pageID = 'press'
	if (!COMPANY_STATS.length) return null

	return (
		<Section id={ `${pageID}-stats` } layout="blocks">
			<Statistic.Group animated={ false } order="ascend" size="sm">
				{ COMPANY_STATS.map(({ isHighlight, ...stat }) => (
					<Statistic key={ stat.id } highlight={ isHighlight } { ...stat } />
				)) }
			</Statistic.Group>
		</Section>
	)
}

PressStats.displayName = 'PressStats'
