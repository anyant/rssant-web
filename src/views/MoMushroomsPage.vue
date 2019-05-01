<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>蘑菇{{ numMushrooms }}</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="feed-story-list">
      <MoFeedStoryItem
        v-for="story in mushrooms"
        :key="`${story.feed.id}:${story.offset}`"
        :feedId="story.feed.id"
        :offset="story.offset"
        :feedTitle="getFeedTitle(story.feed.id)"
        :storyTitle="story.title"
        :storyDate="story.dt_published"
        :isReaded="isReaded(story)"
      ></MoFeedStoryItem>
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
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms()
  },
  computed: {
    mushrooms() {
      return this.$API.story.mushrooms
    },
    numMushrooms() {
      let n = this.mushrooms.length
      if (n <= 0) {
        return ''
      } else {
        return ` (${n})`
      }
    }
  },
  methods: {
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    },
    isReaded(story){
      let feed = this.$API.feed.get(story.feed.id)
      return story.offset > feed.story_offset
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
