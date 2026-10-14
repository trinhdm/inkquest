import type { AriaAttributes } from 'react'

//	html tags

export type HeadingOrder =
	1 | 2 | 3 | 4 | 5

export type Heading =
	`h${HeadingOrder}`

type _CommonHtmlTag =
	| 'a' | 'button'
	| 'article' | 'blockquote'
	| 'aside' | 'header' | 'footer' | 'nav'
	| 'canvas' | 'img' | 'video'
	| 'details' | 'summary'
	| 'dialog' | 'progress'
	| 'div' | 'section'
	| 'form' | 'label'
	| 'input' | 'option' | 'select' | 'textarea'
	| 'menu' | 'ol' | 'ul' | 'li'
	| 'p' | 'span'
	| Heading

type _CommonSvgTag =
	| 'circle' | 'line' | 'rect'
	| 'mask' | 'title'
	| 'path' | 'svg'

export type TagDictionary =
	& Pick<HTMLElementTagNameMap, _CommonHtmlTag>
	& Pick<SVGElementTagNameMap, _CommonSvgTag>


//	aria

type RemoveAriaPrefix<T> = {
	[K in keyof T as K extends `aria-${infer Rest}` ? Rest : never]: T[K]
}

export type AriaName =
	RemoveAriaPrefix<AriaAttributes>

export type Orientation =
	AriaAttributes['aria-orientation']
