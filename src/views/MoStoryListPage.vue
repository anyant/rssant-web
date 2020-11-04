<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}{{ feedTitle }}</template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <fa-icon icon="check" />
      </mu-button>
      <mu-button icon class="action-detail" @click="goFeedDetail">
        <fa-icon size="18" icon="info-circle" />
      </mu-button>
    </MoBackHeader>
    <MoScrollList
      v-if="feed"
      class="story-list"
      :vid="`/feed/${feedId}`"
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
        :feedId="feedId"
        :offset="story.offset"
        :title="story.title"
        :summary="story.summary"
        :content="story.content"
        :date="story.dt_published"
        :link="story.link"
        :isFavorited="story.is_favorited"
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
import Keyboard from '@/plugin/keyboard'

export default {
  components: { MoBackHeader, MoLayout, MoStoryItem, MoScrollList },
  data() {
    return {
      storyOpened: {},
      keyboard: Keyboard(),
    }
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
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
      let offset = this.$API.story.loadedOffset(this.feedId)
      return _.isNil(offset) ? null : offset.begin
    },
    endOffset() {
      let offset = this.$API.story.loadedOffset(this.feedId)
      return _.isNil(offset) ? null : offset.end
    },
    storyList() {
      let offset = this.$API.story.loadedOffset(this.feedId)
      if (_.isNil(offset) || _.isNil(offset.begin) || _.isNil(offset.end)) {
        return []
      }
      let storys = this.$API.story.getListByFeed(this.feedId)
      return _.filter(storys, s => {
        return s.offset >= offset.begin && s.offset <= offset.end
      })
    },
    isReaded() {
      let feed = this.feed
      return story => {
        return story.offset < feed.story_offset
      }
    },
    isReading() {
      let feed = this.feed
      return story => {
        return story.offset === feed.story_offset - 1
      }
    },
  },
  async mounted() {
    if (_.isNil(this.feed)) {
      await this.$API.feed.load({ feedId: this.feedId })
    }
    await this.$API.syncFeedLoadMushrooms()
    this.keyboard.setup()
  },
  destroyed() {
    this.keyboard.destroy()
  },
  methods: {
    loadStorys({ offset, size, resetLoadedOffset }) {
      return this.$API.story.loadList({
        feedId: this.feedId,
        offset: offset,
        detail: true,
        size: size,
        resetLoadedOffset: resetLoadedOffset,
      })
    },
    onRead(story) {
      if (!this.isReaded(story)) {
        this.$API.feed.setStoryOffset({ feedId: story.feed.id, offset: story.offset + 1 })
      }
    },
    setAllReaded() {
      this.$API.feed.setStoryOffset({ feedId: this.feed.id, offset: this.feed.total_storys })
    },
    goFeedDetail() {
      this.$router.push(`/feed/${this.feedId}/detail`)
    },
    toggleFavorited(story) {
      let is_favorited = !story.is_favorited
      this.$API.story.setFavorited({ feedId: story.feed.id, offset: story.offset, is_favorited })
    },
    async onJump(offset) {
      await this.$API.syncFeedLoadMushrooms()
      this.$API.feed.setStoryOffset({ feedId: this.feed.id, offset: offset })
      // close all story cards so that scroll position can be computed correctly
      _.forEach(_.keys(this.storyOpened), key => {
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
