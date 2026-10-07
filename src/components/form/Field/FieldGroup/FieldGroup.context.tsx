import { createCompoundCtx } from '@/lib/component/context'
import type { Field } from '../Field'

type SharedFieldProp =
	| 'labelPosition'

export interface FieldGroupContext
	extends Pick<Field.Props, SharedFieldProp> {
	index: number
	unstyled?: boolean
}

export const {
	RootProvider: FieldGroupProvider,
	useSafeRootCtx: useFieldGroupCtx,
	useRootProps: useFieldGroupProps,
} = createCompoundCtx<FieldGroupContext>('Field.Group')
