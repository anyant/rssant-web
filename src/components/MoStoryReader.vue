<template>
  <div class="story-reader" :class="{ 'is-panel': panel }">
    <div class="story-image-viewer"></div>
    <MoBackHeader v-if="!panel" border>
      <template v-slot:title>{{ headerTitle }}</template>
      <MoReadingActions
        ref="readingActions"
        :is-favorited="isFavorited"
        :is-fetch-loading="isFetchLoading"
        @font="openReadingFont"
        @fetch="onFetchFulltext"
        @favorite="toggleFavorited"
      />
    </MoBackHeader>
    <MoHeader v-else border class="panel-header">
      <div class="panel-header-inner">
        <div class="panel-title">{{ headerTitle }}</div>
        <MoReadingActions
          ref="readingActions"
          :is-favorited="isFavorited"
          :is-fetch-loading="isFetchLoading"
          @font="openReadingFont"
          @fetch="onFetchFulltext"
          @favorite="toggleFavorited"
        />
      </div>
    </MoHeader>
    <MoReadingFontDialog :open.sync="isFontDialogOpen" />

    <div v-if="panel" class="panel-scroll" ref="scrollRef">
      <div class="panel-column">
        <div v-if="isEmpty" class="panel-empty">
          <div class="panel-empty-meta">{{ unreadText }}<span v-if="latestText"> · {{ latestText }}</span></div>
          <div class="panel-empty-hint">从中间列表选择一篇文章</div>
        </div>
        <div v-else-if="isLoading" class="panel-state">加载中…</div>
        <div v-else-if="isError" class="panel-state">
          <div class="panel-state-text">这篇文章没有加载出来</div>
          <mu-button class="panel-retry" small @click="loadFeedAndStory">重试</mu-button>
        </div>
        <MoStoryContent
          v-else
          :story="story"
          :next-feed="nextFeed"
          :next-story="nextStory"
          :show-next-feed-title="showNextFeedTitle"
          :gotoNextStory="gotoNextStory"
          :image-viewer-container-getter="imageViewerContainerGetter"
        ></MoStoryContent>
      </div>
    </div>

    <MoStoryContent
      v-else
      ref="contentRef"
      :story="story"
      :next-feed="nextFeed"
      :next-story="nextStory"
      :show-next-feed-title="showNextFeedTitle"
      :gotoNextStory="gotoNextStory"
      :image-viewer-container-getter="imageViewerContainerGetter"
    ></MoStoryContent>
  </div>
</template>

