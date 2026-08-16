import { createContext } from 'react'
import type { SiteTheme } from './theme.types'

export const ThemeContext = createContext<SiteTheme | null>(null)
