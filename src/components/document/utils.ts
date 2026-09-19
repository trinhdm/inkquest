import { deepMerge } from '@/utils/helpers'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from './constants'
import type { ColorScheme } from '@/lib/theme'
import type { DeepRequired } from '@/types/utils'

export interface DocumentConfig {
	keys?: {
		localStore?: string
	}
	scheme?: ColorScheme
}

const DEFAULT_DOCUMENT_CONFIG: DeepRequired<DocumentConfig> = {
	keys: { localStore: SCHEME_STORAGE_KEY },
	scheme: DEFAULT_COLOR_SCHEME,
}

function mergeDocuArgs(): typeof DEFAULT_DOCUMENT_CONFIG
function mergeDocuArgs<T extends object>(args: T): T & typeof DEFAULT_DOCUMENT_CONFIG
function mergeDocuArgs(args: object = {}): object {
	return deepMerge(DEFAULT_DOCUMENT_CONFIG, args)
}

export const configDocument = mergeDocuArgs
