import { useFaqsCtx, type FaqsContext } from '../_utils/faqs.context'
import { useParser } from '@/hooks/useParser'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import type { RequireSome } from '@/types/utils'

export const FaqsFooter = () => {
	const { data, pageID } = useFaqsCtx()
	const { footer } = data as RequireSome<FaqsContext['data'], 'footer'>

	return (
		<Section
			eyebrow={ footer.eyebrow }
			id={ `${pageID}-${footer.id}` }
			layout={ footer.layout ?? 'banner' }
			title={ footer.heading }
		>
			{ useParser(footer.body) }

			{ footer.buttons?.length && (
				<Section.Footer>
					{ (footer.buttons).map(({ id, label, url, ...props }) => (
						<Button key={ id } href={ url } { ...props }>{ label }</Button>
					)) }
				</Section.Footer>
			) }
		</Section>
	)
}

FaqsFooter.displayName = 'FaqsFooter'
