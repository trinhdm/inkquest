import { Archivo, Archivo_Black, Space_Mono } from 'next/font/google'

// Shared by `src/app/layout.tsx` and `.storybook/preview.tsx`, so the app and
// Storybook load the same fonts. Importing this file is what adds the
// `@font-face` rules. The theme names the fonts directly (`'Archivo'` in
// `FONT_FAMILY_SCALE`, `lib/theme/scales.ts`), which works because `next/font`
// keeps each font's real family name.

/** Body and UI text. */
export const archivo = Archivo({
	variable: '--font-archivo',
	weight: ['400', '600', '700'],
	subsets: ['latin'],
})

/** Display headings. */
export const archivoBlack = Archivo_Black({
	variable: '--font-archivo-black',
	weight: '400',
	subsets: ['latin'],
})

/** Labels, numbers and code. */
export const spaceMono = Space_Mono({
	variable: '--font-space-mono',
	weight: ['400', '700'],
	subsets: ['latin'],
})

/** Class names that declare each font's CSS variable. Put them on `<html>`. */
export const fontVariables = `${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable}`
