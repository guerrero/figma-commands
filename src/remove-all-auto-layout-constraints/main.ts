const SUPPORTED_NODE_TYPES = ['COMPONENT_SET', 'COMPONENT', 'FRAME', 'GROUP', 'SECTION']

let totalModifiedElements = 0

function removeAutoLayout(node: SceneNode) {
  if (!SUPPORTED_NODE_TYPES.includes(node.type)) return

  const current = node

  if ('layoutMode' in current) {
    current.layoutMode = 'NONE'
    totalModifiedElements += 1
  }

  if ('children' in current) {
    current.children.forEach((children: SceneNode) => {
      removeAutoLayout(children)
    })
  }
}

function getMessage() {
  const elementsCopy = totalModifiedElements > 1 ? 'elements' : 'element'

  return `Removed auto layout from ${totalModifiedElements} ${elementsCopy}`
}

export default function () {
  const selection = figma.currentPage.selection

  if (selection.length === 0) {
    return figma.notify('Select at least one element to remove autolayout')
  }

  selection.forEach(removeAutoLayout)

  if (totalModifiedElements === 0) return figma.notify('No elements where auto layout can be remove has been found')

  figma.notify(getMessage())
  figma.closePlugin()
}
