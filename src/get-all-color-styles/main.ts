const STYLE_ID_PROPERTIES = ['fillStyleId', 'strokeStyleId'] as const

const colorStyleIds: string[] = []

function collectItemColorStyles(node: SceneNode) {
  // TODO: Remove styles from text ranges

  return (
    styleIds: string[],
    styleIdProperty: (typeof STYLE_ID_PROPERTIES)[number]
  ) => {
    const styleId = (node as any)[styleIdProperty]
    const nodeHasStyle = styleIdProperty in node && styleId !== ''
    const styleHasNotBeenCollected = !styleIds.includes(styleId)
    const isNotMixedStyle = styleId !== figma.mixed

    if (nodeHasStyle && styleHasNotBeenCollected && isNotMixedStyle) {
      styleIds.push(styleId)
    }

    return styleIds
  }
}

function collectColorStyles(node: SceneNode) {
  STYLE_ID_PROPERTIES.reduce(collectItemColorStyles(node), colorStyleIds)

  if ('children' in node) {
    node.children.forEach((children: SceneNode) => {
      collectColorStyles(children)
    })
  }
}

function rgbToHex(r: number, g: number, b: number) {
  function toHex(c: number) {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return '#' + toHex(r) + toHex(g) + toHex(b)
}

function getColorStyleInfo(id: string) {
  const style = figma.getStyleById(id)

  if (style && style.type === 'PAINT') {
    const paintStyle = style as PaintStyle
    const firstPaint = paintStyle.paints[0]

    if (firstPaint && firstPaint.type === 'SOLID') {
      const name = style.name
      const r = firstPaint.color.r
      const g = firstPaint.color.g
      const b = firstPaint.color.b
      const hexCode = rgbToHex(r, g, b)
      return `Name: ${name}. Color: ${hexCode}`
    }
  }
}

function getAllColorStylesInfo(colorStyleIds: string[]) {
  const colorStylesInfo = colorStyleIds.map(getColorStyleInfo).join('\n')

  return colorStylesInfo
}

function getMessage() {
  if (colorStyleIds.length === 0) return 'No color styles found'

  console.log(getAllColorStylesInfo(colorStyleIds))

  return 'Done'
}

export default function () {
  figma.currentPage.children.forEach(collectColorStyles)

  figma.closePlugin(getMessage())
}
