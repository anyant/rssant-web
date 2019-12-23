<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        收藏
        <span class="num-total">{{ favorited.length }}</span>
      </template>
    </MoBackHeader>
    <keep-alive>
      <div class="feed-story-list">
        <MoFeedStoryItem
          v-for="story in favorited"
          :key="`${story.feed.id}:${story.offset}`"
          :feedId="story.feed.id"
          :offset="story.offset"
          :feedTitle="getFeedTitle(story.feed.id)"
          :storyTitle="story.title"
          :storyDate="story.dt_published"
          :isReaded="false"
        ></MoFeedStoryItem>
      </div>
    </keep-alive>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoFeedStoryItem },
  props: {
    vid: {
      type: String,
      default: '/favorited'
    }
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      let scrollTop = this.$pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  computed: {
    favorited() {
      return this.$API.story.favorited
    }
  },
  methods: {
    getFeedTitle(feedId) {
      return this.$API.feed.get(feedId).title
    }
  },
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-item,
.feed-story-item {
  position: relative;
  margin-top: 8 * @pr;
}

.feed-story-list {
  padding-bottom: 8 * @pr;
}

.num-total {
  color: @antTextGrey;
  font-weight: normal;
  margin-left: 8 * @pr;
  margin-right: 4 * @pr;
}
</style>
