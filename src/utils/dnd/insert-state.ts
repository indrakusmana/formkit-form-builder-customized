import * as DnD from '@formkit/drag-and-drop'
import type { InsertState } from '@formkit/drag-and-drop'

// Shared state for the insert guide and drag insertion flow.
export type InsertStateEx<T> = InsertState<T> & {
  // Whether the current hit direction is vertical; otherwise it is horizontal.
  verticalInsert?: boolean
  // Maximum row span of the current dragged element, used for segmented guides.
  draggedRowSpan?: number
  // More precise insert index for row-span targets when hitting the lower half.
  explicitIndex?: number
  // More precise target row for row-span targets when hitting the lower half.
  explicitRow?: number
}

const runtimeInsertState = (DnD as any).insertState as InsertStateEx<unknown> | undefined

export const insertState: InsertStateEx<unknown> =
  runtimeInsertState ??
  ({
    draggedOverNodes: [],
    draggedOverParent: null,
    targetIndex: 0,
    ascending: false,
    insertPoint: null,
    dragging: false,
  } as any)
