<template>
  <MoLayout header class="story">
    <div class="story-image-viewer"></div>
    <MoBackHeader border>
      <template v-slot:title>{{ headerTitle }}</template>
      <mu-button
        icon
        class="action-fetch"
        @click="onFetchFulltext"
        data-mu-loading-size="16"
        v-loading="isFetchLoading"
      >
        <fa-icon size="16" icon="sync-alt" />
      </mu-button>
      <mu-button icon class="action-favorited" @click="toggleFavorited">
        <fa-icon size="18" v-if="isFavorited" icon="star" :color="starColor" />
        <fa-icon size="18" v-else icon="far/star" :color="starColor" />
      </mu-button>
    </MoBackHeader>
    <MoStoryContent
      ref="contentRef"
      :story="story"
      :next-feed="nextFeed"
      :next-story="nextStory"
      :show-next-feed-title="showNextFeedTitle"
      :image-viewer-container-getter="imageViewerContainerGetter"
    ></MoStoryContent>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import { antGold } from '@/plugin/common'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'
import MoStoryContent from '@/components/MoStoryContent'
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  components: { MoBackHeader, MoLayout, MoStoryContent },
  data() {
    return {
      isFetchLoading: false,
    }
  },
  computed: {
    feedId() {
      return this.$route.query.feed
    },
    offset() {
      return parseInt(this.$route.query.offset)
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
      return feedStore.get(this.feedId)
    },
    story() {
      return storyStore.get({ feedId: this.feedId, offset: this.offset })
    },
    nextStoryInfo() {
      return storyStore.nextStoryInfo({
        feedId: this.feedId,
        offset: this.offset,
      })
    },
    showNextFeedTitle() {
      return this.nextStoryInfo.showFeedTitle
    },
    nextStory() {
      return this.nextStoryInfo.story
    },
    nextFeed() {
      if (_.isNil(this.nextStory)) {
        return null
      }
      return feedStore.get(this.nextStory.feed.id)
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
    await rootStore.syncFeedLoadMushrooms()
    // chrome: $route will change and mounted will not re-executed
    // firefox and safari: mounted will re-executed
    this.$watch('$route', () => {
      this.loadFeedAndStory()
    })
  },
  methods: {
    imageViewerContainerGetter() {
      return this.$el.querySelector('.story-image-viewer')
    },
    toggleFavorited() {
      let is_favorited = !this.isFavorited
      storyStore.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    },
    async onFetchFulltext() {
      if (this.isFetchLoading) {
        return
      }
      this.isFetchLoading = true
      let result = null
      try {
        result = await storyStore.fetchFulltext({ feedId: this.feedId, offset: this.offset })
      } catch (ex) {
        this.$toast.error({ message: `抓取全文失败: ${ex.message}`, time: 10000 })
      } finally {
        this.isFetchLoading = false
      }
      if (!_.isNil(result)) {
        if (result.response_status === 200) {
          if (result.accept === 'REJECT') {
            this.$toast.info(`抓取全文: 内容没有变化`)
          }
        } else {
          let message = `抓取全文失败: ${result.response_status} ${result.response_status_name}`
          this.$toast.warning({ message: message, time: 10000 })
        }
      }
    },
    async loadFeed({ feed, feedId }) {
      if (_.isNil(feed)) {
        await feedStore.load({ feedId: feedId })
      }
    },
    async loadStory({ story, feedId, offset, setReaded }) {
      if (_.isNil(story) || _.isEmpty(story.content)) {
        await storyStore.load({ feedId, offset, setReaded, detail: true })
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
        setReaded: !this.isReaded,
      })
      await feedLoaded
      await storyLoaded
      // 当 story 已加载但仍未读时，loadStory 不会更新已读状态，需要单独更新
      if (!_.isNil(this.feed) && !_.isNil(this.story) && !this.isReaded) {
        feedStore.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
      }
      this.scrollToTop()
      if (this.nextStoryInfo.shouldLoadNext) {
        let hasNext = this.offset + 1 < this.feed.total_storys
        if (hasNext) {
          let next = storyStore.get({
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

.action-fetch,
.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
}

.action-fetch {
  margin-right: 16 * @pr;
}

.action-favorited {
  color: @antTextBlack;
}
</style>
