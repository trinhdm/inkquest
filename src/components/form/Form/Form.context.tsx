import { createCompoundCtx } from '@/lib/component/context'
import type { FormErrors } from '@/lib/form/types'

export interface FormContext {
	errors: FormErrors
	pending: boolean
}

export const {
	RootProvider: FormProvider,
	useSafeRootCtx: useFormCtx,
	useRootProps: useFormProps,
} = createCompoundCtx<FormContext, 'Form'>('Form')
