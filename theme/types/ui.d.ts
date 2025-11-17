export interface UI {
  /**
   * primary color
   * @default '#0078E7'
   */
  primary: string

  toggleLocaleBtn?: {
    icon: string
  }

  /**
   * Icon for the light/dark mode toggle button
   */
  toggleDarkBtn?: {
    darkIcon?: string
    lightIcon?: string
  }
}

export interface ResponsiveBreakpoints {
  'sm': number
  'md': number
  'lg': number
  'xl': number
  '2xl': number
}

export type UserUI = {
  [K in keyof UI]?: Partial<UI[K]>
}
