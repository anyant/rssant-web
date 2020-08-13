<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        收藏
        <span class="num-total">{{ favorited.length }}</span>
      </template>
    </MoBackHeader>
    <div class="feed-story-list" ref="mainRef">
      <MoFeedStoryItem
        v-for="story in favorited"
        :key="`${story.feed.id}:${story.offset}`"
        :feedId="story.feed.id"
        :offset="story.offset"
        :feedTitle="getFeedTitle(story.feed.id)"
        :storyTitle="story.title"
        :storyDate="story.dt_published"
        :isReaded="null"
        source="favorited"
      ></MoFeedStoryItem>
    </div>
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
      default: '/favorited',
    },
  },
  mounted() {
    this.$API.story
      .loadFavorited()
      .then(this.$API.syncFeedLoadMushrooms())
      .then(() => {
        let scrollTop = this.$pageState.get('scrollTop')
        let el = this.$refs.mainRef
        if (!_.isNil(el)) {
          el.scrollTo(0, _.defaultTo(scrollTop, 0))
        }
      })
  },
  computed: {
    favorited() {
      return this.$API.story.favorited
    },
  },
  methods: {
    getFeedTitle(feedId) {
      let feed = this.$API.feed.get(feedId)
      return _.isNil(feed) ? feedId : feed.title
    },
  },
  savePageState() {
    let el = this.$refs.mainRef
    if (!_.isNil(el)) {
      this.$pageState.set('scrollTop', el.scrollTop)
    }
    this.$pageState.commit()
  },
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
