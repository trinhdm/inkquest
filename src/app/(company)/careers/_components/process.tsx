import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import type { CareersContent } from '../_utils/careers.data'

export const CareersProcess = ({
	body,
	eyebrow,
	heading,
	id,
}: CareersContent) => {
	if (!body?.length) return null

	return (
		<Section
			eyebrow={ eyebrow }
			id={ id }
			title={ heading }
		>
			<Grid columns={ 4 }>
				{ body.map(({ content, id, title }, i) => {
					const index = i + 1,
						step = index > 9 ? index : `0${index}`

					return (
						<Grid.Item
							className="step"
							key={ `${id}-pillar` }
						>
							<div className="career__rail" />
							<span className="career__label">{ step }</span>
							<h3 className="inkq-h5">{ title }</h3>
							<p className="career__info">{ content }</p>
						</Grid.Item>
					)
				}) }
			</Grid>
		</Section>
	)
}

CareersProcess.displayName = 'CareersProcess'
