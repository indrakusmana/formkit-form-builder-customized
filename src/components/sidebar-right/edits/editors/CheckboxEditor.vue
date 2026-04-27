<script setup lang="ts">
import LabelHelpSection from '../common/LabelHelpSection.vue'
import OptionsSourceTabs from '../common/OptionsSourceTabs.vue'
import NaiveBasicSection from '../common/NaiveBasicSection.vue'
</script>

<template>
  <LabelHelpSection />
  <OptionsSourceTabs />
  <NaiveBasicSection :size="true" :disabled="true" />
</template>
