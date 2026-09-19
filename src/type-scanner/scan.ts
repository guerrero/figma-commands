import type {TextStyleGroup} from './types'

export const MIXED_VALUE = 'Mixed'

export type EnumeratedValue<T> = ReadonlyArray<T> | typeof MIXED_VALUE

export interface TextStyleSummaryInput {
  nodeId: string
  fontFamilies: EnumeratedValue<string>
  fontSizes: EnumeratedValue<number>
  fontWeights: EnumeratedValue<string>
}

export interface TextStyleSummary {
  nodeId: string
  fontFamily: string
  fontFamilyKey: string | Array<string> | typeof MIXED_VALUE
  fontSize: string
  fontSizeKey: number | typeof MIXED_VALUE
  fontWeight: string
  fontWeightKey: string | typeof MIXED_VALUE
  sortSize: number | null
}

export function formatFamilyList(fontFamilies: ReadonlyArray<string>): string {
  if (fontFamilies.length === 0) {
    return MIXED_VALUE
  }
  if (fontFamilies.length === 1) {
    return fontFamilies[0]
  }
  if (fontFamilies.length === 2) {
    return `${fontFamilies[0]} and ${fontFamilies[1]}`
  }
  return `${fontFamilies.slice(0, -1).join(', ')} and ${
    fontFamilies[fontFamilies.length - 1]
  }`
}

export function getUniqueValues<T>(values: ReadonlyArray<T>): Array<T> {
  return Array.from(new Set(values))
}

export function getNormalizedFontFamilies(
  fontFamilies: ReadonlyArray<string>
): Array<string> {
  return getUniqueValues(fontFamilies).sort(function (a, b) {
    return a.localeCompare(b)
  })
}

export function summarizeTextStyle(
  input: TextStyleSummaryInput
): TextStyleSummary {
  const fontFamilyKey =
    input.fontFamilies === MIXED_VALUE
      ? MIXED_VALUE
      : getFontFamilyKey(getNormalizedFontFamilies(input.fontFamilies))
  const fontFamily =
    fontFamilyKey === MIXED_VALUE
      ? MIXED_VALUE
      : formatFamilyList(
          Array.isArray(fontFamilyKey) ? fontFamilyKey : [fontFamilyKey]
        )
  const uniqueFontSizes =
    input.fontSizes === MIXED_VALUE
      ? MIXED_VALUE
      : getUniqueValues(input.fontSizes)
  const fontSizeKey =
    uniqueFontSizes === MIXED_VALUE || uniqueFontSizes.length !== 1
      ? MIXED_VALUE
      : uniqueFontSizes[0]
  const fontSize =
    fontSizeKey === MIXED_VALUE ? MIXED_VALUE : `${fontSizeKey}px`
  const sortSize = fontSizeKey === MIXED_VALUE ? null : fontSizeKey
  const uniqueFontWeights =
    input.fontWeights === MIXED_VALUE
      ? MIXED_VALUE
      : getUniqueValues(input.fontWeights)
  const fontWeightKey =
    uniqueFontWeights === MIXED_VALUE || uniqueFontWeights.length !== 1
      ? MIXED_VALUE
      : uniqueFontWeights[0]
  const fontWeight = fontWeightKey

  return {
    fontFamily,
    fontFamilyKey,
    fontSize,
    fontSizeKey,
    fontWeight,
    fontWeightKey,
    nodeId: input.nodeId,
    sortSize,
  }
}

export function getGroupId(summary: TextStyleSummary): string {
  return JSON.stringify([
    summary.fontFamilyKey,
    summary.fontSizeKey,
    summary.fontWeightKey,
  ])
}

function getFontFamilyKey(fontFamilies: Array<string>): string | Array<string> {
  return fontFamilies.length === 1 ? fontFamilies[0] : fontFamilies
}

export function buildTextStyleGroups(
  inputs: ReadonlyArray<TextStyleSummaryInput>
): Array<TextStyleGroup> {
  const groupsById = new Map<string, TextStyleGroup>()

  for (const input of inputs) {
    const summary = summarizeTextStyle(input)
    const id = getGroupId(summary)
    const existingGroup = groupsById.get(id)

    if (existingGroup !== undefined) {
      existingGroup.count += 1
      existingGroup.nodeIds.push(summary.nodeId)
      continue
    }

    groupsById.set(id, {
      count: 1,
      fontFamily: summary.fontFamily,
      fontSize: summary.fontSize,
      fontWeight: summary.fontWeight,
      id,
      nodeIds: [summary.nodeId],
      sortSize: summary.sortSize,
    })
  }

  return Array.from(groupsById.values()).sort(function (a, b) {
    if (a.sortSize === null && b.sortSize === null) {
      return compareTextStyleGroups(a, b)
    }
    if (a.sortSize === null) {
      return 1
    }
    if (b.sortSize === null) {
      return -1
    }
    const sortSizeComparison = b.sortSize - a.sortSize
    if (sortSizeComparison !== 0) {
      return sortSizeComparison
    }
    return compareTextStyleGroups(a, b)
  })
}

function compareTextStyleGroups(a: TextStyleGroup, b: TextStyleGroup): number {
  const fontFamilyComparison = a.fontFamily.localeCompare(b.fontFamily)
  if (fontFamilyComparison !== 0) {
    return fontFamilyComparison
  }

  const fontSizeComparison = a.fontSize.localeCompare(b.fontSize)
  if (fontSizeComparison !== 0) {
    return fontSizeComparison
  }

  const fontWeightComparison = a.fontWeight.localeCompare(b.fontWeight)
  if (fontWeightComparison !== 0) {
    return fontWeightComparison
  }

  return a.id.localeCompare(b.id)
}
