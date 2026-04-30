<script setup lang="ts">
import LabelHelpSection from '../common/LabelHelpSection.vue'
import PlaceholderSection from '../common/PlaceholderSection.vue'
import NaiveBasicSection from '../common/NaiveBasicSection.vue'
import PrefixSuffixSection from '../common/PrefixSuffixSection.vue'
import PairSection from '../common/PairSection.vue'
</script>

<template>
  <LabelHelpSection />
  <PlaceholderSection />
  <PrefixSuffixSection />
  <NaiveBasicSection
    :size="true"
    :disabled="true"
    :clearable="true"
    :bordered="true"
    :readonly="true"
    :round="true"
    :autofocus="true"
    :show-count="true"
    :maxlength="true"
    :minlength="true"
  />
  <PairSection />
</template>
