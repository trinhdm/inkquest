import { buildScript } from './buildScript'
import type { ComponentProps } from 'react'
import type { ColorScheme } from '@/lib/theme'

interface ScriptInjectorProps
	extends ComponentProps<'script'> {
	defaultScheme?: ColorScheme
}

export const ScriptInjector = ({
	defaultScheme,
	...props
}: ScriptInjectorProps) => {
	const script = buildScript({ scheme: defaultScheme })

	return (
		<script
			{ ...props }
			data-scheme-script
			dangerouslySetInnerHTML={{ __html: script }}
		/>
	)
}

ScriptInjector.displayName = 'ScriptInjector'
