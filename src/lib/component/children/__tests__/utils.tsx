import type { FC, ReactNode } from 'react'

export const Anonymous: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
// intentionally no displayName

export const Named: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
Named.displayName = 'Named'

export const OtherNamed: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
OtherNamed.displayName = 'OtherNamed'
