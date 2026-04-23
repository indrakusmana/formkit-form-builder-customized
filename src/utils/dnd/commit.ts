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
  parents,
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

function normalizeInsertValues(
  insertValues: FormKitSchemaFormKit[],
  isSource: boolean,
): FormKitSchemaFormKit[] {
  if (!isSource) return insertValues
  const existingNames = new Set<string>()
  collectSchemaNames(formSchema.value, existingNames)
  return insertValues.map((value: any) => {
    const valObj = JSON.parse(JSON.stringify(value))
    if (typeof valObj === 'object' && valObj !== null) {
      const val = valObj as any
      if (val.$formkit === 'submit' && Array.isArray(val.children)) {
        delete val.children
      }
      const nextKey = typeof val.__key === 'string' && val.__key ? val.__key : generateKey()
      const base = toSafeName(val.name || val.$formkit || 'field')
      const nextName = val.$formkit === 'submit' ? val.name : ensureUniqueName(base, existingNames)
      if (val.$formkit === 'submit') return { ...valObj, __key: nextKey, outerClass: 'col-span-12 pt-2' }
      return {
        ...valObj,
        __key: nextKey,
        name: nextName,
        id: `field_${nextKey}`,
        outerClass: val.outerClass || 'col-span-12',
      }
    }
    return valObj
  }) as FormKitSchemaFormKit[]
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

  const insertPoint = insertState.insertPoint
  const sourceParent = state.initialParent
  const targetParent = (insertState.draggedOverParent as any as ParentRecord<T> | null) ?? state.currentParent

  const draggedValues = state.draggedNodes.map((node) => node.data.value) as any as FormKitSchemaFormKit[]
  const draggedKeys = new Set<string>()
  for (const v of draggedValues as any[]) {
    const k = v?.__key
    if (typeof k === 'string' && k) draggedKeys.add(k)
  }

  const isSource = sourceParent.el.getAttribute('data-is-source') === 'true'

  const sourceValues = parentValues(sourceParent.el, sourceParent.data) as any as FormKitSchemaFormKit[]
  const targetValues = parentValues(targetParent.el, targetParent.data) as any as FormKitSchemaFormKit[]

  const draggedOverNode = insertState.draggedOverNodes[0] as any as NodeRecord<T> | undefined
  const explicitIndex = insertState.explicitIndex
  const usedExplicitIndex = typeof explicitIndex === 'number' && Number.isFinite(explicitIndex)

  let index = targetValues.length
  if (insertState.draggedOverParent) index = 0
  if (draggedOverNode) index = draggedOverNode.data.index || 0
  if (usedExplicitIndex) index = explicitIndex as number
  if (!usedExplicitIndex && draggedOverNode && insertState.ascending) index++

  index = Math.max(0, Math.min(targetValues.length, index))

  const insertValuesRaw =
    sourceParent.data.config.insertConfig?.dynamicValues && isSource
      ? (sourceParent.data.config.insertConfig.dynamicValues({
          sourceParent,
          targetParent,
          draggedNodes: state.draggedNodes,
          targetNodes: insertState.draggedOverNodes as any,
          targetIndex: index,
        }) as any as FormKitSchemaFormKit[])
      : (draggedValues as any as FormKitSchemaFormKit[])

  const insertValues = normalizeInsertValues(insertValuesRaw, isSource)

  if (sourceParent.el === targetParent.el) {
    const remaining = sourceValues.filter((v: any) => {
      const k = v?.__key
      if (typeof k === 'string' && k) return !draggedKeys.has(k)
      return !draggedValues.some((y) => eq(v, y))
    }) as any as FormKitSchemaFormKit[]

    const removedBefore = state.draggedNodes.filter((n) => n.data.index < index).length
    const nextIndex = Math.max(0, Math.min(remaining.length, index - removedBefore))

    if (draggedOverNode) {
      adjustColSpansForInsert(remaining as any[], draggedOverNode.data.value, insertValues as any[], insertState.verticalInsert ?? false)
    } else {
      insertValues.forEach((val: any) => setColSpan(val, 12))
    }

    remaining.splice(nextIndex, 0, ...(insertValues as any as FormKitSchemaFormKit[]))
    setParentValues(sourceParent.el, sourceParent.data, [...remaining] as any)
  } else {
    if (!isSource) {
      const remaining = sourceValues.filter((v: any) => {
        const k = v?.__key
        if (typeof k === 'string' && k) return !draggedKeys.has(k)
        return !draggedValues.some((y) => eq(v, y))
      }) as any as FormKitSchemaFormKit[]
      setParentValues(sourceParent.el, sourceParent.data, [...remaining] as any)
    }

    const nextTargetValues = [...targetValues]

    if (draggedOverNode) {
      adjustColSpansForInsert(nextTargetValues as any[], draggedOverNode.data.value, insertValues as any[], insertState.verticalInsert ?? false)
    } else {
      insertValues.forEach((val: any) => setColSpan(val, 12))
    }

    nextTargetValues.splice(index, 0, ...(insertValues as any as FormKitSchemaFormKit[]))
    setParentValues(targetParent.el, targetParent.data, [...nextTargetValues] as any)
  }

  const rootEl = document.querySelector('[data-testid="drop-area"]') as HTMLElement | null
  const rootData = rootEl ? parents.get(rootEl) : undefined
  if (!rootEl || !rootData) return

  const rootValues = parentValues(rootEl, rootData) as any as FormKitSchemaFormKit[]

  const listMap = new Map<string, FormKitSchemaFormKit[]>()
  const listEls = Array.from(document.querySelectorAll<HTMLElement>('[data-list-key]'))
  for (const el of listEls) {
    const key = getListKey(el)
    if (!key) continue
    const data = parents.get(el)
    if (!data) continue
    const vals = parentValues(el, data) as any as FormKitSchemaFormKit[]
    const cleaned = vals.map((v: any) => {
      if (v?.$formkit === 'submit' && Array.isArray(v.children)) {
        const next = { ...v }
        delete next.children
        return next
      }
      return v
    })
    listMap.set(key, cleaned)
  }

  const nextSchema = rootValues.map((node: any) => {
    if (!node || typeof node !== 'object') return node
    if (node.$formkit === 'submit' && Array.isArray(node.children)) {
      const next = { ...node }
      delete next.children
      return next
    }
    const key = node.__key
    if (typeof key === 'string' && key && listMap.has(key)) {
      return { ...node, children: listMap.get(key) ?? [] }
    }
    if (node.$formkit === 'list' && !Array.isArray(node.children)) {
      return { ...node, children: [] }
    }
    return node
  }) as FormKitSchemaFormKit[]

  commitSchema(nextSchema, { reason: 'dnd' })

  if (insertPoint) insertPoint.el.style.display = 'none'

  const dropZoneClass = isSynthDragState(state)
    ? state.initialParent.data.config.synthDropZoneClass
    : state.initialParent.data.config.dropZoneClass

  removeClass(insertState.draggedOverNodes.map((node) => node.el), dropZoneClass)
  if (insertState.draggedOverParent) {
    removeClass([insertState.draggedOverParent.el], insertState.draggedOverParent.data.config.dropZoneClass)
  }

  insertState.draggedOverNodes = []
  insertState.draggedOverParent = null
  insertState.explicitIndex = undefined
  insertState.explicitRow = undefined
}
