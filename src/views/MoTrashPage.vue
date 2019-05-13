<template>
  <MoFeedGroup vid="/trash" title="废墟" group="trash" :showNumUnread="false"></MoFeedGroup>
</template>
<script>
import MoFeedGroup from '@/components/MoFeedGroup'

export default {
  components: { MoFeedGroup }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';
</style>
