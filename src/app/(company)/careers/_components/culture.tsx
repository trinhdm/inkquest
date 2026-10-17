import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import type { CareersContent } from '../_utils/careers.data'
import type { RequireSome } from '@/types/utils'

export const CareersCulture = ({ body, id }: RequireSome<CareersContent, 'body'>) => {
	return (
		<Section id={ id }>
			<Grid columns={ 3 }>
				{ body.map(({ content, id, title }) => (
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
