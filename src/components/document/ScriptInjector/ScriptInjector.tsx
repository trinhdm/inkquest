import { buildScript } from './buildScript'
import type { ComponentProps } from 'react'
import type { DocumentConfig } from '../utils'

interface ScriptInjectorProps
	extends ComponentProps<'script'>, Pick<DocumentConfig, 'scheme'> {}

export const ScriptInjector = ({
	scheme,
	...props
}: ScriptInjectorProps) => {
	const script = buildScript({ scheme })

	return (
		<script
			{ ...props }
			data-scheme-script
			dangerouslySetInnerHTML={{ __html: script }}
		/>
	)
}

ScriptInjector.displayName = 'ScriptInjector'
