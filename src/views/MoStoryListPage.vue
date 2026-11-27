<template>
  <MoLayout grey header>
    <MoBackHeader border :is-home="readerMode">
      <template v-slot:title>{{ numUnreadText }}{{ feedTitle }}</template>
      <MoReadedButton @click="setAllReaded" class="action-readed"></MoReadedButton>
      <mu-button icon class="action-detail" @click="goFeedDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <MoScrollList
      v-if="feed"
      ref="scrollList"
      class="story-list"
      :vid="`/feed?id=${feedId}`"
      :itemSize="itemSize"
      :items="storyList"
      :reversed="isNewFirst"
      :init-offset="initOffset"
      :begin-offset="beginOffset"
      :end-offset="endOffset"
      :total="feed.total_storys"
      :load="loadStorys"
      :jump="isNewFirst ? null : onJump"
      :enable-unread-pad="!isNewFirst"
      :load-prev-enabled="!isNewFirst && isDesktop"
    >
      <MoStoryItem
        v-for="story in storyList"
        :key="story.offset"
        :class="{ 'reader-active': isCurrentStory(story) }"
        :solo="readerMode"
        :isOpened="!readerMode && storyOpened[story.offset]"
        @update:isOpened="onUpdateOpened(story, $event)"
        @click="onSelectStory(story)"
        :preview="isPreviewMode"
        :isReaded="isReaded(story)"
        :isReading="!readerMode && isReading(story)"
        :isFavorited="story.is_favorited"
        :feedId="feedId"
        :offset="story.offset"
        :story="story"
        :isCtrlKeyHold="keyboard.isCtrlKeyHold"
        @read="onRead(story)"
        @toggleFavorited="toggleFavorited(story)"
      ></MoStoryItem>
    </MoScrollList>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoStoryItem from '@/components/MoStoryItem'
import MoScrollList from '@/components/MoScrollList'
import MoReadedButton from '@/components/MoReadedButton'
import Keyboard from '@/plugin/keyboard'
import localConfig from '@/plugin/localConfig'
import { storyStore, isNewFirst } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'
import { pageStore } from '@/store/page'

