<template>
  <MoLayout header class="story">
    <MoBackHeader border>
      <template v-slot:title>{{ headerTitle }}</template>
      <mu-button icon class="action-favorited" @click="toggleFavorited">
        <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
        <fa-icon size="18" v-else icon="far/star" :color="starColor" />
      </mu-button>
    </MoBackHeader>
    <MoStoryContent
      ref="contentRef"
      :story="story"
      :source="source"
      :next-feed="nextFeed"
      :next-story="nextStory"
    ></MoStoryContent>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoStoryContent from '@/components/MoStoryContent'

export default {
  components: { MoBackHeader, MoLayout, MoStoryContent },
  data() {
    return {}
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    offset() {
      return parseInt(this.$route.params.offset)
    },
    source() {
      return _.defaultTo(this.$route.query.source, '').toLowerCase()
    },
    isSourceMushroom() {
      return this.source === 'mushroom'
    },
    isFavorited() {
      return !_.isNil(this.story) && this.story.is_favorited
    },
    isReaded() {
      if (_.isNil(this.feed) || _.isNil(this.story)) {
        return false
      }
      return this.story.offset < this.feed.story_offset
    },
    starColor() {
      if (this.isFavorited) {
        return antGold
      } else {
        return null
      }
    },
    feed() {
      return this.$API.feed.get(this.feedId)
    },
    story() {
      return this.$API.story.get({ feedId: this.feedId, offset: this.offset })
    },
    nextStory() {
      let story = null
      if (this.isSourceMushroom) {
        story = this.$API.story.nextMushroom({
          feedId: this.feedId,
          offset: this.offset,
        })
      } else {
        story = this.$API.story.get({
          feedId: this.feedId,
          offset: this.offset + 1,
        })
      }
      return story
    },
    nextFeed() {
      if (_.isNil(this.nextStory)) {
        return null
      }
      return this.$API.feed.get(this.nextStory.feed.id)
    },
    headerTitle() {
      if (!_.isNil(this.story) && !_.isNil(this.feed)) {
        return `${this.feed.title} - ${this.story.title}`
      } else if (!_.isNil(this.story)) {
        return this.story.title
      } else if (!_.isNil(this.feed)) {
        return this.feed.title
      } else {
        return `#${this.feedId}-${this.offset}`
      }
    },
  },
  async mounted() {
    await this.loadFeedAndStory()
    await this.$API.syncFeedLoadMushrooms()
    // chrome: $route will change and mounted will not re-executed
    // firefox and safari: mounted will re-executed
    this.$watch('$route', () => {
      this.loadFeedAndStory()
    })
  },
  methods: {
    toggleFavorited() {
      let is_favorited = !this.isFavorited
      this.$API.story.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    },
    async loadFeed({ feed, feedId }) {
      if (_.isNil(feed)) {
        await this.$API.feed.load({ feedId: feedId })
      }
    },
    async loadStory({ story, feedId, offset }) {
      if (_.isNil(story) || _.isEmpty(story.content)) {
        await this.$API.story.load({ feedId, offset, detail: true })
      }
    },
    async loadFeedAndStory() {
      let feedLoaded = this.loadFeed({
        feed: this.feed,
        feedId: this.feedId,
      })
      let storyLoaded = this.loadStory({
        story: this.story,
        feedId: this.feedId,
        offset: this.offset,
      })
      await feedLoaded
      await storyLoaded
      if (!_.isNil(this.feed) && !_.isNil(this.story) && !this.isReaded) {
        this.$API.feed.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
      }
      this.scrollToTop()
      if (!this.isSourceMushroom) {
        let hasNext = this.offset + 1 < this.feed.total_storys
        if (hasNext) {
          let next = this.$API.story.get({
            feedId: this.feedId,
            offset: this.offset + 1,
          })
          await this.loadStory({
            story: next,
            feedId: this.feedId,
            offset: this.offset + 1,
          })
        }
      }
    },
    scrollToTop() {
      window.scrollTo(0, 0)
      let contentRef = this.$refs.contentRef
      if (!_.isNil(contentRef) && !_.isNil(contentRef.$el)) {
        contentRef.$el.scrollTo(0, 0)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story {
  background: #ffffff;
}

.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
}
</style>
