import { createContext } from 'react'
import type { SiteTheme } from '@/lib/theme'

export const ThemeContext = createContext<SiteTheme | null>(null)
