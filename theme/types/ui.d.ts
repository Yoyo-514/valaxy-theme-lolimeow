/** 不透明颜色字面量：hex、rgb() 或 hsl()。 */
export type ThemeColorValue = string

/**
 * 品牌与状态颜色。未填写的字段使用主题默认值；状态色独立于品牌色。
 */
export interface ThemeColors {
  /** 品牌原色（天依蓝），@default '#66CCFF' */
  primary?: ThemeColorValue
  /** 次强调色，用于少量点缀，@default '#F6A5C0' */
  accent?: ThemeColorValue
  /** @default '#34C759' */
  success?: ThemeColorValue
  /** @default '#F5A524' */
  warning?: ThemeColorValue
  /** @default '#FF3B30' */
  danger?: ThemeColorValue
  /** 信息状态，@default '#38BDF8' */
  info?: ThemeColorValue
}

/** 按用途覆盖颜色；muted / soft / border 系列允许透明度，其余必须不透明。 */
export interface ThemeColorTokens {
  solid?: string
  solidHover?: string
  onSolid?: string
  text?: string
  textHover?: string
  muted?: string
  soft?: string
  softHover?: string
  borderSubtle?: string
  border?: string
  borderStrong?: string
  focusRing?: string
}

export type ThemeModeTokens = Partial<Record<keyof ThemeColors, ThemeColorTokens>>

/** 只覆盖指定模式与用途，不影响基础色阶或另一种模式。 */
export interface ThemeTokens {
  light?: ThemeModeTokens
  dark?: ThemeModeTokens
}

export interface UI {
  /**
   * 色板配置
   */
  colors?: ThemeColors

  /** 高级语义覆盖，优先于自动派生结果。 */
  tokens?: ThemeTokens

  /**
   * Icon for the light/dark mode toggle button
   */
  toggleDarkBtn?: {
    darkIcon?: string
    lightIcon?: string
  }
}

export type UserUI = UI
