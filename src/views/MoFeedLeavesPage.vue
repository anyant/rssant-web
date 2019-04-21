<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>绿叶 (999+)</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="feed-list">
      <MoFeedItem v-for="x in [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8]" :key="x" :readed="x > 4">{{ x }}</MoFeedItem>
    </div>
  </MoLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedItem from '@/components/MoFeedItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedItem },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed {
  position: relative;
  right: -6 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.feed-item {
  margin-top: 8 * @pr;
}

.feed-list {
  padding-bottom: 8 * @pr;
}
</style>
