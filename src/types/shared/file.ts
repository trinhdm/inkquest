import type { Route } from 'next'

type FileType =
	'pdf' | 'zip'

export interface FileItem {
	size?: string
	type?: FileType
	url: Route<string>
}
