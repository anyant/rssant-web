<template>
  <div class="creation-list">
    <MoCreationItem
      v-for="creation in creations"
      :key="creation.id"
      :status="creation.status"
      :title="creation.url"
      :date="creation.dt_created"
      :router-link="`/creation/${creation.id}`"
    ></MoCreationItem>
  </div>
</template>
<script>
import MoCreationItem from '@/components/MoCreationItem'

export default {
  components: { MoCreationItem },
  computed: {
    creations() {
      return this.$API.feed.creations
    },
  },
  mounted() {
    this.$API.feed.loadCreationList()
    this.$API.syncFeedLoadMushrooms()
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.creation-list {
  background: @antBackGrey;
}

.creation-item {
  margin-top: 8 * @pr;
}
</style>
