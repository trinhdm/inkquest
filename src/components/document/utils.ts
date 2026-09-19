import {
	DEFAULT_COLOR_SCHEME,
	JS_ANIMATE_KEY,
	SCHEME_STORAGE_KEY,
} from './constants'
import { deepMerge } from '@/utils/helpers'
import type { ColorScheme } from '@/lib/theme'
import type { DeepRequired } from '@/types/utils'

export interface DocumentConfig {
	keys?: {
		jsAnimate?: string
		localStore?: string
	}
	scheme?: ColorScheme
}

const DEFAULT_DOCUMENT_CONFIG: DeepRequired<DocumentConfig> = {
	keys: {
		jsAnimate: JS_ANIMATE_KEY,
		localStore: SCHEME_STORAGE_KEY,
	},
	scheme: DEFAULT_COLOR_SCHEME,
}

function mergeDocuArgs(): typeof DEFAULT_DOCUMENT_CONFIG
function mergeDocuArgs<T extends object>(args: T): T & typeof DEFAULT_DOCUMENT_CONFIG
function mergeDocuArgs(args: object = {}): object {
	return deepMerge(DEFAULT_DOCUMENT_CONFIG, args)
}

export const configDocument = mergeDocuArgs
