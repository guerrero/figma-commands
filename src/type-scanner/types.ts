import type {EventHandler} from '@create-figma-plugin/utilities'

export interface TextStyleGroup {
  id: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  sortSize: number | null
  count: number
  nodeIds: Array<string>
}

export interface ScanTextStylesHandler extends EventHandler {
  name: 'SCAN_TEXT_STYLES'
  handler: () => void
}

export interface TextStylesScannedHandler extends EventHandler {
  name: 'TEXT_STYLES_SCANNED'
  handler: (groups: Array<TextStyleGroup>) => void
}

export interface SelectTextStyleGroupHandler extends EventHandler {
  name: 'SELECT_TEXT_STYLE_GROUP'
  handler: (groupId: string) => void
}
