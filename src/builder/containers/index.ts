import { markRaw } from 'vue'
import ListContainer from './list/ListContainer.vue'
import ListContainerPreview from './list/ListContainerPreview.vue'
import CardContainer from './card/CardContainer.vue'
import CardContainerPreview from './card/CardContainerPreview.vue'

export { ListContainer, ListContainerPreview, CardContainer, CardContainerPreview }

export const canvasSchemaLibrary = {
  ListContainer: markRaw(ListContainer),
  CardContainer: markRaw(CardContainer),
}

export const previewSchemaLibrary = {
  ListContainer: markRaw(ListContainerPreview),
  CardContainer: markRaw(CardContainerPreview),
}
