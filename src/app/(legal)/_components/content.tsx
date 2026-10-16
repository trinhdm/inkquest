import { useMemo } from 'react'
import { useActiveID } from '@/hooks/useActiveID'
import { getLegalTitles } from '../_utils'
import { Grid } from '@/components/layout/Grid'
import { LegalSection } from './_features/section'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import type { LegalPageData } from '../_utils/legal.types'

export const LegalContent = ({ id: pageID, sections }: LegalPageData) => {
	const { content, ids, titles } = useMemo(() => {
		const content = sections.filter(({ title }) => !!title),
			titles = getLegalTitles(pageID, content)

		return { content, titles, ids: titles.map(({ id }) => id) }
	}, [pageID, sections])

	const [activeID, selectID] = useActiveID(ids)
	if (!sections.length) return null

	return (
		<Section animated={ false } id={ `${pageID}-content` }>
			<Grid gap="lg" layout="sidebar">
				<Sidebar
					active={ activeID }
					items={ titles }
					label="On this page"
					onChange={ selectID }
					scroll={ true }
					shallow={ false }
				/>

				<Grid.Item className="legal-content">
					{ sections.map(section => {
						const index = content.findIndex(({ id }) => section.id === id),
							isIntro = index === -1

						return (
							<LegalSection
								{ ...section }
								index={ index }
								key={ section.id }
								title={ isIntro ? undefined : titles[index].label }
							/>
						)
					}) }
				</Grid.Item>
			</Grid>
		</Section>
	)
}

LegalContent.displayName = 'LegalContent'
