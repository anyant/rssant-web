<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>枯木{{ numFeedsText }}</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="feed-story-list">
      <MoFeedItem
        v-for="feed in feedList"
        :key="feed.id"
        :title="feed.title"
        :number="feed.num_unread_storys"
        :date="feed.dt_updated"
        :link="`/feed/${feed.id}`"
      ></MoFeedItem>
    </div>
  </MoLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'
import MoFeedItem from '@/components/MoFeedItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedStoryItem, MoFeedItem },
  data() {
    return {}
  },
  mounted() {
    this.$API.feed.sync()
  },
  computed: {
    feedList() {
      return this.$API.feed.deadwoods
    },
    numFeedsText() {
      let n = this.feedList.length
      if (n <= 0) {
        return ''
      } else {
        return ` (${n})`
      }
    }
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

.feed-item,
.feed-story-item {
  position: relative;
  margin-top: 8 * @pr;
}

.feed-story-list {
  padding-bottom: 8 * @pr;
}
</style>
