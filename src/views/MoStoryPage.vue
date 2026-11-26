<template>
  <MoLayout header class="story">
    <MoStoryReader :feed-id="feedId" :offset="offset" />
  </MoLayout>
</template>

<script>
export default {
  computed: {
    feedId() {
      return this.$route.query.feed
    },
    offset() {
      return parseInt(this.$route.query.offset)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story {
  background: #ffffff;
}
</style>
