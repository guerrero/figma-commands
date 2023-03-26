const ignoreChildrensOf = ['COMPONENT_SET', 'COMPONENT', 'INSTANCE']

let totalModifiedLayers = 0

function removeHiddenELements(node: SceneNode) {
  const current = node

  if ('visible' in current && !current.visible) {
    try {
      current.remove()
    } catch (err) {
      console.error(
        `Error removing element with ID: ${current.id} and name: ${current.name}\n${err}`
      )
    }
    totalModifiedLayers += 1
    return
  }

  if (!ignoreChildrensOf.includes(current.type) && 'children' in current) {
    current.children.forEach((children: SceneNode) => {
      removeHiddenELements(children)
    })
  }
}

function getMessage(target: 'file' | 'selection', modifiedLayers: number) {
  const elementsCopy = modifiedLayers > 1 ? 'elements' : 'element'

  if (modifiedLayers === 0) {
    return `No hidden ${elementsCopy} has been found in current ${target}`
  }

  return `Removed ${modifiedLayers} hidden ${elementsCopy} from current ${target}`
}

export default function () {
  const selectionIsEmpty = figma.currentPage.selection.length === 0
  const target = selectionIsEmpty ? 'file' : 'selection'
  const targetElements = selectionIsEmpty
    ? figma.root.children.flatMap(page => page.children)
    : figma.currentPage.selection

  targetElements.forEach(removeHiddenELements)

  figma.notify(getMessage(target, totalModifiedLayers))
  figma.closePlugin()
}
