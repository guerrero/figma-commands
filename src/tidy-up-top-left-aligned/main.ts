interface LayoutItem {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type Row = {
  y: number
  columns: Array<LayoutItem>
  height?: number
}

export default function () {
  const spacingX = 24
  const spacingY = 24

  const selection = figma.currentPage.selection

  if (selection.length < 2) {
    figma.notify('Select at least 2 elements')
    return figma.closePlugin()
  }

  const rows = [...selection]
    .sort((nodeA, nodeB) => nodeA.x - nodeB.x)
    .map(createItem)
    .reduce(createRows, [] as Row[])
    .sort((rowA, rowB) => rowA.y - rowB.y)
    .map((row, index, rows) => ({
      y: rows
        .slice(0, index)
        .reduce((acc, row) => acc + getRowHeight(row) + spacingY, rows[0].y),
      columns: row.columns.map((col, colIndex) => ({
        ...col,
        x: getXPosition(rows, colIndex, spacingX),
      })),
    }))

  rows
    .map(row => row.columns.map(column => ({...column, y: row.y})))
    .flat()
    .forEach(item => updateNodePosition(item))

  figma.closePlugin()
}

function createItem(node: LayoutItem): LayoutItem {
  return {
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  }
}

function createRows(rows: Row[], item: LayoutItem) {
  const row = rows.find(
    row => row.y + item.height / 2 > item.y && row.y - item.height / 2 < item.y
  )

  if (row) {
    row.columns.push(item)
  } else {
    rows.push({
      y: item.y,
      columns: [item],
    })
  }

  return rows
}

function getRowHeight(row: Row) {
  const itemHeights = row.columns.map(column => column.height)
  const height = Math.max(...itemHeights)

  return height
}

function getColumnWidth(rows: Row[], index: number) {
  const itemWidths = rows.map(row =>
    row.columns[index] ? row.columns[index].width : 0
  )
  const width = Math.max(...itemWidths)

  return width
}

function getXPosition(rows: Row[], index: number, spacingX: number) {
  const minX = Math.min(...rows.map(row => row.columns[0].x))
  const columns = rows.map(row => row.columns).flat()
  const widths = columns.map((_, index) => getColumnWidth(rows, index))
  const result = widths
    .slice(0, index)
    .reduce((acc, width) => acc + width + spacingX, minX)

  return result
}

function updateNodePosition(node: LayoutItem) {
  const figmaNode = figma.getNodeById(node.id) as SceneNode

  if (figmaNode) {
    figmaNode.x = node.x
    figmaNode.y = node.y
  }
}
