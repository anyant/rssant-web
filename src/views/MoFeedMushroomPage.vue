<template>
  <MoListLayout>
    <MoBackHeader>
      <template v-slot:title>蘑菇 (5)</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div>
      <MoFeedStoryItem v-for="x in [1,2,3,4,5,6,7,8,9]" :key="x" :readed="x < 4">{{ x }}</MoFeedStoryItem>
    </div>
  </MoListLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoListLayout from '@/components/MoListLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

export default {
  components: { MoBackHeader, MoListLayout, MoFeedStoryItem },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header {
  padding: 8 * @pr 16 * @pr;
}

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
</style>
