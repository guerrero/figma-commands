let totalModifiedElements = 0

function removeHiddenELements(node: SceneNode) {
  const current = node

  if ('visible' in current && !current.visible) {
    current.remove()
    totalModifiedElements += 1
    return
  }

  if ('children' in current) {
    current.children.forEach((children: SceneNode) => {
      removeHiddenELements(children)
    })
  }
}

function getMessage(target: 'file' | 'selection', totalModifiedElements: number) {
  const elementsCopy = totalModifiedElements > 1 ? 'elements' : 'element'

  if (totalModifiedElements === 0) {
    return `No hidden ${elementsCopy} has been found in current ${target}`
  }

  return `Removed ${totalModifiedElements} hidden ${elementsCopy} from current ${target}`
}

export default function () {
  const selectionIsEmpty = figma.currentPage.selection.length === 0
  const target = selectionIsEmpty ? 'file' : 'selection'
  const targetElements = selectionIsEmpty
    ? figma.currentPage.selection
    : figma.root.children.flatMap(page => page.children)

  targetElements.forEach(removeHiddenELements)

  figma.notify(getMessage(target, totalModifiedElements))
  figma.closePlugin()
}
