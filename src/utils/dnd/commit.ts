/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BaseDragState,
  DragState,
  DragStateProps,
  InsertEvent,
  NodeRecord,
  ParentRecord,
  SynthDragState,
} from '@formkit/drag-and-drop'
import {
  isDragState,
  isSynthDragState,
  parentValues,
  removeClass,
  setParentValues,
} from '@formkit/drag-and-drop'
import type { FormKitSchemaFormKit } from '@formkit/core'
import { commitSchema } from '../../composables/schema-history'
import { formSchema } from '../default-form-elements'
import { insertState } from './insert-state'
import { getVisualRows, setColSpan, adjustColSpansForInsertAtRow } from './grid'
import { collectSchemaNames, ensureUniqueName, generateKey, toSafeName } from './schema'
import { eq } from '../utils'

function getListKey(el: HTMLElement | null | undefined): string | null {
  if (!el) return null
  const raw = el.getAttribute('data-list-key')
  return raw && raw.trim() ? raw : null
}

function updateListChildrenByKey(
  schema: FormKitSchemaFormKit[],
  listKey: string,
  nextChildren: FormKitSchemaFormKit[],
) {
  const nextSchema = [...schema]
  const idx = nextSchema.findIndex((n: any) => n?.__key === listKey)
  if (idx < 0) return null
  nextSchema[idx] = { ...(nextSchema[idx] as any), children: [...nextChildren] } as any
  return nextSchema
}

// 调整横向插入时的 col-span：优先使用 explicitRow（row-span>1 的精确命中），否则回退到“视觉行”算法
function adjustColSpansForInsert(
  targetParentValues: any[],
  draggedOverValue: any,
  insertValues: any[],
  isVertical: boolean,
) {
  if (isVertical) {
    insertValues.forEach((val) => setColSpan(val, 12))
    return
  }

  const explicitRow = insertState.explicitRow
  if (typeof explicitRow === 'number' && Number.isFinite(explicitRow)) {
    adjustColSpansForInsertAtRow(targetParentValues, explicitRow, insertValues)
    return
  }

  const rows = getVisualRows(targetParentValues)
  const targetRow = rows.find((r) => r.items.includes(draggedOverValue))

  if (!targetRow) {
    insertValues.forEach((val) => setColSpan(val, 12))
    return
  }

  const currentCount = targetRow.items.length
  const addedCount = insertValues.length
  const totalCount = currentCount + addedCount

  if (totalCount <= 4) {
    const newSpan = 12 / totalCount
    targetRow.items.forEach((item) => setColSpan(item, newSpan))
    insertValues.forEach((val) => setColSpan(val, newSpan))
  } else {
    insertValues.forEach((val) => setColSpan(val, 3))
  }
}

function insertItemsIntoParentFromOutside<T>(
  state: DragStateProps<T> & BaseDragState<T>,
  newParentValues: T[],
  index: number,
  insertValues: Array<T>,
  draggedOverNode?: NodeRecord<T>,
) {
  const isSource = state.initialParent.el.getAttribute('data-is-source') === 'true'
  if (!isSource) {
    setParentValues(state.initialParent.el, state.initialParent.data, [...newParentValues])
  }

  const targetParentValues = parentValues(state.currentParent.el, state.currentParent.data)
  const existingNames = new Set<string>()
  collectSchemaNames(formSchema.value, existingNames)

  const processedInsertValues = insertValues.map((value) => {
    const valObj = isSource ? JSON.parse(JSON.stringify(value)) : value
    if (typeof valObj === 'object' && valObj !== null) {
      const val = valObj as any
      const nextKey = typeof val.__key === 'string' && val.__key ? val.__key : generateKey()
      const base = toSafeName(val.name || val.$formkit || 'field')
      const nextName = val.$formkit === 'submit' ? val.name : ensureUniqueName(base, existingNames)
      const next: any =
        val.$formkit === 'submit'
          ? { ...valObj, __key: nextKey, outerClass: 'col-span-12 pt-2' }
          : {
              ...valObj,
              __key: nextKey,
              name: nextName,
              id: `field_${nextKey}`,
              outerClass: val.outerClass || 'col-span-12',
            }
      if (val.$formkit === 'submit') return next
      return next
    }
    return valObj
  })

  if (draggedOverNode) {
    adjustColSpansForInsert(
      targetParentValues,
      draggedOverNode.data.value,
      processedInsertValues,
      insertState.verticalInsert ?? false,
    )
  } else {
    processedInsertValues.forEach((val) => setColSpan(val, 12))
  }

  const insertIndex =
    typeof insertState.explicitIndex === 'number' && Number.isFinite(insertState.explicitIndex)
      ? insertState.explicitIndex
      : index

  targetParentValues.splice(insertIndex, 0, ...processedInsertValues)

  setParentValues(state.currentParent.el, state.currentParent.data, [...targetParentValues])

  commitSchema([...(targetParentValues as FormKitSchemaFormKit[])], { reason: 'dnd' })
}

