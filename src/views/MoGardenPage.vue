<template>
  <MoFeedGroup ref="sub" vid="/garden" title="菌圃" group="garden"></MoFeedGroup>
</template>
<script>
import MoFeedGroup from '@/components/MoFeedGroup'

export default {
  components: { MoFeedGroup },
  beforeRouteLeave(to, from, next) {
    this.$refs.sub.beforeRouteLeave(to, from, next)
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';
</style>
