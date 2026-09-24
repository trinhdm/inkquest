import { PREFIX_CSS_SELECTOR } from '@/utils/constants'

export const DEFAULT_TAG = 'div' as const
export const POLYMORPHIC_MARKER = Symbol.for(`${PREFIX_CSS_SELECTOR}.polymorphic`)
