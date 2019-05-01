<template>
  <MoFeedGroup ref="sub" vid="/desert" title="沙漠" group="desert"></MoFeedGroup>
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
