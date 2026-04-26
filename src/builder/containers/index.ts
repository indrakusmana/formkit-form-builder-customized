import ListContainer from '@/components/ui/containers/list/ListContainer.vue'
import ListContainerPreview from '@/components/ui/containers/list/ListContainerPreview.vue'
import CardContainer from '@/components/ui/containers/card/CardContainer.vue'
import CardContainerPreview from '@/components/ui/containers/card/CardContainerPreview.vue'
import { getCanvasSchemaLibrary, getPreviewSchemaLibrary } from '@/containers/registry'

export { ListContainer, ListContainerPreview, CardContainer, CardContainerPreview }

export const canvasSchemaLibrary = getCanvasSchemaLibrary()

export const previewSchemaLibrary = getPreviewSchemaLibrary()
