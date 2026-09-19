/** @jsx h */
/** @jsxImportSource preact */
import {
  Button,
  Container,
  Muted,
  Text,
  VerticalSpace,
  render,
} from '@create-figma-plugin/ui'
import {emit, on} from '@create-figma-plugin/utilities'
import {h} from 'preact'
import {useCallback, useEffect, useState} from 'preact/hooks'

import type {
  ScanTextStylesHandler,
  SelectTextStyleGroupHandler,
  TextStyleGroup,
  TextStylesScannedHandler,
} from './types'

const STYLE_ELEMENT_ID = 'type-scanner-ui-styles'

export function Plugin() {
  const [groups, setGroups] = useState<Array<TextStyleGroup>>([])
  const [hasScanned, setHasScanned] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(function () {
    return on<TextStylesScannedHandler>(
      'TEXT_STYLES_SCANNED',
      function (scannedGroups: Array<TextStyleGroup>) {
        setGroups(scannedGroups)
        setHasScanned(true)
        setIsLoading(false)
      }
    )
  }, [])

  const handleScanButtonClick = useCallback(function () {
    setIsLoading(true)
    emit<ScanTextStylesHandler>('SCAN_TEXT_STYLES')
  }, [])

  const renderScanButton = useCallback(
    function (label: string, secondary = false, fullWidth = false) {
      return (
        <Button
          disabled={isLoading}
          fullWidth={fullWidth}
          onClick={handleScanButtonClick}
          secondary={secondary}
        >
          {isLoading ? 'Scanning...' : label}
        </Button>
      )
    },
    [handleScanButtonClick, isLoading]
  )

  if (hasScanned === false) {
    return (
      <Container className="scannerRoot" space="medium">
        <div className="emptyState">
          <Text align="center" className="titleText">
            Type Scanner
          </Text>
          <VerticalSpace space="small" />
          <Text align="center">
            <Muted>Scan the current page for typography variations.</Muted>
          </Text>
          <VerticalSpace space="medium" />
          {renderScanButton('Scan')}
        </div>
      </Container>
    )
  }

  if (groups.length === 0) {
    return (
      <Container className="scannerRoot" space="medium">
        <div className="emptyState">
          <Text align="center" className="titleText">
            No text layers found
          </Text>
          <VerticalSpace space="small" />
          <Text align="center">
            <Muted>Scan the current page for typography variations.</Muted>
          </Text>
          <VerticalSpace space="medium" />
          {renderScanButton('Scan again')}
        </div>
      </Container>
    )
  }

  return (
    <Container className="scannerRoot resultsRoot" space="medium">
      <div className="resultsList">
        {groups.map(function (group) {
          return (
            <button
              className="resultRow"
              key={group.id}
              onClick={function () {
                emit<SelectTextStyleGroupHandler>(
                  'SELECT_TEXT_STYLE_GROUP',
                  group.id
                )
              }}
              type="button"
            >
              <span className="resultMeta">
                <span className="resultFamily">{group.fontFamily}</span>
                <span>{group.fontSize}</span>
                <span>{group.fontWeight}</span>
              </span>
              <span className="resultCount">{String(group.count)}</span>
            </button>
          )
        })}
      </div>
      <div className="bottomActions">
        {renderScanButton('Scan', false, true)}
      </div>
    </Container>
  )
}

function appendStyles(): void {
  if (
    typeof document === 'undefined' ||
    document.getElementById(STYLE_ELEMENT_ID) !== null
  ) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = `
    .scannerRoot {
      min-height: 328px;
    }

    .emptyState {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 328px;
      justify-content: center;
    }

    .titleText {
      font-weight: 700;
    }

    .resultsRoot {
      display: flex;
      flex-direction: column;
      min-height: 328px;
    }

    .resultsList {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      gap: 2px;
      min-height: 0;
      overflow-y: auto;
      padding-top: 8px;
    }

    .bottomActions {
      flex: 0 0 auto;
      padding-top: 16px;
    }

    .resultRow {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 4px;
      color: inherit;
      cursor: pointer;
      display: flex;
      font: inherit;
      justify-content: space-between;
      min-height: 40px;
      padding: 8px;
      text-align: left;
      transition: background-color 120ms ease;
      width: 100%;
    }

    .resultRow:hover,
    .resultRow:focus {
      background-color: var(--figma-color-bg-hover, #f5f5f5);
      outline: none;
    }

    .resultRow:focus-visible {
      box-shadow: inset 0 0 0 1px var(--figma-color-border-selected, #18a0fb);
    }

    .resultMeta {
      align-items: center;
      display: flex;
      flex-direction: row;
      gap: 8px;
      min-width: 0;
    }

    .resultMeta span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .resultFamily {
      font-weight: 600;
    }

    .resultCount {
      color: var(--figma-color-text-secondary, #6b7280);
      flex: 0 0 auto;
      margin-left: 12px;
    }
  `
  document.head.appendChild(style)
}

appendStyles()

export default render(Plugin)
