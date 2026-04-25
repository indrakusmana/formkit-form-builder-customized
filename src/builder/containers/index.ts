import ListContainer from './list/ListContainer.vue'
import ListContainerPreview from './list/ListContainerPreview.vue'
import CardContainer from './card/CardContainer.vue'
import CardContainerPreview from './card/CardContainerPreview.vue'
import { getCanvasSchemaLibrary, getPreviewSchemaLibrary } from '@/containers/registry'

export { ListContainer, ListContainerPreview, CardContainer, CardContainerPreview }

export const canvasSchemaLibrary = getCanvasSchemaLibrary()

export const previewSchemaLibrary = getPreviewSchemaLibrary()
