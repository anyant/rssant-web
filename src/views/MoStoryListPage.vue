<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}{{ feedTitle }}</template>
      <MoReadedButton @click="setAllReaded" class="action-readed"></MoReadedButton>
      <mu-button icon class="action-detail" @click="goFeedDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <MoScrollList
      v-if="feed"
      class="story-list"
      :vid="`/feed?id=${feedId}`"
      :itemSize="48"
      :items="storyList"
      :init-offset="feed.story_offset"
      :begin-offset="beginOffset"
      :end-offset="endOffset"
      :total="feed.total_storys"
      :load="loadStorys"
      :jump="onJump"
    >
      <MoStoryItem
        v-for="story in storyList"
        :key="story.offset"
        :isOpened.sync="storyOpened[story.offset]"
        :isReaded="isReaded(story)"
        :isReading="isReading(story)"
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
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'

export default {
  components: { MoBackHeader, MoLayout, MoStoryItem, MoScrollList, MoReadedButton },
  data() {
    return {
      storyOpened: {},
      readingStoryOffset: null,
      keyboard: Keyboard(),
    }
  },
  computed: {
    feedId() {
      return this.$route.query.id
    },
    feed() {
      return this.$API.feed.get(this.feedId)
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
    isReaded() {
      let feed = this.feed
      return (story) => {
        return story.offset < feed.story_offset
      }
    },
    isReading() {
      let feed = this.feed
      return (story) => {
        let isReading = !_.isNil(this.readingStoryOffset) && story.offset === this.readingStoryOffset
        let isLastOpened = story.offset === feed.story_offset - 1
        return isReading || isLastOpened
      }
    },
  },
  async mounted() {
    if (_.isNil(this.feed)) {
      await this.$API.feed.load({ feedId: this.feedId })
    }
    await rootStore.syncFeedLoadMushrooms()
    this.keyboard.setup()
    storyStore.setNextStoryGetter(this.getNextStoryInfo.bind(this))
  },
  destroyed() {
    this.keyboard.destroy()
  },
  methods: {
    getNextStoryInfo({ feedId, offset }) {
      let story = storyStore.get({ feedId, offset: offset + 1 })
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
      this.readingStoryOffset = story.offset
    },
    setAllReaded() {
      this.$API.feed.setStoryOffset({ feedId: this.feed.id, offset: this.feed.total_storys })
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
      this.$API.feed.setStoryOffset({ feedId: this.feed.id, offset: offset })
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
</style>
