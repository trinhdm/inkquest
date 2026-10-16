import { useFaqsCtx } from '../_utils/faqs.context'
import { useParser } from '@/hooks/useParser'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

export const FaqsFooter = () => {
	const {
		data: { footer },
		pageID,
	} = useFaqsCtx()

	const footerBody = useParser(footer?.body)
	if (!footer) return null

	return (
		<Section
			eyebrow={ footer.eyebrow }
			id={ `${pageID}-banner` }
			layout="banner"
			title={ footer.heading }
		>
			{ footerBody }

			{ footer.buttons?.length && (
				<Section.Footer>
					{ (footer.buttons).map(({ id, label, url }) => (
						<Button key={ id } href={ url }>{ label }</Button>
					)) }
				</Section.Footer>
			) }
		</Section>
	)
}

FaqsFooter.displayName = 'FaqsFooter'
