import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { PRESS_QUOTES } from '../_utils/about.data'

export const AboutQuotes = () => {
	const pageID = 'about'
	if (!PRESS_QUOTES.length) return null

	return (
		<Section
			eyebrow="Press"
			id={ `${pageID}-quotes` }
			title="In the press."
		>
			<Grid columns={ 3 }>
				{ PRESS_QUOTES.map(({ author, id, title }) => (
					<div className="quote" id={ id } key={ `${id}-quote` }>
						<span className="quote__rail" />
						<p className="inkq-h5 quote__content">&quot;{ title }&quot;</p>
						<h3 className="quote__author">{ author }</h3>
					</div>
				)) }
			</Grid>

			<Section.Footer>
				<Button href="/press" variant="outline">See all press mentions</Button>
			</Section.Footer>
		</Section>
)
}

AboutQuotes.displayName = 'AboutQuotes'
