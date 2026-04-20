const WIDTH_REGEX = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem)?$/i

export function clampColumnCount(value: unknown) {
  const count = Number(value)

  if (!Number.isFinite(count))
    return 1

  return Math.min(6, Math.max(1, Math.floor(count)))
}

export function resolveLengthToPx(value: number | string | undefined, fallback = 288, rootFontSize = 16) {
  if (typeof value === 'number' && Number.isFinite(value))
    return value

  const raw = String(value ?? '').trim()
  const match = raw.match(WIDTH_REGEX)

  if (!match)
    return fallback

  const amount = Number(match[1])
  const unit = (match[2] ?? 'px').toLowerCase()

  if (unit === 'rem')
    return amount * rootFontSize

  return amount
}

export function resolveGridColumnCount(
  containerWidth: number,
  minCardWidthPx: number,
  maxColumns: number,
  gapPx: number,
) {
  if (!containerWidth)
    return 1

  const fittedColumns = Math.floor((containerWidth + gapPx) / (minCardWidthPx + gapPx))
  return Math.max(1, Math.min(maxColumns, fittedColumns || 1))
}
