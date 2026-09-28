<script setup lang="ts">
import type { ArchiveGroup } from '../../features/archive'
import { useId } from 'vue'
import { useArchiveTimelineState } from '../../features/archive'

const props = defineProps<{
  groups: ArchiveGroup[]
  emptyLabel: string
  unknownYearLabel: string
  countLabel: string
}>()

const { selectedYear, selectGroup } = useArchiveTimelineState(() => props.groups)
const panelIdPrefix = `${useId()}-archive`
</script>

<template>
  <LmArchiveRail
    v-if="groups.length"
    :groups="groups"
    :selected-year="selectedYear"
    :panel-id-prefix="panelIdPrefix"
    :unknown-year-label="unknownYearLabel"
    :count-label="countLabel"
    @select-year="selectGroup"
  />
  <LmAggregateEmpty v-else :label="emptyLabel" />
</template>
