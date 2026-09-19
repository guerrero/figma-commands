import {emit, on, showUI} from '@create-figma-plugin/utilities'

import {MIXED_VALUE, buildTextStyleGroups} from './scan'
import type {TextStyleSummaryInput} from './scan'
import type {
  ScanTextStylesHandler,
  SelectTextStyleGroupHandler,
  TextStyleGroup,
  TextStylesScannedHandler,
} from './types'

let latestGroups: Array<TextStyleGroup> = []

export function isFontName(value: unknown): value is FontName {
  return (
    typeof value === 'object' &&
    value !== null &&
    'family' in value &&
    'style' in value &&
    typeof value.family === 'string' &&
    typeof value.style === 'string'
  )
}

export function readTextStyleSummaryInput(
  node: TextNode
): TextStyleSummaryInput {
  let segments: Array<{
    fontName: unknown
    fontSize: unknown
  }>

  try {
    segments = node.getStyledTextSegments(['fontName', 'fontSize'])
  } catch {
    return {
      fontFamilies: MIXED_VALUE,
      fontSizes: MIXED_VALUE,
      fontWeights: MIXED_VALUE,
      nodeId: node.id,
    }
  }

  if (segments.length === 0) {
    segments = [
      {
        fontName: node.fontName,
        fontSize: node.fontSize,
      },
    ]
  }

  const fontFamilies: Array<string> = []
  const fontSizes: Array<number> = []
  const fontWeights: Array<string> = []
  let canReadFontFamilies = true
  let canReadFontSizes = true
  let canReadFontWeights = true

  for (const segment of segments) {
    if (isFontName(segment.fontName)) {
      fontFamilies.push(segment.fontName.family)
      fontWeights.push(segment.fontName.style)
    } else {
      canReadFontFamilies = false
      canReadFontWeights = false
    }
    if (typeof segment.fontSize === 'number') {
      fontSizes.push(segment.fontSize)
    } else {
      canReadFontSizes = false
    }
  }

  return {
    fontFamilies:
      canReadFontFamilies && fontFamilies.length > 0
        ? fontFamilies
        : MIXED_VALUE,
    fontSizes:
      canReadFontSizes && fontSizes.length > 0 ? fontSizes : MIXED_VALUE,
    fontWeights:
      canReadFontWeights && fontWeights.length > 0 ? fontWeights : MIXED_VALUE,
    nodeId: node.id,
  }
}

export function scanCurrentPage(): Array<TextStyleGroup> {
  const textNodes = figma.currentPage.findAll(function (node) {
    return node.type === 'TEXT'
  }) as Array<TextNode>

  return buildTextStyleGroups(textNodes.map(readTextStyleSummaryInput))
}

export function selectTextStyleGroup(
  groups: Array<TextStyleGroup>,
  groupId: string
): void {
  const group = groups.find(function (candidate) {
    return candidate.id === groupId
  })

  if (group === undefined) {
    return
  }

  const nodeIds = new Set(group.nodeIds)
  const matchingNodes = figma.currentPage.findAll(function (node) {
    return nodeIds.has(node.id)
  })

  figma.currentPage.selection = matchingNodes

  if (matchingNodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(matchingNodes)
  }
}

export default function () {
  on<ScanTextStylesHandler>('SCAN_TEXT_STYLES', function () {
    latestGroups = scanCurrentPage()
    emit<TextStylesScannedHandler>('TEXT_STYLES_SCANNED', latestGroups)
  })

  on<SelectTextStyleGroupHandler>(
    'SELECT_TEXT_STYLE_GROUP',
    function (groupId: string) {
      selectTextStyleGroup(latestGroups, groupId)
    }
  )

  showUI({
    height: 360,
    width: 360,
  })
}
