import { createCompoundCtx } from '@/lib/component/context'

export type FormErrors =
	Record<string, string | undefined>

export interface FormContext {
	errors: FormErrors
	pending: boolean
}

export const {
	RootProvider: FormProvider,
	useSafeRootCtx: useFormCtx,
	useRootProps: useFormProps,
} = createCompoundCtx<FormContext, 'Form'>('Form')
