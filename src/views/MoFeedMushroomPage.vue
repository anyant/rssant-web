<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>蘑菇 (5)</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="feed-story-list">
      <MoFeedStoryItem v-for="x in [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6]" :key="x" :readed="x < 4">{{ x }}</MoFeedStoryItem>
    </div>
  </MoLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedStoryItem },
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

.feed-story-item {
  position: relative;
  margin-top: 8 * @pr;
}

.feed-story-list {
  padding-bottom: 8 * @pr;
}
</style>
