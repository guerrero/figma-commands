const STYLE_ID_PROPERTIES = [
  'gridStyleId',
  'textStyleId',
  'fillStyleId',
  'strokeStyleId',
  'effectStyleId',
] as const

let totalUnlinkedStyles = 0
let totalModifiedLayers = 0

function unlinkStyle(node: SceneNode) {
  // TODO: Remove styles from text ranges

  return (
    total: number,
    styleIdProperty: (typeof STYLE_ID_PROPERTIES)[number]
  ) => {
    if (styleIdProperty in node && (node as any)[styleIdProperty] !== '') {
      ;(node as any)[styleIdProperty] = ''
      return total + 1
    }

    return total
  }
}

function unlinkStyles(node: SceneNode) {
  const totalChangesApplied = STYLE_ID_PROPERTIES.reduce(unlinkStyle(node), 0)

  if (totalChangesApplied > 0) {
    totalUnlinkedStyles += totalChangesApplied
    totalModifiedLayers += 1
  }

  if ('children' in node) {
    node.children.forEach((children: SceneNode) => {
      unlinkStyles(children)
    })
  }
}

function getMessage() {
  const stylesCopy = totalUnlinkedStyles > 1 ? 'styles' : 'style'
  const elementsCopy = totalModifiedLayers > 1 ? 'elements' : 'element'
  const fullStylesCopy = `${totalUnlinkedStyles} ${stylesCopy}`
  const fullElementsCopy = `${totalModifiedLayers} ${elementsCopy}`
  const message = `Removed ${fullStylesCopy} from ${fullElementsCopy}`

  return message
}

export default function () {
  const selection = figma.currentPage.selection

  if (selection.length === 0) {
    return figma.notify('Select at least one element to unlink styles')
  }

  selection.forEach(unlinkStyles)

  if (totalUnlinkedStyles === 0) return figma.notify('No linked styles found')

  figma.closePlugin(getMessage())
}
