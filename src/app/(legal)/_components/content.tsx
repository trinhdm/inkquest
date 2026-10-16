import { useMemo } from 'react'
import { useActiveID } from '@/hooks/useActiveID'
import { getLegalTitles } from '../_utils'
import { Grid } from '@/components/layout/Grid'
import { LegalSection } from './_features/section'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import type { LegalPageData } from '../_utils/legal.types'

export const LegalContent = ({ content, id: pageID }: LegalPageData) => {
	const { ids, sections, titles } = useMemo(() => {
		const sections = content.filter(({ title }) => !!title),
			titles = getLegalTitles(pageID, sections)

		return { ids: titles.map(({ id }) => id), sections, titles }
	}, [pageID, content])

	const [activeID, selectID] = useActiveID(ids)
	if (!content.length) return null

	return (
		<Section animated={ false } id={ `${pageID}-sections` }>
			<Grid layout="sidebar">
				<Sidebar
					active={ activeID }
					items={ titles }
					label="On this page"
					onChange={ selectID }
					scroll={ true }
					shallow={ false }
				/>

				<Grid.Item className="legal-content">
					{ content.map(section => {
						const index = sections.findIndex(({ id }) => section.id === id),
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