// 处理 dragEnd：根据 insertState 决定最终插入位置，并提交到 schema 历史
export function handleEnd<T>(state: DragState<T> | SynthDragState<T> | BaseDragState<T>) {
  if (!isDragState(state) && !isSynthDragState(state)) return

  const draggedNode = state.draggedNodes[0]
  if (!draggedNode) return

  const insertPoint = insertState.insertPoint
  const listKey =
    getListKey(state.currentParent.el as any) ??
    getListKey(insertState.draggedOverParent?.el as any)

  if (!insertState.draggedOverParent) {
    const draggedParentValues = parentValues(state.initialParent.el, state.initialParent.data)

    const transferred = state.initialParent.el !== state.currentParent.el

    const draggedValues = state.draggedNodes.map((node) => node.data.value)

    if (transferred && listKey) {
      const currentChildren = parentValues(state.currentParent.el, state.currentParent.data) as any as FormKitSchemaFormKit[]
      const indexRaw = (state as any).targetIndex as number | undefined
      const index = typeof indexRaw === 'number' && Number.isFinite(indexRaw)
        ? Math.max(0, Math.min(currentChildren.length, indexRaw))
        : currentChildren.length

      const insertValues = state.initialParent.data.config.insertConfig?.dynamicValues
        ? (state.initialParent.data.config.insertConfig.dynamicValues({
            sourceParent: state.initialParent,
            targetParent: state.currentParent,
            draggedNodes: state.draggedNodes,
            targetNodes: [] as any,
            targetIndex: index,
          }) as any as FormKitSchemaFormKit[])
        : (draggedValues as any as FormKitSchemaFormKit[])

      insertValues.forEach((val: any) => setColSpan(val, 12))

      const newParentValues = (draggedParentValues as any[]).filter((x) => !draggedValues.some((y) => eq(x, y))) as any as FormKitSchemaFormKit[]
      const nextChildren = [...currentChildren]
      nextChildren.splice(index, 0, ...(insertValues as any as FormKitSchemaFormKit[]))

      const nextSchema = updateListChildrenByKey(newParentValues, listKey, nextChildren)
      if (!nextSchema) return

      setParentValues(state.initialParent.el, state.initialParent.data, [...nextSchema] as any)
      setParentValues(state.currentParent.el, state.currentParent.data, [...nextChildren] as any)
      commitSchema(nextSchema, { reason: 'dnd' })
    } else {

    const enabledNodes = [...state.initialParent.data.enabledNodes]

    const originalIndex = draggedNode.data.index

    const targetIndex = insertState.targetIndex

    const draggedOverNode = insertState.draggedOverNodes[0]

    if (!transferred && draggedOverNode && draggedOverNode.el !== draggedNode.el) {
      const newParentValues: any = draggedParentValues.filter((x) => !draggedValues.some((y) => eq(x, y)))

      let index = draggedOverNode.data.index
      const explicitIndex = insertState.explicitIndex
      const usedExplicitIndex = typeof explicitIndex === 'number' && Number.isFinite(explicitIndex)

      if (usedExplicitIndex) {
        const removedBefore = state.draggedNodes.filter((n) => n.data.index < explicitIndex).length
        index = Math.max(0, explicitIndex - removedBefore)
      } else {
        if (insertState.targetIndex > draggedNode.data.index && !insertState.ascending) {
          index--
        } else if (insertState.targetIndex < draggedNode.data.index && insertState.ascending) {
          index++
        }
      }

      adjustColSpansForInsert(newParentValues, draggedOverNode.data.value, draggedValues, insertState.verticalInsert ?? false)

      newParentValues.splice(index, 0, ...draggedValues)

      commitSchema([...(newParentValues as FormKitSchemaFormKit[])], { reason: 'dnd' })

      setParentValues(state.initialParent.el, state.initialParent.data, [...newParentValues])

      if (state.initialParent.data.config.onSort) {
        const sortEventData = {
          parent: {
            el: state.initialParent.el,
            data: state.initialParent.data,
          } as ParentRecord<unknown>,
          previousValues: [...draggedParentValues],
          previousNodes: [...enabledNodes],
          nodes: [...state.initialParent.data.enabledNodes],
          values: [...newParentValues],
          draggedNodes: state.draggedNodes,
          targetNodes: insertState.draggedOverNodes,
          previousPosition: originalIndex,
          position: index,
          state: state as DragState<unknown>,
        }

        state.initialParent.data.config.onSort(sortEventData)
      }
    } else if (transferred && insertState.draggedOverNodes.length) {
      const draggedParentValues = parentValues(state.initialParent.el, state.initialParent.data)

      let index = draggedOverNode?.data.index || 0
      const explicitIndex = insertState.explicitIndex
      const usedExplicitIndex = typeof explicitIndex === 'number' && Number.isFinite(explicitIndex)
      if (usedExplicitIndex) {
        index = explicitIndex
      }

      if (!usedExplicitIndex && insertState.ascending) index++

      const insertValues = state.initialParent.data.config.insertConfig?.dynamicValues
        ? state.initialParent.data.config.insertConfig.dynamicValues({
            sourceParent: state.initialParent,
            targetParent: state.currentParent,
            draggedNodes: state.draggedNodes,
            targetNodes: insertState.draggedOverNodes as NodeRecord<T>[],
            targetIndex: index,
          })
        : draggedValues

      const newParentValues = draggedParentValues.filter((x) => !draggedValues.some((y) => eq(x, y)))

      insertItemsIntoParentFromOutside(state as any, newParentValues, index, insertValues, draggedOverNode)

      const data = {
        sourceParent: state.initialParent,
        targetParent: state.currentParent,
        initialParent: state.initialParent,
        draggedNodes: state.draggedNodes,
        targetIndex,
        targetNodes: insertState.draggedOverNodes as NodeRecord<T>[],
        state,
      }

      if (state.initialParent.data.config.onTransfer) state.initialParent.data.config.onTransfer(data)
      if (state.currentParent.data.config.onTransfer) state.currentParent.data.config.onTransfer(data)
    }
    }
  } else if (insertState.draggedOverParent) {
    if (state.currentParent.el.contains(state.initialParent.el)) {
      const draggedParentValues = parentValues(state.initialParent.el, state.initialParent.data)

      const draggedOverParentValues = parentValues(insertState.draggedOverParent.el, insertState.draggedOverParent.data)

      const draggedValues = state.draggedNodes.map((node) => node.data.value)

      const newParentValues = draggedParentValues.filter((x) => !draggedValues.some((y) => eq(x, y)))

      setParentValues(state.initialParent.el, state.initialParent.data, [...newParentValues])

      const insertValues = state.initialParent.data.config.insertConfig?.dynamicValues
        ? state.initialParent.data.config.insertConfig.dynamicValues({
            sourceParent: state.initialParent,
            targetParent: state.currentParent,
            draggedNodes: state.draggedNodes,
            targetNodes: insertState.draggedOverNodes as NodeRecord<T>[],
          })
        : draggedValues

      insertValues.forEach((val: any) => setColSpan(val, 12))

      draggedOverParentValues.push(...insertValues)

      setParentValues(insertState.draggedOverParent.el, insertState.draggedOverParent.data, [...draggedOverParentValues])

      commitSchema([...(draggedOverParentValues as FormKitSchemaFormKit[])], { reason: 'dnd' })
    } else {
      const draggedValues = state.draggedNodes.map((node) => node.data.value)

      const draggedOverParentValues = parentValues(insertState.draggedOverParent.el, insertState.draggedOverParent.data)

      const insertValues = state.initialParent.data.config.insertConfig?.dynamicValues
        ? state.initialParent.data.config.insertConfig.dynamicValues({
            sourceParent: state.initialParent,
            targetParent: state.currentParent,
            draggedNodes: state.draggedNodes,
            targetNodes: insertState.draggedOverNodes as NodeRecord<T>[],
          })
        : draggedValues

      const isSource = state.initialParent.el.getAttribute('data-is-source') === 'true'
      const processedInsertValues = insertValues.map((value) => {
        const valObj = isSource ? JSON.parse(JSON.stringify(value)) : value
        if (typeof valObj === 'object' && valObj !== null) {
          const val = valObj as any
          if (val.$formkit === 'submit') return { ...valObj, outerClass: 'col-span-12 pt-2' }
          return { ...valObj, outerClass: val.outerClass || 'col-span-12' }
        }
        return valObj
      })

      processedInsertValues.forEach((val) => setColSpan(val, 12))

      draggedOverParentValues.push(...processedInsertValues)

      setParentValues(insertState.draggedOverParent.el, insertState.draggedOverParent.data, [...draggedOverParentValues])

      if (!isSource) {
        const draggedParentValues = parentValues(state.initialParent.el, state.initialParent.data)

        const newParentValues = draggedParentValues.filter((x) => !draggedValues.some((y) => eq(x, y)))

        setParentValues(state.initialParent.el, state.initialParent.data, [...newParentValues])
      }

      commitSchema([...(draggedOverParentValues as FormKitSchemaFormKit[])], { reason: 'dnd' })
    }

    const data: InsertEvent<T> = {
      sourceParent: state.initialParent,
      targetParent: state.currentParent,
      draggedNodes: state.draggedNodes,
      targetNodes: insertState.draggedOverNodes as NodeRecord<T>[],
      state,
    }

    if (state.initialParent.data.config.insertConfig?.insertEvent) state.initialParent.data.config.insertConfig.insertEvent(data)
    if (state.currentParent.data.config.insertConfig?.insertEvent) state.currentParent.data.config.insertConfig.insertEvent(data)

    removeClass([insertState.draggedOverParent.el], insertState.draggedOverParent.data.config.dropZoneClass)
  }

  if (insertPoint) insertPoint.el.style.display = 'none'

  const dropZoneClass = isSynthDragState(state)
    ? state.initialParent.data.config.synthDropZoneClass
    : state.initialParent.data.config.dropZoneClass

  removeClass(insertState.draggedOverNodes.map((node) => node.el), dropZoneClass)

  const dragPlaceholderClass = state.initialParent.data.config.dragPlaceholderClass

  removeClass(state.draggedNodes.map((node) => node.el), dragPlaceholderClass)

  insertState.draggedOverNodes = []
  insertState.draggedOverParent = null
  insertState.explicitIndex = undefined
  insertState.explicitRow = undefined
}
