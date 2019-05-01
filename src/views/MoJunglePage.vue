<template>
  <MoFeedGroup ref="sub" vid="/jungle" title="丛林" group="jungle"></MoFeedGroup>
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
