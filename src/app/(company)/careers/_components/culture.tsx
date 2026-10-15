import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { CULTURE_PILLARS } from '../_utils/careers.data'

export const CareersCulture = () => {
	const pageID = 'careers'
	if (!CULTURE_PILLARS.length) return null

	return (
		<Section id={ `${pageID}-culture` }>
			<Grid columns={ 3 }>
				{ CULTURE_PILLARS.map(({ content, id, title }) => (
					<Grid.Item className="pillar" key={ `${id}-pillar` }>
						<div className="career__rail" />
						<h3 className="inkq-h5">{ title }</h3>
						<p className="career__info">{ content }</p>
					</Grid.Item>
				)) }
			</Grid>
		</Section>
	)
}

CareersCulture.displayName = 'CareersCulture'
