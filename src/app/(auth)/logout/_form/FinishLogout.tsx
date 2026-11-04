'use client'

import { useForm } from '@/hooks/form'
import { useLogoutCtx } from '../_utils/context'
import { getFirstName } from '../../_utils/helpers'
import { initFormState } from '@/lib/form'
import { swapAccount, transferAccount } from '../_utils/actions'
import { AccountCard } from '../../_components/AccountCard'
import { AuthForm } from '../../_components/AuthForm'
import { SHARED_CONTINUE_PROPS } from '../_utils/data'

export const FinishLogout = () => {
	const { account, content, idx } = useLogoutCtx()
	const firstName = getFirstName(account)

	const transfer = useForm(transferAccount, initFormState),
		swap = useForm(swapAccount, initFormState),
		pending = transfer.pending || swap.pending

	return (
		<AuthForm action={ transfer.action } idx={ idx } pending={ pending }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
			</AuthForm.Header>

			<AccountCard account={ account }>
				<AuthForm.Submit
					fullWidth
					disabled={ pending }
					label={ firstName ? `Continue as ${firstName}` : 'Continue' }
					loading={ transfer.pending }
				/>
			</AccountCard>

			<AuthForm.Footer>
				<AuthForm.Alternate
					as="auth"
					data-intent="swap"
					disabled={ pending }
					formAction={ swap.action }
					loading={ swap.pending }
				/>

				<AuthForm.Note>
					<AuthForm.Continue { ...SHARED_CONTINUE_PROPS } />
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

FinishLogout.displayName = 'FinishLogout'