<script>
import _ from 'lodash'
import { formatDateFriendly } from '@/plugin/datefmt'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoHeader from '@/components/MoHeader.vue'
import MoReadingActions from '@/components/MoReadingActions.vue'
import MoReadingFontDialog from '@/components/MoReadingFontDialog.vue'
import MoStoryContent from '@/components/MoStoryContent.vue'
import { storyStore, isNewFirst } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  name: 'MoStoryReader',
  components: { MoBackHeader, MoHeader, MoReadingActions, MoReadingFontDialog, MoStoryContent },
  props: {
    feedId: {
      type: String,
      default: null,
    },
    offset: {
      type: Number,
      default: null,
    },
    // 三栏阅读的右栏：无返回箭头、正文限宽居中、带空/加载/失败态
    panel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFetchLoading: false,
      isFontDialogOpen: false,
      isLoading: false,
      isError: false,
    }
  },
  computed: {
    isEmpty() {
      return _.isNil(this.offset)
    },
    feed() {
      return _.isNil(this.feedId) ? null : feedStore.get(this.feedId)
    },
    isFavorited() {
      return !_.isNil(this.story) && this.story.is_favorited
    },
    isReaded() {
      if (_.isNil(this.feed) || _.isNil(this.story)) {
        return false
      }
      return this.story.is_read || this.story.offset < this.feed.story_offset
    },
    // 切换文章时只触发一次加载；feedId 和 offset 同时变时不重复请求
    storyKey() {
      return `${this.feedId}:${this.offset}`
    },
    story() {
      if (_.isNil(this.offset)) {
        return null
      }
      return storyStore.get({ feedId: this.feedId, offset: this.offset })
    },
    nextStoryInfo() {
      return storyStore.nextStoryInfo({ feedId: this.feedId, offset: this.offset })
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
    unreadText() {
      if (_.isNil(this.feed)) {
        return ''
      }
      return `${this.feed.num_unread_storys} 篇未读`
    },
    latestText() {
      if (_.isNil(this.feed) || _.isEmpty(this.feed.dt_latest_story_published)) {
        return ''
      }
      return `最近更新 ${formatDateFriendly(this.feed.dt_latest_story_published)}`
    },
    headerTitle() {
      if (!_.isNil(this.story) && !_.isNil(this.feed)) {
        return `${this.feed.title} - ${this.story.title}`
      } else if (!_.isNil(this.story)) {
        return this.story.title
      } else if (!_.isNil(this.feed)) {
        return this.feed.title
      } else if (!_.isNil(this.offset)) {
        return `#${this.feedId}-${this.offset}`
      }
      return '文章'
    },
  },
  watch: {
    storyKey() {
      this.loadFeedAndStory()
    },
    isFontDialogOpen(value) {
      if (!value && this.$refs.readingActions) {
        this.$refs.readingActions.focusMoreButtonAfterDialog()
      }
    },
  },
  async mounted() {
    await this.loadFeedAndStory()
    await rootStore.syncFeedLoadMushrooms()
  },
  methods: {
    imageViewerContainerGetter() {
      return this.$el.querySelector('.story-image-viewer')
    },
    openReadingFont() {
      this.isFontDialogOpen = true
    },
    gotoNextStory() {
      let next = this.nextStoryInfo.story
      if (_.isNil(next)) {
        return
      }
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, feed: next.feed.id, offset: next.offset },
      })
    },
    toggleFavorited() {
      if (_.isNil(this.story)) {
        return
      }
      let is_favorited = !this.isFavorited
      storyStore.setFavorited({ feedId: this.feedId, offset: this.offset, is_favorited })
    },
    async onFetchFulltext() {
      if (this.isFetchLoading || _.isNil(this.story)) {
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
            this.$toast.info('抓取全文: 内容没有变化')
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
      if (_.isNil(this.feedId)) {
        return
      }
      this.isError = false
      if (this.isEmpty) {
        // 三栏右栏未选文章时只加载订阅信息
        try {
          await this.loadFeed({ feed: this.feed, feedId: this.feedId })
        } catch (err) {
          this.isError = true
        }
        return
      }
      let isLoading = _.isNil(this.story) || _.isEmpty(this.story.content)
      this.isLoading = isLoading
      try {
        await this.loadFeed({ feed: this.feed, feedId: this.feedId })
        await this.loadStory({
          story: this.story,
          feedId: this.feedId,
          offset: this.offset,
          setReaded: !this.isReaded,
        })
        // 当 story 已加载但仍未读时，loadStory 不会更新已读状态，需要单独更新
        if (!_.isNil(this.feed) && !_.isNil(this.story) && !this.isReaded) {
          if (isNewFirst()) {
            // 先看最新：只标当前这一篇，不推进未读游标
            await storyStore.setRead({ feedId: this.feedId, offset: this.offset, is_read: true })
          } else {
            feedStore.setStoryOffset({ feedId: this.feedId, offset: this.offset + 1 })
          }
        }
      } catch (err) {
        this.isError = true
      }
      this.isLoading = false
      this.scrollToTop()
      // 预加载下一篇失败不影响当前文章
      if (!this.isError) {
        this.preloadNextStory()
      }
    },
    async preloadNextStory() {
      if (!this.nextStoryInfo.shouldLoadNext || _.isNil(this.feed)) {
        return
      }
      try {
        let nextOffset = isNewFirst() ? this.offset - 1 : this.offset + 1
        let hasNext = nextOffset >= 0 && nextOffset < this.feed.total_storys
        if (!hasNext) {
          return
        }
        let next = storyStore.get({ feedId: this.feedId, offset: nextOffset })
        await this.loadStory({ story: next, feedId: this.feedId, offset: nextOffset })
      } catch (err) {
        // 预加载失败忽略，打开下一篇时会重试
      }
    },
    scrollToTop() {
      if (this.panel) {
        let el = this.$refs.scrollRef
        if (!_.isNil(el)) {
          el.scrollTo(0, 0)
        }
        return
      }
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

.panel-header {
  padding: 0;
  max-width: none;
}

.panel-header-inner {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 728px;
  margin: 0 auto;
  padding: 0 24px;
}

.panel-title {
  flex-grow: 1;
  min-width: 0;
  font-size: 16 * @pr;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16 * @pr;
}

.panel-scroll {
  position: absolute;
  top: 48 * @pr;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.panel-column {
  max-width: 728px;
  margin: 0 auto;
  padding: 0 24px;

  /deep/ .story-info {
    padding-left: 0;
    padding-right: 0;
  }

  /deep/ .content {
    padding-left: 0;
    padding-right: 0;
  }
}

.panel-empty {
  padding-top: 24 * @pr;
}

.panel-empty-meta {
  font-size: 13 * @pr;
  color: @antTextGrey;
}

.panel-empty-hint {
  margin-top: 24 * @pr;
  font-size: 15 * @pr;
  color: @antTextLight;
}

.panel-state {
  padding-top: 24 * @pr;
  color: @antTextGrey;
  font-size: 15 * @pr;
}

.panel-state-text {
  margin-bottom: 12 * @pr;
}
</style>
