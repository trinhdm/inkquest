import { Section } from '@/components/layout/Section'
import { Timeline } from '@/components/data/Timeline'
import { STORY_TIMELINE } from '../_utils/about.data'

export const AboutTimeline = () => {
	const pageID = 'about'
	if (!STORY_TIMELINE.length) return null

	return (
		<Section
			eyebrow="Our story"
			id={ `${pageID}-story` }
			layout="split"
			title="From a flash sheet to parlor."
		>
			<Timeline>
				{ STORY_TIMELINE.map(step => <Timeline.Item key={ step.id } { ...step } />) }
			</Timeline>
		</Section>
	)
}

AboutTimeline.displayName = 'AboutTimeline'
