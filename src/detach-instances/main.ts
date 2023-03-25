const SUPPORTED_NODE_TYPES = ['COMPONENT_SET', 'COMPONENT', 'FRAME', 'GROUP', 'INSTANCE', 'SECTION']

let totalDetachedInstances = 0

function detachInstances(node: SceneNode) {
  if (!SUPPORTED_NODE_TYPES.includes(node.type)) return

  let current = node

  if (current.type === 'INSTANCE') {
    current = current.detachInstance()
    totalDetachedInstances += 1
  }

  if ('children' in current) {
    current.children.forEach((children: SceneNode) => {
      detachInstances(children)
    })
  }
}

function getMessage() {
  const instancesCopy = totalDetachedInstances > 1 ? 'instances' : 'instance'

  return `Detached ${totalDetachedInstances} ${instancesCopy}`
}

export default function () {
  const selection = figma.currentPage.selection

  if (selection.length === 0) {
    return figma.notify('Select at least one element to detach instances')
  }

  selection.forEach(detachInstances)

  if (totalDetachedInstances === 0) return figma.notify('No linked styles found')

  figma.closePlugin(getMessage())
}