export default {
  components: { MoBackHeader, MoLayout, MoStoryItem, MoScrollList, MoReadedButton },
  data() {
    // 在组件创建时就取恢复位置：mescroll 的 init 早于 mounted，晚取会按默认位置滚动
    let page = pageStore.getPage(`/feed?id=${this.$route.query.id}`)
    return {
      storyOpened: {},
      readingStoryOffset: null,
      restoreOffset: _.isNil(page) ? null : page.topOffset,
      keyboard: Keyboard(),
    }
  },
  computed: {
    readerMode() {
      return this.$LAYOUT.isReader
    },
    readerOffset() {
      let offset = parseInt(this.$route.query.offset)
      return Number.isNaN(offset) ? null : offset
    },
    feedId() {
      return this.$route.query.id
    },
    viewKey() {
      return `/feed?id=${this.feedId}`
    },
    feed() {
      return feedStore.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
    },
    numUnreadText() {
      if (_.isNil(this.feed)) {
        return ''
      }
      let num = this.feed.num_unread_storys
      return num > 0 ? `#${num}# ` : ''
    },
    beginOffset() {
      let offset = storyStore.loadedOffset(this.feedId)
      return _.isNil(offset) ? null : offset.begin
    },
    endOffset() {
      let offset = storyStore.loadedOffset(this.feedId)
      return _.isNil(offset) ? null : offset.end
    },
    storyList() {
      let offset = storyStore.loadedOffset(this.feedId)
      if (_.isNil(offset) || _.isNil(offset.begin) || _.isNil(offset.end)) {
        return []
      }
      let storys = storyStore.getListByFeed(this.feedId)
      return _.filter(storys, (s) => {
        return s.offset >= offset.begin && s.offset <= offset.end
      })
    },
    isNewFirst() {
      return isNewFirst()
    },
    isPreviewMode() {
      return localConfig.ARTICLE_LIST_CONTENT.get() === 'summary'
    },
    itemSize() {
      // 摘要模式：条目 122px + 8px 条缝；标题模式沿用 48px
      return this.isPreviewMode ? 130 : 48
    },
    isDesktop() {
      // 手机有下拉加载，列表里不再重复一个「加载更早」入口，否则短列表会默认露出来顶掉第一行
      return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    },
    initOffset() {
      if (!_.isNil(this.restoreOffset)) {
        return this.restoreOffset
      }
      if (this.isNewFirst) {
        return Math.max(0, this.feed.total_storys - 1)
      }
      return this.feed.story_offset
    },
    isReaded() {
      let feed = this.feed
      return (story) => {
        return story.is_read || story.offset < feed.story_offset
      }
    },
    lastReadingOffset() {
      let page = pageStore.getPage(this.viewKey)
      return _.isNil(page) ? null : page.readingOffset
    },
    isReading() {
      let feed = this.feed
      let lastReadingOffset = this.lastReadingOffset
      return (story) => {
        if (this.isNewFirst) {
          // 最新在前：未读游标不动，用最后打开的文章高亮
          return !_.isNil(lastReadingOffset) && story.offset === lastReadingOffset
        }
        let isReading = !_.isNil(this.readingStoryOffset) && story.offset === this.readingStoryOffset
        let isLastOpened = story.offset === feed.story_offset - 1
        return isReading || isLastOpened
      }
    },
  },
  async mounted() {
    if (_.isNil(this.feed)) {
      await feedStore.load({ feedId: this.feedId })
    }
    await rootStore.syncFeedLoadMushrooms()
    this.keyboard.setup()
    storyStore.setNextStoryGetter(this.getNextStoryInfo.bind(this))
  },
  destroyed() {
    this.keyboard.destroy()
  },
  methods: {
    isCurrentStory(story) {
      return this.readerMode && story.feed.id === this.feedId && story.offset === this.readerOffset
    },
    onUpdateOpened(story, isOpened) {
      if (this.readerMode) {
        return
      }
      this.$set(this.storyOpened, story.offset, isOpened)
    },
    onSelectStory(story) {
      if (!this.readerMode) {
        return
      }
      // 记下当前位置，离开三栏或返回列表时能回到这一行
      let scrollList = this.$refs.scrollList
      let topOffset = _.isNil(scrollList) ? null : scrollList.getTopOffset()
      pageStore.setPage(this.viewKey, {
        topOffset: topOffset,
        readingOffset: story.offset,
      })
      this.$router.push({
        path: this.$route.path,
        query: { ...this.$route.query, feed: story.feed.id, offset: story.offset },
      })
    },
    getNextStoryInfo({ feedId, offset }) {
      let nextOffset = this.isNewFirst ? offset - 1 : offset + 1
      if (nextOffset < 0) {
        return { story: null, shouldLoadNext: false }
      }
      let story = storyStore.get({ feedId, offset: nextOffset })
      return { story, shouldLoadNext: true }
    },
    loadStorys({ offset, size, resetLoadedOffset, isInit }) {
      return storyStore.loadList({
        feedId: this.feedId,
        offset: offset,
        detail: true,
        size: size,
        resetLoadedOffset: resetLoadedOffset,
        isInit: isInit,
      })
    },
    onRead(story) {
      let scrollList = this.$refs.scrollList
      let topOffset = _.isNil(scrollList) ? null : scrollList.getTopOffset()
      pageStore.setPage(this.viewKey, {
        topOffset: topOffset,
        readingOffset: story.offset,
      })
      this.readingStoryOffset = story.offset
    },
    setAllReaded() {
      feedStore.setStoryOffset({ feedId: this.feed.id, offset: this.feed.total_storys })
    },
    goFeedDetail() {
      this.$router.push(`/feed-detail?id=${this.feedId}`)
    },
    toggleFavorited(story) {
      let is_favorited = !story.is_favorited
      storyStore.setFavorited({ feedId: story.feed.id, offset: story.offset, is_favorited })
    },
    async onJump(offset) {
      await rootStore.syncFeedLoadMushrooms()
      feedStore.setStoryOffset({ feedId: this.feed.id, offset: offset })
      // close all story cards so that scroll position can be computed correctly
      _.forEach(_.keys(this.storyOpened), (key) => {
        this.storyOpened[key] = false
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed,
.action-detail {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 16 * @pr;
}

.action-detail {
  position: relative;
  right: -4 * @pr;
  color: lighten(@antTextSemi, 5%);
}

.story-item {
  margin-top: 8 * @pr;
}

.story-item.reader-active {
  background: #eef4f8;
}

</style>
