 

// Parse col-span from outerClass, defaulting to 12.
export function getColSpan(item: any): number {
  const outerClass = item?.outerClass
  if (typeof outerClass !== 'string') return 12
  const match = outerClass.match(/col-span-(\d+)/)
  return match ? parseInt(match[1]!, 10) : 12
}

// Write or replace col-span-* in outerClass.
export function setColSpan(item: any, span: number) {
  if (!item) return
  let classes = item.outerClass || ''
  if (/col-span-\d+/.test(classes)) {
    classes = classes.replace(/col-span-\d+/, `col-span-${span}`)
  } else {
    classes = `${classes} col-span-${span}`.trim()
  }
  item.outerClass = classes
}

// Parse row-span from outerClass, defaulting to 1.
export function getRowSpan(item: any): number {
  const outerClass = item?.outerClass
  if (typeof outerClass !== 'string') return 1
  const match = outerClass.match(/\brow-span-(\d+)\b/)
  const parsed = match ? parseInt(match[1]!, 10) : 1
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export type Placement = { index: number; row: number; col: number; rowSpan: number; colSpan: number }

// Approximate auto layout in a 12-column grid to infer each item position.
export function computePlacements(values: any[]): Placement[] {
  const placements: Placement[] = []
  const occupied = new Set<string>()
  const keyOf = (r: number, c: number) => `${r}:${c}`
  const canPlace = (r: number, c: number, rSpan: number, cSpan: number) => {
    for (let rr = r; rr < r + rSpan; rr++) {
      for (let cc = c; cc < c + cSpan; cc++) {
        if (occupied.has(keyOf(rr, cc))) return false
      }
    }
    return true
  }
  const occupy = (r: number, c: number, rSpan: number, cSpan: number) => {
    for (let rr = r; rr < r + rSpan; rr++) {
      for (let cc = c; cc < c + cSpan; cc++) {
        occupied.add(keyOf(rr, cc))
      }
    }
  }

  for (let i = 0; i < values.length; i++) {
    const item = values[i]
    const colSpan = Math.max(1, Math.min(12, getColSpan(item)))
    const rowSpan = Math.max(1, Math.min(6, getRowSpan(item)))
    let placed = false
    for (let row = 1; row <= 200 && !placed; row++) {
      for (let col = 1; col <= 12 - colSpan + 1; col++) {
        if (canPlace(row, col, rowSpan, colSpan)) {
          occupy(row, col, rowSpan, colSpan)
          placements.push({ index: i, row, col, rowSpan, colSpan })
          placed = true
          break
        }
      }
    }
    if (!placed) placements.push({ index: i, row: 1, col: 1, rowSpan, colSpan })
  }

  return placements
}

function cellKey(row: number, col: number) {
  return row * 100 + col
}

// Infer the insertion index from the target cell row and column.
export function findInsertIndexForCell(placements: Placement[], row: number, col: number) {
  const target = cellKey(row, col)
  for (let i = 0; i < placements.length; i++) {
    const p = placements[i]!
    if (cellKey(p.row, p.col) >= target) return i
  }
  return placements.length
}

// Approximate the visual row from col-span for compatibility with older logic.
export function getVisualRows(values: any[]) {
  const rows: { startIndex: number; endIndex: number; items: any[]; totalSpan: number }[] = []
  let currentRow: { startIndex: number; endIndex: number; items: any[]; totalSpan: number } = {
    startIndex: 0,
    endIndex: 0,
    items: [],
    totalSpan: 0,
  }

  for (let i = 0; i < values.length; i++) {
    const item = values[i]
    const span = getColSpan(item)
    if (currentRow.totalSpan + span > 12 && currentRow.items.length > 0) {
      rows.push(currentRow)
      currentRow = { startIndex: i, endIndex: i, items: [item], totalSpan: span }
    } else {
      currentRow.items.push(item)
      currentRow.endIndex = i
      currentRow.totalSpan += span
    }
  }

  if (currentRow.items.length > 0) rows.push(currentRow)
  return rows
}

// Evenly divide col-span only on the target row to avoid affecting other rows.
export function adjustColSpansForInsertAtRow(targetParentValues: any[], row: number, insertValues: any[]) {
  const placements = computePlacements(targetParentValues)
  const rowIndices = placements
    .filter((p) => row >= p.row && row < p.row + p.rowSpan)
    .map((p) => p.index)
  const rowItems = rowIndices.map((i) => targetParentValues[i]).filter(Boolean)
  const totalCount = rowItems.length + insertValues.length
  if (totalCount <= 0) return

  if (totalCount <= 4) {
    const newSpan = 12 / totalCount
    rowItems.forEach((item) => setColSpan(item, newSpan))
    insertValues.forEach((val) => setColSpan(val, newSpan))
  } else {
    insertValues.forEach((val) => setColSpan(val, 3))
  }
}
