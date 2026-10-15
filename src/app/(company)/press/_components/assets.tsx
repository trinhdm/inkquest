import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Group } from '@/components/layout/Group'
import { Section } from '@/components/layout/Section'
import { ASSETS_LIST } from '../_utils/press.data'
import { SEPARATOR } from '@/utils/constants'
import type { Route } from 'next'

export const PressAssets = () => {
	const pageID = 'press'
	if (!ASSETS_LIST.length) return null

	return (
		<Section
			className="assets"
			eyebrow="Assets"
			id={ `${pageID}-assets` }
			title="Logos & photography."
		>
			<Grid columns={ 2 }>
				{ ASSETS_LIST.map(({
					attachment, content,
					id, title,
				}) => {
					const info: string[] = []
					let href: Route<string> | undefined

					if (attachment) {
						const { url, ...details } = attachment
						if (!!url) href = url

						for (const k of Object.keys(details) as (keyof typeof details)[])
							if (!!details[k]) info.push(details[k])
					}

					return (
						<div key={ `asset-${id}` } className="asset">
							<span className="asset__rail" />
							<Group orientation="horizontal">
								<Group.Item>
									<h3 className="inkq-h5 asset__title">{ title }</h3>
									<p className="asset__content">{ content }</p>
									{ !!info.length && (
										<span className="asset__info">
											{ info.join(SEPARATOR) }
										</span>
									) }
								</Group.Item>

								{ !!href?.length && (
									<Group.Item>
										<Button href={ href } size="sm" variant="outline">
											Download
										</Button>
									</Group.Item>
								) }
							</Group>
						</div>
					)
				}) }
			</Grid>
		</Section>
	)
}

PressAssets.displayName = 'PressAssets'
